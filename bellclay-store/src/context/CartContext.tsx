import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ShippingOption } from '../types';
import { calculateShipping } from '../services/shippingService';
import { trackEvent } from '../services/firebase';
import { useSettings } from './SettingsContext';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, customObservation?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  subtotal: number;
  totalItems: number;
  freeShippingThreshold: number;
  freeShippingProgress: number;
  freeShippingRemaining: number;
  destinationCep: string;
  setDestinationCep: (cep: string) => void;
  shippingOptions: ShippingOption[];
  selectedShipping: ShippingOption | null;
  setSelectedShipping: (option: ShippingOption | null) => void;
  isCalculatingShipping: boolean;
  calculateFreight: (cep: string) => Promise<void>;
  shippingError: string | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode; freeShippingThreshold?: number }> = ({
  children,
  freeShippingThreshold: propThreshold
}) => {
  const { settings } = useSettings();
  const rawThreshold = Number(propThreshold ?? settings?.freeShippingThreshold);
  const freeShippingThreshold = !isNaN(rawThreshold) && rawThreshold > 0 ? rawThreshold : 150;

  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bellclay_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isOpen, setIsOpen] = useState(false);
  const [destinationCep, setDestinationCep] = useState<string>(() => {
    return localStorage.getItem('bellclay_saved_cep') || '';
  });
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('bellclay_cart', JSON.stringify(items));
  }, [items]);

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.promotionalPrice ?? item.product.price;
    return acc + price * item.quantity;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  useEffect(() => {
    const clean = destinationCep.replace(/\D/g, '');
    if (clean.length === 8 && items.length > 0) {
      calculateFreight(clean);
    } else if (items.length === 0) {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  }, [subtotal, destinationCep, freeShippingThreshold]);

  const addItem = (product: Product, quantity = 1, customObservation?: string) => {
    const trimmedObs = customObservation?.trim();
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => {
          if (item.product.id !== product.id) return item;
          const nextObs = trimmedObs || item.customObservation;
          return {
            ...item,
            quantity: item.quantity + quantity,
            ...(nextObs ? { customObservation: nextObs } : {})
          };
        });
      }
      return [
        ...prev,
        {
          product,
          quantity,
          ...(trimmedObs ? { customObservation: trimmedObs } : {})
        }
      ];
    });
    setIsOpen(true);
    trackEvent('add_to_cart', { productId: product.id, title: product.title, price: product.price, quantity });
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
    trackEvent('remove_from_cart', { productId });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setSelectedShipping(null);
    setShippingOptions([]);
    localStorage.removeItem('bellclay_cart');
  };

  const calculateFreight = async (cep: string) => {
    const clean = cep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setShippingError('Digite um CEP válido com 8 dígitos.');
      return;
    }

    setIsCalculatingShipping(true);
    setShippingError(null);

    try {
      localStorage.setItem('bellclay_saved_cep', clean);
      const options = await calculateShipping({
        destinationCep: clean,
        items,
        freeShippingThreshold,
        melhorEnvioToken: settings?.melhorEnvioToken
      });

      setShippingOptions(options);
      if (options.length > 0) {
        // Auto select cheapest or free
        const cheapest = [...options].sort((a, b) => a.price - b.price)[0];
        setSelectedShipping(cheapest);
      } else {
        setShippingError('Nenhuma opção de frete encontrada para este CEP.');
      }
    } catch (err) {
      console.error(err);
      setShippingError('Não foi possível calcular o frete. Tente novamente.');
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        subtotal,
        totalItems,
        freeShippingThreshold,
        freeShippingProgress,
        freeShippingRemaining,
        destinationCep,
        setDestinationCep,
        shippingOptions,
        selectedShipping,
        setSelectedShipping,
        isCalculatingShipping,
        calculateFreight,
        shippingError
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
