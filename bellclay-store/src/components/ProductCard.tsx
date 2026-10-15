import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const [isAdded, setIsAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1400);
  };

  const hasDiscount = Boolean(product.promotionalPrice && product.promotionalPrice < product.price);
  const currentPrice = product.promotionalPrice || product.price;

  return (
    <Link
      to={`/produto/${product.slug}`}
      className="group flex flex-col justify-between bg-white rounded-2xl sm:rounded-3xl p-2 sm:p-3 border border-brand-border/60 hover:border-brand-pink/40 shadow-xs hover:shadow-soft transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Product Image */}
      <div className="relative w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-[#FAF7F2] mb-2 sm:mb-3">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {product.images[1] && (
          <img
            src={product.images[1]}
            alt={product.title}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            loading="lazy"
          />
        )}

        {/* Badges without sparkle */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-brand-green text-white shadow-xs">
              Novo
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider bg-brand-pink text-white shadow-xs">
              Oferta
            </span>
          )}
        </div>

        {/* Floating Quick Add Button */}
        <div className="absolute bottom-2 right-2 z-10">
          <button
            onClick={handleQuickAdd}
            className={`p-2 sm:p-2.5 rounded-full shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isAdded
                ? 'bg-brand-green text-white'
                : 'bg-white/95 text-brand-charcoal hover:bg-brand-pink hover:text-white'
            }`}
            title="Adicionar ao carrinho"
            aria-label={`Adicionar ${product.title} ao carrinho`}
          >
            {isAdded ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-between px-0.5">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] sm:text-[11px] font-bold text-brand-charcoal">
              {product.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-[9px] sm:text-[10px] text-brand-muted">
              ({product.reviewsCount || 14})
            </span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-xs sm:text-sm text-brand-charcoal group-hover:text-brand-pink transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Pricing */}
        <div className="pt-2 mt-1 flex items-baseline justify-between border-t border-brand-border/40">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-[10px] text-brand-muted line-through">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="text-[10px] font-bold text-brand-pink">R$</span>
              <span className="text-sm sm:text-base font-extrabold text-brand-charcoal">
                {currentPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <span className="text-[10px] sm:text-[11px] font-semibold text-brand-pink group-hover:underline">
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );
};
