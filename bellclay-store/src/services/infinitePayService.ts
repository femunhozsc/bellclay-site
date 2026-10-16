import { CartItem, CustomerInfo, Address, ShippingOption } from '../types';

export interface CreateInfinitePayCheckoutParams {
  handle: string;
  orderId: string;
  customer: CustomerInfo;
  address: Address;
  items: CartItem[];
  shipping: ShippingOption;
  discount: number;
  grandTotal: number;
}

export interface InfinitePayCheckoutResult {
  checkoutUrl: string;
  orderId: string;
}

export const createInfinitePayCheckout = async (
  params: CreateInfinitePayCheckoutParams
): Promise<InfinitePayCheckoutResult> => {
  const {
    handle,
    orderId,
    customer,
    address,
    items,
    shipping,
    discount,
    grandTotal
  } = params;

  const cleanHandle = (handle || 'isabela-munhoz-4sb').trim().replace(/^[$@]+/, '');

  // Build items in cents ensuring exact match with grandTotal
  let apiItems: Array<{ name: string; description: string; quantity: number; price: number }> = [];

  if (discount <= 0) {
    apiItems = items.map((item) => {
      const unitPrice = item.product.promotionalPrice || item.product.price;
      const label = item.customObservation
        ? `${item.product.title} (${item.customObservation})`
        : item.product.title;
      return {
        name: label,
        description: label,
        quantity: item.quantity,
        price: Math.max(1, Math.round(unitPrice * 100))
      };
    });

    if (shipping && shipping.price > 0) {
      apiItems.push({
        name: `Frete - ${shipping.name}`,
        description: `Frete - ${shipping.name} (${shipping.company})`,
        quantity: 1,
        price: Math.round(shipping.price * 100)
      });
    }
  } else {
    // When a discount is applied, consolidate so total in cents matches grandTotal 100%
    const summaryNames = items
      .map((i) => `${i.quantity}x ${i.product.title}`)
      .join(', ');
    const fullDesc =
      shipping && shipping.price > 0
        ? `Pedido #${orderId}: ${summaryNames} + Frete (${shipping.name})`
        : `Pedido #${orderId}: ${summaryNames}`;

    apiItems = [
      {
        name: fullDesc.slice(0, 115),
        description: fullDesc.slice(0, 115),
        quantity: 1,
        price: Math.max(100, Math.round(grandTotal * 100))
      }
    ];
  }

  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      handle: cleanHandle,
      orderId,
      customer,
      address,
      items: apiItems,
      origin: window.location.origin
    })
  });

  const data = await response.json();

  if (!response.ok || !data.checkoutUrl) {
    throw new Error(data?.error || 'Não foi possível iniciar o checkout da InfinitePay.');
  }

  return {
    checkoutUrl: data.checkoutUrl,
    orderId: data.orderId || orderId
  };
};

export const checkInfinitePayPayment = async (params: {
  handle?: string;
  orderNsu: string;
  transactionNsu?: string;
  slug?: string;
  captureMethod?: string;
  receiptUrl?: string;
}): Promise<{ success: boolean; paid: boolean }> => {
  try {
    const cleanHandle = (params.handle || 'isabela-munhoz-4sb').trim().replace(/^[$@]+/, '');
    const response = await fetch('/api/payment-check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        handle: cleanHandle,
        order_nsu: params.orderNsu,
        transaction_nsu: params.transactionNsu,
        slug: params.slug,
        capture_method: params.captureMethod,
        receipt_url: params.receiptUrl
      })
    });

    if (!response.ok) {
      return { success: false, paid: false };
    }

    const data = await response.json();
    return {
      success: Boolean(data.success),
      paid: Boolean(data.paid)
    };
  } catch (err) {
    console.warn('Erro ao verificar status na InfinitePay:', err);
    return { success: false, paid: false };
  }
};
