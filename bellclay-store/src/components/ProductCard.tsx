import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Star, Sparkles, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { setSelectedProduct } = useSettings();
  const [isAdded, setIsAdded] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const hasDiscount = Boolean(product.promotionalPrice && product.promotionalPrice < product.price);
  const currentPrice = product.promotionalPrice || product.price;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      onClick={() => setSelectedProduct(product)}
      className="group relative bg-white rounded-3xl p-3.5 sm:p-4 border border-brand-border/70 hover:border-brand-pink/40 shadow-soft hover:shadow-soft-hover transition-all duration-300 flex flex-col justify-between cursor-pointer overflow-hidden"
    >
      {/* Image Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FAF7F2] mb-3.5">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />

        {/* Secondary image hover transition if exists */}
        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isNew && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-green text-white shadow-xs">
              Novo
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-pink text-white shadow-xs">
              Oferta
            </span>
          )}
          {product.featured && !product.isNew && !hasDiscount && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-brand-charcoal shadow-xs">
              Destaque
            </span>
          )}
        </div>

        {/* Quick Add Button on Hover */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={handleQuickAdd}
            className={`p-2.5 rounded-full shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isAdded
                ? 'bg-brand-green text-white'
                : 'bg-white/95 text-brand-charcoal hover:bg-brand-pink hover:text-white'
            }`}
            title="Adicionar ao carrinho"
            aria-label={`Adicionar ${product.title} ao carrinho`}
          >
            {isAdded ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Plus className="w-4 h-4 stroke-[2.5]" />}
          </motion.button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Reviews */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-[11px] font-bold text-brand-charcoal">
              {product.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-[11px] text-brand-muted">
              ({product.reviewsCount || 12})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm sm:text-base text-brand-charcoal group-hover:text-brand-pink transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>

          <p className="text-xs text-brand-muted line-clamp-1 mt-1 font-normal">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-3 mt-2 border-t border-brand-border/40 flex items-baseline justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[11px] text-brand-muted line-through">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-semibold text-brand-pink">R$</span>
              <span className="text-lg sm:text-xl font-extrabold text-brand-charcoal">
                {currentPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <span className="text-[11px] font-medium text-brand-muted group-hover:text-brand-pink transition-colors flex items-center gap-1">
            <span>Ver detalhes</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
};
