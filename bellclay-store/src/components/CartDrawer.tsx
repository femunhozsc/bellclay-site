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

  const [activeTab, setActiveTab] = useState<'products' | 'shipping'>('products');
  const [inputCep, setInputCep] = useState(destinationCep);

  const handleCalculateCep = (e: React.FormEvent) => {
    e.preventDefault();
    calculateFreight(inputCep);
  };

  const handleProductClick = (productId: string) => {
    setIsOpen(false);
    navigate(`/produto/${productId}`);
  };

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingCost;

  // Regra de Frete Grátis estrita:
  // Só ganha frete grátis se o subtotal atingir o valor mínimo configurado (ex: R$ 150)
  // Retirada/entrega local gratuita não é considerada "Frete Grátis Ganho" da promoção.
  const reachedThreshold = subtotal >= freeShippingThreshold;
  const hasRealFreeShipping =
    reachedThreshold &&
    shippingOptions.some((opt) => opt.price === 0 && !opt.id.includes('pickup'));

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
              className="w-full sm:w-[440px] bg-white shadow-2xl border-l border-brand-border/60 flex flex-col h-full"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-brand-border/60 flex items-center justify-between bg-[#FDFBF7] shrink-0">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-brand-pink" />
                  <h2 className="font-serif text-lg sm:text-xl font-extrabold text-brand-charcoal">
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

              {/* Navigation Tabs: Produtos | Entrega */}
              <div className="flex border-b border-brand-border/60 bg-[#FDFBF7] shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                    activeTab === 'products'
                      ? 'text-brand-pink'
                      : 'text-brand-muted hover:text-brand-charcoal'
                  }`}
                >
                  <span>Produtos ({items.length})</span>
                  {activeTab === 'products' && (
                    <motion.div
                      layoutId="cartActiveTab"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-pink"
                    />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('shipping')}
                  className={`flex-1 py-3 text-center text-xs sm:text-sm font-bold transition-all relative cursor-pointer ${
                    activeTab === 'shipping'
                      ? 'text-brand-pink'
                      : 'text-brand-muted hover:text-brand-charcoal'
                  }`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    <Truck className="w-4 h-4" />
                    Entrega
                    {selectedShipping && (
                      <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                    )}
                  </span>
                  {activeTab === 'shipping' && (
                    <motion.div
                      layoutId="cartActiveTab"
                      className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-pink"
                    />
                  )}
                </button>
              </div>

              {/* Free Shipping Meter */}
              <div className="p-3 sm:p-3.5 bg-gradient-to-r from-brand-pink-light to-brand-green-light border-b border-brand-border/40 shrink-0">
                <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-brand-charcoal mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {(() => {
                      const hasCep = Boolean(destinationCep && destinationCep.replace(/\D/g, '').length === 8);

                      // Se atingiu o valor e o frete de entrega postal foi calculado como grátis
                      if (reachedThreshold && hasCep && hasRealFreeShipping) {
                        return (
                          <span className="text-brand-green font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4 shrink-0" /> Parabéns! Você ganhou Frete Grátis!
                          </span>
                        );
                      }

                      // Se já atingiu o valor mínimo estipulado no painel (ex: R$ 150)
                      if (reachedThreshold) {
                        if (!hasCep) {
                          return (
                            <span className="text-xs sm:text-sm text-brand-charcoal font-medium">
                              Meta atingida! <button type="button" onClick={() => setActiveTab('shipping')} className="text-brand-pink font-bold underline cursor-pointer">Calcule seu CEP</button> para validar o frete grátis.
                            </span>
                          );
                        }
                        return (
                          <span className="text-xs sm:text-sm text-brand-charcoal font-medium">
                            Frete grátis aplicado para pedidos elegíveis acima de R$ {freeShippingThreshold.toFixed(0)}!
                          </span>
                        );
                      }

                      // Ainda não atingiu o valor mínimo
                      return (
                        <span className="text-xs sm:text-sm text-brand-charcoal font-medium">
                          Faltam <strong className="text-brand-pink font-bold">R$ {freeShippingRemaining.toFixed(2).replace('.', ',')}</strong> para Frete Grátis!
                        </span>
                      );
                    })()}
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

              {/* Main Content Area (Scrollable Behind Sticky Footer) */}
              <div className="flex-1 overflow-y-auto min-h-0">
                {activeTab === 'products' ? (
                  /* TAB 1: PRODUTOS */
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {items.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-pink">
                          <ShoppingBag className="w-10 h-10" />
                        </div>
                        <p className="font-serif text-lg font-bold text-brand-charcoal">
                          Seu carrinho está vazio
                        </p>
                        <p className="text-sm text-brand-muted max-w-xs">
                          Descubra nossas fofuras em cerâmica fria modeladas à mão e adicione seus itens favoritos!
                        </p>
                        <button
                          onClick={() => setIsOpen(false)}
                          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white text-xs font-bold shadow-soft transition-all cursor-pointer"
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
                            {/* Product Thumbnail (Click goes to product page) */}
                            <button
                              type="button"
                              onClick={() => handleProductClick(item.product.id)}
                              className="w-16 h-16 min-w-[64px] min-h-[64px] max-w-[64px] max-h-[64px] rounded-xl overflow-hidden bg-white shrink-0 shadow-2xs group cursor-pointer block p-0 border border-brand-border/40"
                              title="Ver detalhes do produto"
                            >
                              <img
                                src={item.product.images[0]}
                                alt={item.product.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 block"
                              />
                            </button>

                            {/* Info */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex justify-between items-start">
                                  <h4
                                    onClick={() => handleProductClick(item.product.id)}
                                    className="text-sm font-bold text-brand-charcoal truncate pr-2 hover:text-brand-pink transition-colors cursor-pointer"
                                    title={item.product.title}
                                  >
                                    {item.product.title}
                                  </h4>
                                  <button
                                    onClick={() => removeItem(item.product.id)}
                                    className="text-brand-muted hover:text-red-500 transition-colors p-1 cursor-pointer"
                                    title="Remover"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                                <span className="text-xs text-brand-muted block mt-0.5">
                                  {item.quantity} {item.quantity === 1 ? 'unidade' : 'unidades'} • R$ {price.toFixed(2).replace('.', ',')} cada
                                </span>
                                {item.customObservation && (
                                  <p className="text-xs text-brand-muted italic truncate mt-0.5">
                                    Obs: {item.customObservation}
                                  </p>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-sm sm:text-base font-extrabold text-brand-charcoal">
                                  R$ {(price * item.quantity).toFixed(2).replace('.', ',')}
                                </span>

                                {/* Quantity controls */}
                                <div className="flex items-center border border-brand-border/80 rounded-full bg-white p-0.5 shadow-2xs">
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-brand-charcoal hover:bg-brand-pink-subtle/50 hover:text-brand-pink transition-colors cursor-pointer"
                                    aria-label="Diminuir quantidade"
                                  >
                                    -
                                  </button>
                                  <span className="text-xs sm:text-sm font-bold text-brand-charcoal px-2.5 min-w-[20px] text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold text-brand-charcoal hover:bg-brand-pink-subtle/50 hover:text-brand-pink transition-colors cursor-pointer"
                                    aria-label="Aumentar quantidade"
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
                ) : (
                  /* TAB 2: ENTREGA */
                  <div className="p-4 sm:p-5 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm font-bold text-brand-charcoal flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-brand-pink" />
                          Calcular Frete
                        </span>
                        {selectedShipping && (
                          <span className="text-xs font-bold text-brand-green">
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
                          className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF8F5] shadow-2xs"
                        />
                        <button
                          type="submit"
                          disabled={isCalculatingShipping}
                          className="px-4 py-2 rounded-xl bg-brand-charcoal hover:bg-black text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isCalculatingShipping ? '...' : 'Calcular'}
                        </button>
                      </form>

                      {shippingError && (
                        <p className="text-xs text-red-500">{shippingError}</p>
                      )}

                      {shippingOptions.length > 0 ? (
                        <div className="pt-2 space-y-2">
                          <span className="text-xs font-bold text-brand-charcoal block">Opções disponíveis:</span>
                          {shippingOptions.map((opt) => (
                            <label
                              key={opt.id}
                              className={`flex items-center justify-between text-xs sm:text-sm p-3 rounded-xl border cursor-pointer transition-all ${
                                selectedShipping?.id === opt.id
                                  ? 'border-brand-pink bg-brand-pink-subtle/50 font-semibold shadow-xs'
                                  : 'border-brand-border/60 hover:bg-gray-50 bg-[#FAF8F5]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="radio"
                                  name="shipping_radio"
                                  checked={selectedShipping?.id === opt.id}
                                  onChange={() => setSelectedShipping(opt)}
                                  className="text-brand-pink focus:ring-brand-pink"
                                />
                                <div>
                                  <span className="text-xs sm:text-sm text-brand-charcoal block">{opt.name}</span>
                                  <span className="text-[11px] text-brand-muted">
                                    {opt.deliveryDays} {opt.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs sm:text-sm font-bold">
                                {opt.price === 0 ? (
                                  <span className="text-brand-green">Grátis</span>
                                ) : (
                                  `R$ ${opt.price.toFixed(2).replace('.', ',')}`
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-brand-border/60 text-center space-y-1 mt-3">
                          <p className="text-xs sm:text-sm text-brand-charcoal font-semibold">
                            Digite seu CEP para ver os prazos e valores de envio
                          </p>
                          <p className="text-xs text-brand-muted">
                            Enviamos com carinho para todo o Brasil ou retirada/entrega em Campo Mourão.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Fixed Bottom Summary & Action (Always Visible Regardless of Scroll) */}
              {items.length > 0 && (
                <div className="p-4 sm:p-5 border-t border-brand-border/80 bg-white shadow-[0_-8px_20px_rgba(0,0,0,0.04)] shrink-0 space-y-3 z-10">
                  {/* Price Breakdown */}
                  <div className="space-y-1.5 text-xs sm:text-sm">
                    <div className="flex justify-between text-brand-muted">
                      <span>Subtotal</span>
                      <span className="font-semibold text-brand-charcoal">
                        R$ {subtotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex justify-between text-brand-muted items-center">
                      <span>Frete</span>
                      <span>
                        {selectedShipping ? (
                          selectedShipping.price === 0 ? (
                            <span className="text-brand-green font-bold">Grátis</span>
                          ) : (
                            <span className="font-semibold text-brand-charcoal">
                              R$ {selectedShipping.price.toFixed(2).replace('.', ',')}
                            </span>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveTab('shipping')}
                            className="text-xs text-brand-pink font-semibold underline cursor-pointer"
                          >
                            Calcular Frete
                          </button>
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-base sm:text-lg font-extrabold text-brand-charcoal pt-2 border-t border-brand-border/60">
                      <span>Total</span>
                      <span className="text-brand-pink font-extrabold text-lg sm:text-xl">
                        R$ {grandTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsOpen(false);
                      if (onProceedToCheckout) {
                        onProceedToCheckout();
                      } else {
                        navigate('/checkout');
                      }
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm sm:text-base shadow-green-soft hover:shadow-soft-hover transition-all duration-200 cursor-pointer"
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
