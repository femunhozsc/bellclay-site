import { CartItem, ShippingOption } from '../types';
import { fetchAddressByCep } from './viaCepService';

export interface ShippingCalculationParams {
  destinationCep: string;
  items: CartItem[];
  originCep?: string;
  freeShippingThreshold?: number;
  melhorEnvioToken?: string;
}

export const calculateShipping = async ({
  destinationCep,
  items,
  originCep = '87302060',
  freeShippingThreshold = 150,
  melhorEnvioToken
}: ShippingCalculationParams): Promise<ShippingOption[]> => {
  const cleanDestCep = destinationCep.replace(/\D/g, '');
  if (cleanDestCep.length !== 8) return [];

  const subtotal = items.reduce((acc, item) => {
    const p = item.product.promotionalPrice ?? item.product.price;
    return acc + p * item.quantity;
  }, 0);

  const totalWeightKg = items.reduce((acc, item) => {
    return acc + (item.product.weightKg || 0.05) * item.quantity;
  }, 0);

  // Address and State lookup
  const addressInfo = await fetchAddressByCep(cleanDestCep);
  const state = addressInfo?.uf?.toUpperCase() || getUfFromCepPrefix(cleanDestCep);
  const isCampoMourao = Boolean(
    addressInfo?.localidade?.toLowerCase().includes('campo mourão') ||
    cleanDestCep.startsWith('8730') ||
    cleanDestCep.startsWith('8731')
  );

  const rawThreshold = Number(freeShippingThreshold);
  const minOrderValue = !isNaN(rawThreshold) && rawThreshold > 0 ? rawThreshold : 150;
  const reachedThreshold = subtotal >= minOrderValue;

  // If live Melhor Envio token is configured, try direct API first
  if (melhorEnvioToken && melhorEnvioToken.trim().length > 15) {
    try {
      const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${melhorEnvioToken}`
        },
        body: JSON.stringify({
          from: { postal_code: originCep },
          to: { postal_code: cleanDestCep },
          products: items.map(item => ({
            id: item.product.id,
            width: item.product.dimensions?.widthCm || 10,
            height: item.product.dimensions?.heightCm || 5,
            length: item.product.dimensions?.lengthCm || 15,
            weight: item.product.weightKg || 0.05,
            insurance_value: (item.product.promotionalPrice || item.product.price) * item.quantity,
            quantity: item.quantity
          }))
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const apiOptions: ShippingOption[] = data
            .filter((item: any) => !item.error && item.price)
            .map((item: any) => {
              const originalPrice = parseFloat(item.price);
              const isMini = item.name?.toLowerCase().includes('mini');
              const isPac = item.name?.toLowerCase().includes('pac');

              // Regra de Frete Grátis: Apenas se atingir o valor mínimo E (estado for PR OU mini envios < R$ 15)
              let isFree = false;
              if (reachedThreshold) {
                if (state === 'PR' && (isMini || isPac)) {
                  isFree = true;
                } else if (isMini && originalPrice < 15) {
                  isFree = true;
                }
              }

              const finalPrice = isFree ? 0 : originalPrice;
              return {
                id: `me-${item.id}`,
                name: item.name,
                company: item.company?.name || 'Melhor Envio',
                price: finalPrice,
                deliveryDays: item.delivery_time || 5,
                badge: finalPrice === 0 ? 'Grátis' : undefined,
                serviceCode: String(item.id)
              };
            });

          if (apiOptions.length > 0) {
            // Check Campo Mourão pickup
            if (isCampoMourao) {
              apiOptions.unshift({
                id: 'pickup-cm',
                name: 'Retirada ou entrega em Campo Mourão',
                company: 'Bellclay Campo Mourão',
                price: 0,
                deliveryDays: 1,
                badge: 'Grátis'
              });
            }
            return apiOptions;
          }
        }
      }
    } catch (err) {
      console.warn('Melhor Envio API indisponível, usando cálculo inteligente regional:', err);
    }
  }

  // Fallback intelligent & accurate calculation engine
  // Calibrated for Campo Mourão (PR 87302-060) to Brazil destinations
  const options: ShippingOption[] = [];

  // Local Pickup in Campo Mourão
  if (isCampoMourao) {
    options.push({
      id: 'pickup-local',
      name: 'Retirada ou entrega em Campo Mourão',
      company: 'Bellclay Artesanatos',
      price: 0,
      deliveryDays: 1,
      badge: 'Grátis'
    });
  }

  // Regional Matrix
  let pacBase = 22.90;
  let sedexBase = 32.90;
  let miniBase = 14.90;
  let jadlogBase = 21.50;
  let pacDays = 5;
  let sedexDays = 2;
  let miniDays = 6;
  let jadlogDays = 4;

  if (state === 'PR') {
    pacBase = isCampoMourao ? 12.90 : 16.50;
    sedexBase = isCampoMourao ? 18.00 : 21.90;
    miniBase = 11.90;
    jadlogBase = 15.80;
    pacDays = 3;
    sedexDays = 1;
    miniDays = 4;
    jadlogDays = 2;
  } else if (state === 'SP' || state === 'SC' || state === 'RS') {
    pacBase = 22.90;
    sedexBase = 34.90;
    miniBase = 14.90;
    jadlogBase = 22.00;
    pacDays = 5;
    sedexDays = 2;
    miniDays = 6;
    jadlogDays = 4;
  } else if (state === 'RJ' || state === 'MG' || state === 'MS' || state === 'ES' || state === 'GO' || state === 'DF') {
    pacBase = 26.90;
    sedexBase = 42.50;
    miniBase = 16.90;
    jadlogBase = 27.00;
    pacDays = 6;
    sedexDays = 3;
    miniDays = 7;
    jadlogDays = 5;
  } else if (['BA', 'PE', 'CE', 'RN', 'PB', 'AL', 'SE', 'PI', 'MA', 'MT'].includes(state)) {
    pacBase = 34.90;
    sedexBase = 58.00;
    miniBase = 19.90;
    jadlogBase = 36.00;
    pacDays = 8;
    sedexDays = 4;
    miniDays = 9;
    jadlogDays = 7;
  } else {
    // Norte / Extremo
    pacBase = 44.90;
    sedexBase = 74.00;
    miniBase = 24.90;
    jadlogBase = 48.00;
    pacDays = 11;
    sedexDays = 5;
    miniDays = 12;
    jadlogDays = 9;
  }

  // Weight adjustments
  const extraWeight = Math.max(0, totalWeightKg - 0.3);
  const weightSurcharge = Math.round(extraWeight * 12 * 100) / 100;

  pacBase += weightSurcharge;
  sedexBase += weightSurcharge * 1.5;
  jadlogBase += weightSurcharge;

  // Regra de Frete Grátis:
  // Frete grátis apenas se atingir a meta do pedido E (estado for PR OU mini envios < R$ 15,00)
  const isMiniFree = reachedThreshold && (state === 'PR' || miniBase < 15);
  const isPacFree = reachedThreshold && (state === 'PR' && totalWeightKg > 0.3);

  // Option 1: Correios Mini Envios (If light crafts <= 300g)
  if (totalWeightKg <= 0.3) {
    options.push({
      id: 'correios-mini',
      name: 'Correios Mini Envios (Artesanatos Leves)',
      company: 'Correios',
      price: isMiniFree ? 0 : Number(miniBase.toFixed(2)),
      deliveryDays: miniDays,
      badge: isMiniFree ? 'Grátis' : 'Mais Econômico',
      serviceCode: '04227'
    });
  }

  // Option 2: Correios PAC
  options.push({
    id: 'correios-pac',
    name: 'Correios PAC Econômico',
    company: 'Correios',
    price: isPacFree ? 0 : Number(pacBase.toFixed(2)),
    deliveryDays: pacDays,
    badge: isPacFree ? 'Grátis' : (totalWeightKg > 0.3 ? 'Mais Econômico' : undefined),
    serviceCode: '04510'
  });

  // Option 3: Correios SEDEX
  options.push({
    id: 'correios-sedex',
    name: 'Correios SEDEX Expresso',
    company: 'Correios',
    price: Number(sedexBase.toFixed(2)),
    deliveryDays: sedexDays,
    badge: 'Mais Rápido',
    serviceCode: '04014'
  });

  // Option 4: Jadlog .Package
  options.push({
    id: 'jadlog-package',
    name: 'Jadlog .Package (Melhor Envio)',
    company: 'Jadlog',
    price: Number(jadlogBase.toFixed(2)),
    deliveryDays: jadlogDays,
    serviceCode: 'JAD_PKG'
  });

  return options;
};

function getUfFromCepPrefix(cep: string): string {
  if (!cep || cep.length < 2) return 'OUTRO';
  const prefix = parseInt(cep.substring(0, 2), 10);
  if (prefix >= 1 && prefix <= 19) return 'SP';
  if (prefix >= 20 && prefix <= 28) return 'RJ';
  if (prefix === 29) return 'ES';
  if (prefix >= 30 && prefix <= 39) return 'MG';
  if (prefix >= 40 && prefix <= 48) return 'BA';
  if (prefix === 49) return 'SE';
  if (prefix >= 50 && prefix <= 56) return 'PE';
  if (prefix === 57) return 'AL';
  if (prefix === 58) return 'PB';
  if (prefix === 59) return 'RN';
  if (prefix >= 60 && prefix <= 63) return 'CE';
  if (prefix === 64) return 'PI';
  if (prefix === 65) return 'MA';
  if (prefix >= 66 && prefix <= 68) return 'PA';
  if (prefix === 68) return 'AP';
  if (prefix === 69) return 'AM';
  if (prefix >= 70 && prefix <= 73) return 'DF';
  if (prefix >= 74 && prefix <= 76) return 'GO';
  if (prefix === 77) return 'TO';
  if (prefix === 78) return 'MT';
  if (prefix === 79) return 'MS';
  if (prefix >= 80 && prefix <= 87) return 'PR';
  if (prefix >= 88 && prefix <= 89) return 'SC';
  if (prefix >= 90 && prefix <= 99) return 'RS';
  return 'OUTRO';
}
