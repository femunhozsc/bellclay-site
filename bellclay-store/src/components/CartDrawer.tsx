import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, ArrowRight, Truck, CheckCircle2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onProceedToCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const navigate = useNavigate();
  const {
    items,
    isOpen,
    setIsOpen,
    removeItem,
    updateQuantity,
    subtotal,
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
  } = useCart();

  const [inputCep, setInputCep] = useState(destinationCep);

  const handleCalculateCep = (e: React.FormEvent) => {
    e.preventDefault();
    calculateFreight(inputCep);
  };

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingCost;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-brand-charcoal/40 backdrop-blur-xs transition-opacity"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex w-full sm:w-auto">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-full sm:w-[420px] bg-white shadow-2xl border-l border-brand-border/60 flex flex-col justify-between h-full"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-brand-border/60 flex items-center justify-between bg-[#FDFBF7]">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-pink" />
                  <h2 className="font-serif text-base sm:text-lg font-bold text-brand-charcoal">
                    Seu Carrinho ({items.length})
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-brand-pink-subtle/50 text-brand-charcoal transition-colors cursor-pointer"
                  aria-label="Fechar carrinho"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Meter */}
              <div className="p-3.5 sm:p-4 bg-gradient-to-r from-brand-pink-light to-brand-green-light border-b border-brand-border/40">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-charcoal mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {freeShippingRemaining > 0 ? (
                      <span>
                        Faltam <strong className="text-brand-pink">R$ {freeShippingRemaining.toFixed(2).replace('.', ',')}</strong> para Frete Grátis!
                      </span>
                    ) : (
                      <span className="text-brand-green font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Parabéns! Você ganhou Frete Grátis!
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-full bg-white/80 h-2 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="h-full bg-gradient-to-r from-brand-pink to-brand-green rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${freeShippingProgress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {items.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink">
                      <ShoppingBag className="w-10 h-10" />
                    </div>
                    <p className="font-serif text-lg font-bold text-brand-charcoal">
                      Seu carrinho está vazio
                    </p>
                    <p className="text-xs text-brand-muted max-w-xs">
                      Descubra nossas fofuras em cerâmica fria modeladas à mão e adicione seus itens favoritos!
                    </p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-2.5 rounded-full bg-brand-pink text-white text-xs font-bold shadow-pink-soft hover:shadow-soft-hover transition-all cursor-pointer"
                    >
                      Ver Catálogo
                    </button>
                  </div>
                ) : (
                  items.map((item) => {
                    const price = item.product.promotionalPrice || item.product.price;
                    return (
                      <div
                        key={item.product.id}
                        className="flex gap-3.5 p-3 rounded-2xl bg-[#FAF8F5] border border-brand-border/60 hover:border-brand-pink/30 transition-all"
                      >
                        {/* Image */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0 shadow-xs">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="text-xs font-bold text-brand-charcoal truncate pr-2">
                                {item.product.title}
                              </h4>
                              <button
                                onClick={() => removeItem(item.product.id)}
                                className="text-brand-muted hover:text-red-500 transition-colors p-1"
                                title="Remover"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {item.customObservation && (
                              <p className="text-[10px] text-brand-muted italic truncate">
                                Obs: {item.customObservation}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs font-extrabold text-brand-charcoal">
                              R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>

                            {/* Quantity controls */}
                            <div className="flex items-center border border-brand-border rounded-full bg-white px-2 py-0.5">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="text-xs font-bold text-brand-charcoal px-1 hover:text-brand-pink"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold text-brand-charcoal px-2">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="text-xs font-bold text-brand-charcoal px-1 hover:text-brand-pink"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Freight Calculator & Summary */}
              {items.length > 0 && (
                <div className="p-5 border-t border-brand-border/60 bg-[#FDFBF7] space-y-4">
                  {/* CEP Input */}
                  <div className="p-3 bg-white rounded-2xl border border-brand-border/80 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-brand-charcoal flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-brand-pink" />
                        Calcular Frete:
                      </span>
                      {selectedShipping && (
                        <span className="text-[11px] font-bold text-brand-green">
                          {selectedShipping.name}
                        </span>
                      )}
                    </div>
                    <form onSubmit={handleCalculateCep} className="flex gap-2">
                      <input
                        type="text"
                        maxLength={9}
                        placeholder="Informe seu CEP"
                        value={inputCep}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                          setInputCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
                          setDestinationCep(v);
                        }}
                        className="flex-1 text-xs px-3 py-1.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                      />
                      <button
                        type="submit"
                        disabled={isCalculatingShipping}
                        className="px-3 py-1.5 rounded-xl bg-brand-charcoal hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isCalculatingShipping ? '...' : 'OK'}
                      </button>
                    </form>

                    {shippingError && (
                      <p className="text-[10px] text-red-500 mt-1">{shippingError}</p>
                    )}

                    {shippingOptions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-brand-border/60 space-y-1">
                        {shippingOptions.map((opt) => (
                          <label
                            key={opt.id}
                            className={`flex items-center justify-between text-xs p-1.5 rounded-lg cursor-pointer transition-colors ${
                              selectedShipping?.id === opt.id ? 'bg-brand-pink-light/60 font-semibold' : 'hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="shipping_radio"
                                checked={selectedShipping?.id === opt.id}
                                onChange={() => setSelectedShipping(opt)}
                                className="text-brand-pink focus:ring-brand-pink"
                              />
                              <span className="text-[11px] text-brand-charcoal">{opt.name}</span>
                            </div>
                            <span className="text-[11px] font-bold">
                              {opt.price === 0 ? <span className="text-brand-green">Grátis</span> : `R$ ${opt.price.toFixed(2).replace('.', ',')}`}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-brand-muted">
                      <span>Subtotal:</span>
                      <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between text-brand-muted">
                      <span>Frete:</span>
                      <span>
                        {selectedShipping ? (
                          selectedShipping.price === 0 ? (
                            <span className="text-brand-green font-bold">Grátis</span>
                          ) : (
                            `R$ ${selectedShipping.price.toFixed(2).replace('.', ',')}`
                          )
                        ) : (
                          <span className="italic text-[11px]">Calcular acima</span>
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-brand-charcoal pt-2 border-t border-brand-border/60">
                      <span>Total:</span>
                      <span className="text-base text-brand-pink">
                        R$ {grandTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsOpen(false);
                      if (onProceedToCheckout) {
                        onProceedToCheckout();
                      } else {
                        navigate('/checkout');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm shadow-green-soft hover:shadow-soft-hover transition-all duration-200 cursor-pointer"
                  >
                    <span>Finalizar Compra</span>
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
