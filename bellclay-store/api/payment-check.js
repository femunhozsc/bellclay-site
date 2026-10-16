const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'bellclay-artesanatos';

async function markOrderAsPaidInFirestore(orderId, details = {}) {
  if (!orderId) return false;

  const resolvedMethod =
    details.captureMethod === 'pix'
      ? 'pix'
      : details.captureMethod === 'credit_card'
      ? 'credit_card'
      : undefined;

  const fields = {
    orderStatus: { stringValue: 'paid' },
    paymentStatus: { stringValue: 'approved' },
    updatedAt: { stringValue: new Date().toISOString() }
  };

  const maskParams = [
    'updateMask.fieldPaths=orderStatus',
    'updateMask.fieldPaths=paymentStatus',
    'updateMask.fieldPaths=updatedAt'
  ];

  if (resolvedMethod) {
    fields.paymentMethod = { stringValue: resolvedMethod };
    maskParams.push('updateMask.fieldPaths=paymentMethod');
  }
  if (details.receiptUrl) {
    fields.receiptUrl = { stringValue: String(details.receiptUrl) };
    maskParams.push('updateMask.fieldPaths=receiptUrl');
  }
  if (details.transactionNsu) {
    fields.transactionNsu = { stringValue: String(details.transactionNsu) };
    maskParams.push('updateMask.fieldPaths=transactionNsu');
  }
  if (details.slug) {
    fields.infinitePaySlug = { stringValue: String(details.slug) };
    maskParams.push('updateMask.fieldPaths=infinitePaySlug');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/orders/${encodeURIComponent(
    orderId
  )}?${maskParams.join('&')}`;

  const resp = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields })
  });

  return resp.ok;
}

export default async function handler(req, res) {
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
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const {
      handle,
      order_nsu,
      transaction_nsu,
      slug,
      capture_method,
      receipt_url
    } = body;

    const cleanHandle = String(handle || process.env.INFINITEPAY_TAG || 'isabela-munhoz-4sb')
      .trim()
      .replace(/^[$@]+/, '');

    let paid = false;
    let checkData = null;

    if (order_nsu && (transaction_nsu || slug)) {
      try {
        const checkResp = await fetch('https://api.checkout.infinitepay.io/payment_check', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            handle: cleanHandle,
            order_nsu: String(order_nsu),
            ...(transaction_nsu ? { transaction_nsu: String(transaction_nsu) } : {}),
            ...(slug ? { slug: String(slug) } : {})
          })
        });

        if (checkResp.ok) {
          checkData = await checkResp.json();
          if (checkData && checkData.paid === true) {
            paid = true;
          }
        }
      } catch (e) {
        console.warn('Aviso ao consultar /payment_check:', e);
      }
    }

    // If InfinitePay redirected back with transaction_nsu & receipt_url, or payment_check confirmed paid
    if (!paid && transaction_nsu && (receipt_url || capture_method)) {
      paid = true;
    }

    if (paid && order_nsu) {
      await markOrderAsPaidInFirestore(String(order_nsu), {
        captureMethod: capture_method,
        receiptUrl: receipt_url,
        transactionNsu: transaction_nsu,
        slug
      });
    }

    return res.status(200).json({
      success: true,
      paid,
      details: checkData
    });
  } catch (err) {
    console.error('Erro em /api/payment-check:', err);
    return res.status(500).json({
      success: false,
      paid: false,
      error: err?.message || String(err)
    });
  }
}
