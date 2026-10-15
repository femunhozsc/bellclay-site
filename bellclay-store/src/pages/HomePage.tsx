import React from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { Heart, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings, filteredProducts, isLoading, searchQuery } = useSettings();

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Full-width Edge-to-Edge Hero Carousel right beneath topbar */}
      <HeroCarousel />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 sm:py-14 w-full space-y-10 sm:space-y-16">
        
        {/* Welcome Section - Enlarged typography & clean artisan layout */}
        <section className="text-center max-w-4xl mx-auto space-y-4 pt-2 px-2">
          
          <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-brand-charcoal tracking-tight leading-[1.15]">
            {settings.welcomeTitle}
          </h2>

          <p className="text-brand-muted text-sm sm:text-lg lg:text-xl font-normal leading-relaxed max-w-2xl mx-auto">
            {settings.welcomeSubtitle}
          </p>

          {/* Organic Characteristics Ribbon */}
          <div className="pt-6 sm:pt-8">
            <div className="flex flex-wrap items-center justify-around gap-y-4 gap-x-6 py-4 px-4 sm:px-6 rounded-2xl sm:rounded-3xl bg-[#F6F1E8]/80">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0">
                  <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-brand-pink/30" />
                </div>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal">100% Cerâmica Fria</span>
                  <span className="block text-[10px] sm:text-xs text-brand-muted">Modelado à mão</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-brand-border/60" />

              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green shrink-0">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal">Resina Vitrificada</span>
                  <span className="block text-[10px] sm:text-xs text-brand-muted">Alta proteção & brilho</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-brand-border/60" />

              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0">
                  <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal">Envio Seguro</span>
                  <span className="block text-[10px] sm:text-xs text-brand-muted">Campo Mourão p/ todo Brasil</span>
                </div>
              </div>

              <div className="hidden sm:block w-px h-8 bg-brand-border/60" />

              <div className="flex items-center gap-2.5 text-left">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand-green/15 flex items-center justify-center text-brand-green shrink-0">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal">Mercado Pago</span>
                  <span className="block text-[10px] sm:text-xs text-brand-muted">Pix 5% OFF & até 12x</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories & Catalog Section */}
        <section id="produtos" className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-brand-border/60 pb-3 px-1">
            <div>
              {/* Title without flame icon, larger font */}
              <h3 className="font-serif text-2xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight">
                Catálogo de Artesanatos
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-brand-muted mt-0.5">
                {searchQuery
                  ? `Resultados para "${searchQuery}"`
                  : 'Peças exclusivas e colecionáveis feitas artesanalmente em porcelana fria'}
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-brand-muted self-start sm:self-auto">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}
            </span>
          </div>

          {/* Category Filter Pills */}
          <CategoryPills />

          {/* Optimized Products Grid for Mobile & Desktop - High Performance & Frameless */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6 pt-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="animate-pulse space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-2xl sm:rounded-3xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF8F5] rounded-3xl p-8 space-y-3">
              <p className="font-serif text-xl sm:text-2xl font-bold text-brand-charcoal">Nenhuma peça encontrada</p>
              <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto">
                Não encontramos resultados para sua busca ou categoria. Tente limpar os filtros para ver todas as criações!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 pt-2">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
