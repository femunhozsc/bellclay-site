import React from 'react';
import { motion } from 'framer-motion';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { Heart, ShieldCheck, Truck, CheckCircle2, Flame, MapPin } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings, filteredProducts, isLoading } = useSettings();

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Full-width Edge-to-Edge Hero Carousel right beneath topbar */}
      <HeroCarousel />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-6 w-full space-y-8 sm:space-y-12">
        
        {/* Welcome Section */}
        <section className="text-center max-w-3xl mx-auto space-y-3 pt-2 px-2">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-brand-pink-subtle text-brand-pink"
          >
            <MapPin className="w-3.5 h-3.5 text-brand-pink" />
            <span>Ateliê em Campo Mourão - PR • Envio para todo o Brasil</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-2xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight"
          >
            {settings.welcomeTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-brand-muted text-xs sm:text-base leading-relaxed max-w-2xl mx-auto"
          >
            {settings.welcomeSubtitle}
          </motion.p>

          {/* Organic Characteristics Ribbon (NO boxy cards or AI-like borders) */}
          <div className="pt-4 sm:pt-6">
            <div className="flex flex-wrap items-center justify-around gap-y-3 gap-x-4 py-3.5 px-4 rounded-2xl sm:rounded-3xl bg-[#F6F1E8]/75 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink shrink-0">
                  <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-brand-pink/30" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-brand-charcoal">100% Cerâmica Fria</span>
                  <span className="block text-[9px] sm:text-[10px] text-brand-muted">Modelado à mão</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-brand-border/60" />

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-brand-charcoal">Resina Vitrificada</span>
                  <span className="block text-[9px] sm:text-[10px] text-brand-muted">Alta durabilidade</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-brand-border/60" />

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-pink/10 flex items-center justify-center text-brand-pink shrink-0">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-brand-charcoal">Envio Seguro</span>
                  <span className="block text-[9px] sm:text-[10px] text-brand-muted">Campo Mourão p/ todo Brasil</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-6 bg-brand-border/60" />

              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-brand-green/10 flex items-center justify-center text-brand-green shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <span className="block text-[11px] sm:text-xs font-bold text-brand-charcoal">Mercado Pago</span>
                  <span className="block text-[9px] sm:text-[10px] text-brand-muted">Pix & até 12x no cartão</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="produtos" className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3 px-1">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-brand-charcoal flex items-center gap-2">
                <span>Catálogo de Artesanatos</span>
                <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-brand-pink" />
              </h3>
              <p className="text-[11px] sm:text-xs text-brand-muted">
                Peças exclusivas e colecionáveis feitas artesanalmente em porcelana fria
              </p>
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-brand-muted self-start sm:self-auto">
              {filteredProducts.length} peças encontradas
            </span>
          </div>

          {/* Category Filter Pills */}
          <CategoryPills />

          {/* Optimized Products Grid for Mobile & Desktop (Bigger photos, tighter clean spacing) */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl sm:rounded-3xl p-3 border border-brand-border animate-pulse space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12 sm:py-16 bg-white rounded-2xl sm:rounded-3xl border border-brand-border p-6 sm:p-8 space-y-3">
              <p className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal">Nenhuma peça encontrada</p>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                Não encontramos resultados para sua busca ou categoria. Tente limpar os filtros para ver todas as criações!
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6 pt-1 sm:pt-2"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </section>

      </div>
    </div>
  );
};
