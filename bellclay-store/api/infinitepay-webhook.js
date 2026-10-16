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
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const query = req.query || {};

    const orderNsu = body.order_nsu || body.orderId || query.order_nsu || query.orderId;
    const transactionNsu = body.transaction_nsu || body.transactionNsu || query.transaction_nsu;
    const slug = body.slug || body.invoice_slug || query.slug;
    const captureMethod = body.capture_method || body.payment_method || query.capture_method;
    const receiptUrl = body.receipt_url || query.receipt_url;

    // InfinitePay sends webhook notifications when a payment is approved
    const isPaid =
      body.paid === true ||
      body.approved === true ||
      body.status === 'paid' ||
      body.status === 'approved' ||
      Boolean(transactionNsu) ||
      Boolean(receiptUrl);

    if (orderNsu && isPaid) {
      await markOrderAsPaidInFirestore(String(orderNsu), {
        captureMethod,
        receiptUrl,
        transactionNsu,
        slug
      });
    }

    return res.status(200).json({
      success: true,
      order_nsu: orderNsu || null,
      updated: Boolean(orderNsu && isPaid)
    });
  } catch (err) {
    console.error('Erro no webhook InfinitePay:', err);
    return res.status(200).json({
      success: false,
      error: err?.message || String(err)
    });
  }
}
