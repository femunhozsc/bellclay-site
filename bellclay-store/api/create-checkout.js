export default async function handler(req, res) {
  // Enable CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const {
      handle,
      orderId,
      customer,
      address,
      items,
      origin
    } = body || {};

    const cleanHandle = String(handle || process.env.INFINITEPAY_TAG || 'isabela-munhoz-4sb')
      .trim()
      .replace(/^[$@]+/, '');

    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const baseOrigin = (origin || `${protocol}://${host}`).replace(/\/$/, '');

    // Format phone to +55XXXXXXXXXXX
    const rawPhone = String(customer?.phone || '').replace(/\D/g, '');
    let formattedPhone = undefined;
    if (rawPhone.length >= 10) {
      formattedPhone = rawPhone.startsWith('55') && rawPhone.length >= 12
        ? `+${rawPhone}`
        : `+55${rawPhone}`;
    }

    const cleanCep = String(address?.cep || '').replace(/\D/g, '');

    const formattedItems = Array.isArray(items) && items.length > 0
      ? items.map((item) => ({
          name: String(item.name || item.description || 'Peça Bellclay Artesanatos').slice(0, 120),
          description: String(item.description || item.name || 'Peça Bellclay Artesanatos').slice(0, 120),
          quantity: Math.max(1, Number(item.quantity) || 1),
          price: Math.max(1, Math.round(Number(item.price) || 100))
        }))
      : [
          {
            name: `Pedido #${orderId}`,
            description: `Pedido #${orderId} - Bellclay Artesanatos`,
            quantity: 1,
            price: 100
          }
        ];

    const payload = {
      handle: cleanHandle,
      redirect_url: `${baseOrigin}/checkout?order_nsu=${encodeURIComponent(String(orderId))}`,
      webhook_url: `${baseOrigin}/api/infinitepay-webhook`,
      order_nsu: String(orderId),
      customer: {
        name: String(customer?.name || 'Cliente Bellclay').trim(),
        email: String(customer?.email || 'contato@bellclay.com.br').trim(),
        ...(formattedPhone ? { phone_number: formattedPhone } : {})
      },
      ...(cleanCep.length === 8
        ? {
            address: {
              cep: cleanCep,
              number: String(address?.number || 'S/N').trim(),
              ...(address?.complement ? { complement: String(address.complement).trim() } : {})
            }
          }
        : {}),
      items: formattedItems
    };

    const response = await fetch('https://api.checkout.infinitepay.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    let data = {};
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    if (!response.ok || !data.url) {
      console.error('Erro InfinitePay /links:', response.status, data);
      return res.status(response.status || 500).json({
        error: 'Não foi possível gerar o link de pagamento na InfinitePay.',
        details: data
      });
    }

    return res.status(200).json({
      checkoutUrl: data.url,
      orderId: String(orderId)
    });
  } catch (err) {
    console.error('Exceção em /api/create-checkout:', err);
    return res.status(500).json({
      error: 'Erro interno ao comunicar com a InfinitePay.',
      message: err?.message || String(err)
    });
  }
}
