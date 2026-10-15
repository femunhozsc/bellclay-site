import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, ShoppingBag, Truck, ShieldCheck, Heart, Sparkles, Check, Info } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { calculateShipping } from '../services/shippingService';
import { ShippingOption } from '../types';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, settings } = useSettings();
  const { addItem, setIsOpen: setIsCartOpen } = useCart();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState('');
  const [simulatedCep, setSimulatedCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  if (!selectedProduct) return null;

  const currentPrice = selectedProduct.promotionalPrice || selectedProduct.price;
  const hasDiscount = Boolean(selectedProduct.promotionalPrice && selectedProduct.promotionalPrice < selectedProduct.price);

  const handleAddToCart = () => {
    addItem(selectedProduct, quantity, observation);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleSimulateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = simulatedCep.replace(/\D/g, '');
    if (clean.length !== 8) {
      setCalcError('Digite um CEP válido com 8 dígitos.');
      return;
    }
    setIsCalculating(true);
    setCalcError(null);
    try {
      const options = await calculateShipping({
        destinationCep: clean,
        items: [{ product: selectedProduct, quantity }],
        freeShippingThreshold: settings.freeShippingThreshold
      });
      setShippingOptions(options);
      if (options.length === 0) {
        setCalcError('Nenhum frete disponível para o CEP informado.');
      }
    } catch {
      setCalcError('Erro ao consultar frete.');
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-brand-border/60 overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close button */}
          <button
            onClick={() => setSelectedProduct(null)}
            className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 hover:bg-white text-brand-charcoal shadow-md border border-brand-border/60 hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Column: Image Gallery */}
          <div className="w-full md:w-1/2 bg-[#FAF7F2] p-6 flex flex-col justify-between">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white shadow-soft">
              <img
                src={selectedProduct.images[activeImageIndex] || selectedProduct.images[0]}
                alt={selectedProduct.title}
                className="w-full h-full object-cover transition-all duration-300"
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {selectedProduct.isNew && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-green text-white shadow-xs">
                    Novo
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-pink text-white shadow-xs">
                    Promoção
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnails */}
            {selectedProduct.images.length > 1 && (
              <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
                {selectedProduct.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx ? 'border-brand-pink scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Artisanal cold porcelain guarantee */}
            <div className="mt-4 pt-4 border-t border-brand-border/60 flex items-center justify-around text-xs text-brand-muted">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-pink" />
                <span>100% Cerâmica Fria</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-green" />
                <span>Verniz Protetor</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 overflow-y-auto flex flex-col justify-between space-y-6">
            <div>
              {/* Rating */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex items-center text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span className="text-xs font-bold text-brand-charcoal">
                  {selectedProduct.rating?.toFixed(1) || '5.0'}
                </span>
                <span className="text-xs text-brand-muted">
                  ({selectedProduct.reviewsCount || 18} avaliações)
                </span>
              </div>

              {/* Title */}
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal leading-tight">
                {selectedProduct.title}
              </h2>

              {/* Price */}
              <div className="mt-3 flex items-baseline gap-2.5">
                {hasDiscount && (
                  <span className="text-sm text-brand-muted line-through font-medium">
                    R$ {selectedProduct.price.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-brand-pink">R$</span>
                  <span className="text-3xl font-extrabold text-brand-charcoal">
                    {currentPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <span className="text-xs text-brand-green font-semibold bg-brand-green-subtle px-2.5 py-1 rounded-full">
                  Em até 3x sem juros
                </span>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-brand-charcoal/80 leading-relaxed font-normal">
                {selectedProduct.description}
              </p>

              {/* Dimensions & Weight info */}
              <div className="mt-4 bg-[#F8F6F2] p-3 rounded-2xl flex flex-wrap gap-4 text-xs text-brand-muted">
                <div>
                  <span className="font-semibold text-brand-charcoal">Peso:</span> {(selectedProduct.weightKg * 1000).toFixed(0)}g
                </div>
                <div>
                  <span className="font-semibold text-brand-charcoal">Dimensões:</span> {selectedProduct.dimensions.heightCm} x {selectedProduct.dimensions.widthCm} x {selectedProduct.dimensions.lengthCm} cm
                </div>
                <div>
                  <span className="font-semibold text-brand-charcoal">Estoque:</span> {selectedProduct.stock} unidades
                </div>
              </div>

              {/* Optional Customization note */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-brand-charcoal mb-1.5">
                  Observação ou Personalização (opcional):
                </label>
                <input
                  type="text"
                  placeholder="Ex: Gostaria com fecho dourado ou gravação de letra..."
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink/50 focus:ring-2 focus:ring-brand-pink/20 outline-hidden bg-[#FAF7F2]"
                />
              </div>

              {/* In-Modal Shipping Simulator */}
              <div className="mt-5 p-4 rounded-2xl bg-[#FFF6F7] border border-brand-pink/20">
                <div className="flex items-center gap-2 text-xs font-bold text-brand-charcoal mb-2">
                  <Truck className="w-4 h-4 text-brand-pink" />
                  <span>Calcular Frete e Prazo:</span>
                </div>
                <form onSubmit={handleSimulateShipping} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="00000-000"
                    value={simulatedCep}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setSimulatedCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
                    }}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-brand-pink/30 focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-white"
                  />
                  <button
                    type="submit"
                    disabled={isCalculating}
                    className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    {isCalculating ? 'Calculando...' : 'Calcular'}
                  </button>
                </form>

                {calcError && (
                  <p className="text-[11px] text-red-500 mt-2">{calcError}</p>
                )}

                {shippingOptions.length > 0 && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-brand-pink/20">
                    {shippingOptions.map((opt) => (
                      <div key={opt.id} className="flex items-center justify-between text-xs py-1">
                        <div>
                          <span className="font-semibold text-brand-charcoal">{opt.name}</span>
                          <span className="text-[11px] text-brand-muted ml-2">({opt.deliveryDays} {opt.deliveryDays === 1 ? 'dia útil' : 'dias úteis'})</span>
                        </div>
                        <span className="font-bold text-brand-charcoal">
                          {opt.price === 0 ? <span className="text-brand-green font-extrabold">Grátis</span> : `R$ ${opt.price.toFixed(2).replace('.', ',')}`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quantity and Add to Cart Action */}
            <div className="pt-4 border-t border-brand-border/60 flex items-center gap-3">
              <div className="flex items-center border border-brand-border rounded-full bg-[#FAF7F2] p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-brand-charcoal font-bold transition-colors cursor-pointer"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-bold text-brand-charcoal">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white text-brand-charcoal font-bold transition-colors cursor-pointer"
                >
                  +
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-sm shadow-pink-soft hover:shadow-soft-hover transition-all duration-200 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Adicionar ao Carrinho</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
