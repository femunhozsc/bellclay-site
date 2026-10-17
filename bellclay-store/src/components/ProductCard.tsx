import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
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

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // No celular: os 2 da mesma linha animam juntos (stagger por linha de 2 em 2)
  // No computador: mantém stagger individual por coluna
  const staggerDelay = isMobile
    ? Math.min(Math.floor(index / 2) * 0.08, 0.24)
    : Math.min((index % 4) * 0.07, 0.22);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        duration: 0.62,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1]
      }}
      whileHover={{
        y: -5,
        transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1], delay: 0 }
      }}
      whileTap={{
        scale: 0.97,
        transition: { duration: 0.15, delay: 0 }
      }}
      className="w-full flex flex-col"
    >
      <Link
        to={`/produto/${product.slug}`}
        className="group flex flex-col justify-between cursor-pointer w-full transition-all duration-300"
      >
      {/* Product Image: Full column width, no card borders */}
      <div className="relative w-full aspect-square rounded-2xl sm:rounded-3xl overflow-hidden bg-[#FAF7F2] mb-2 sm:mb-3 shadow-2xs">
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {product.isNew && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-brand-green text-white shadow-xs">
              Novo
            </span>
          )}
          {hasDiscount && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-brand-pink text-white shadow-xs">
              Oferta
            </span>
          )}
        </div>

        {/* Floating Quick Add Button */}
        <div className="absolute bottom-2.5 right-2.5 z-10">
          <button
            onClick={handleQuickAdd}
            className={`p-2.5 sm:p-3 rounded-full shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center ${
              isAdded
                ? 'bg-brand-green text-white scale-105'
                : 'bg-white/95 text-brand-charcoal hover:bg-brand-pink hover:text-white hover:scale-105'
            }`}
            title="Adicionar ao carrinho"
            aria-label={`Adicionar ${product.title} ao carrinho`}
          >
            {isAdded ? <Check className="w-4 h-4 stroke-[3]" /> : <Plus className="w-4 h-4 stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* Info directly underneath photo with enlarged fonts */}
      <div className="flex-1 flex flex-col justify-between px-0.5 space-y-1.5">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-brand-charcoal">
              {product.rating?.toFixed(1) || '5.0'}
            </span>
            <span className="text-[11px] text-brand-muted">
              ({product.reviewsCount || 14})
            </span>
          </div>

          {/* Title - Enlarged for better mobile readability */}
          <h3 className="font-semibold text-sm sm:text-base text-brand-charcoal group-hover:text-brand-pink transition-colors line-clamp-2 leading-snug">
            {product.title}
          </h3>
        </div>

        {/* Pricing - Larger and prominent */}
        <div className="pt-1 flex items-baseline justify-between">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-brand-muted line-through">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-brand-pink">R$</span>
              <span className="text-base sm:text-lg lg:text-xl font-extrabold text-brand-charcoal">
                {currentPrice.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <span className="hidden sm:inline text-xs sm:text-sm font-semibold text-brand-pink group-hover:underline">
            Ver detalhes
          </span>
        </div>
      </div>
      </Link>
    </motion.div>
  );
};
