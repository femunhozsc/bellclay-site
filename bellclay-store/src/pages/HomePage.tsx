import React, { useEffect } from 'react';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { useSettings } from '../context/SettingsContext';
import { Heart, ShieldCheck, Truck, CheckCircle2 } from 'lucide-react';
import { resolveCategorySlug, scrollToCatalogSection } from '../utils/categoryResolver';

export const HomePage: React.FC = () => {
  const {
    settings,
    filteredProducts,
    isLoading,
    searchQuery,
    setSelectedCategory,
    setSearchQuery
  } = useSettings();

  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const rawTag = decodeURIComponent(hash.slice(1)).trim();
      if (!rawTag) return;

      const targetSlug = resolveCategorySlug(rawTag, settings.categories);
      setSelectedCategory(targetSlug);
      setSearchQuery('');

      // Execute smooth scrolling with retries to account for image loads / layout settling
      scrollToCatalogSection();
      const t1 = setTimeout(scrollToCatalogSection, 80);
      const t2 = setTimeout(scrollToCatalogSection, 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    handleHashNavigation();

    window.addEventListener('hashchange', handleHashNavigation);
    return () => window.removeEventListener('hashchange', handleHashNavigation);
  }, [settings.categories, setSelectedCategory, setSearchQuery]);

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Full-width Edge-to-Edge Hero Carousel right beneath topbar */}
      <HeroCarousel />

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full space-y-8 sm:space-y-12">
        
        {/* Welcome Section - Balanced typography & elegant proportion */}
        <section className="text-center space-y-3 pt-1 px-1">
          
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-charcoal tracking-tight leading-snug max-w-2xl mx-auto">
            {settings.welcomeTitle}
          </h2>

          <p className="text-brand-muted text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-lg mx-auto">
            {settings.welcomeSubtitle}
          </p>

          {/* Clean Standalone Feature Cards - No outer background card, enlarged & aligned with the site */}
          <div className="pt-5 sm:pt-7 w-full">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
              
              <div className="flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4.5 rounded-2xl bg-white border border-brand-border/70 shadow-xs hover:shadow-md hover:border-brand-pink/30 transition-all duration-200">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-brand-pink/30" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal truncate">100% Cerâmica</span>
                  <span className="block text-[11px] sm:text-xs text-brand-muted truncate">Modelado à mão</span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4.5 rounded-2xl bg-white border border-brand-border/70 shadow-xs hover:shadow-md hover:border-brand-green/30 transition-all duration-200">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-green/15 flex items-center justify-center text-brand-green shrink-0">
                  <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal truncate">Resina e Verniz</span>
                  <span className="block text-[11px] sm:text-xs text-brand-muted truncate">Alta proteção</span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4.5 rounded-2xl bg-white border border-brand-border/70 shadow-xs hover:shadow-md hover:border-brand-pink/30 transition-all duration-200">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-pink/15 flex items-center justify-center text-brand-pink shrink-0">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal truncate">Envio Seguro</span>
                  <span className="block text-[11px] sm:text-xs text-brand-muted truncate">Para todo o Brasil</span>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:gap-3.5 p-3.5 sm:p-4.5 rounded-2xl bg-white border border-brand-border/70 shadow-xs hover:shadow-md hover:border-brand-green/30 transition-all duration-200">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brand-green/15 flex items-center justify-center text-brand-green shrink-0">
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 text-left">
                  <span className="block text-xs sm:text-sm font-bold text-brand-charcoal truncate">Mercado Pago</span>
                  <span className="block text-[11px] sm:text-xs text-brand-muted truncate">Pix 5% OFF & Cartão</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Categories & Catalog Section */}
        <section id="produtos" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-28">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-brand-border/60 pb-3 px-1">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-charcoal tracking-tight">
                Catálogo de Artesanatos
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                {searchQuery
                  ? `Mostrando resultados para "${searchQuery}"`
                  : 'Peças exclusivas e colecionáveis feitas artesanalmente em porcelana fria'}
              </p>
            </div>
            <span className="text-xs sm:text-sm font-semibold text-brand-muted self-start sm:self-auto">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'peça' : 'peças'}
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
              <p className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal">Nenhuma peça encontrada</p>
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
