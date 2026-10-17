import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeroCarousel } from '../components/HeroCarousel';
import { CategoryPills } from '../components/CategoryPills';
import { ProductCard } from '../components/ProductCard';
import { EventsCarousel } from '../components/EventsCarousel';
import { useSettings } from '../context/SettingsContext';
import { ArrowRight } from 'lucide-react';
import { DEFAULT_SETTINGS } from '../data/defaultData';
import { resolveCategorySlug, scrollToCatalogSection, isEventTag, scrollToEventsSection } from '../utils/categoryResolver';

export const HomePage: React.FC = () => {
  const {
    settings,
    filteredProducts,
    isLoading,
    searchQuery,
    selectedCategory,
    setSelectedCategory,
    setSearchQuery
  } = useSettings();

  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const initialLimit = isMobile ? 6 : 8;
  const displayedProducts = filteredProducts.slice(0, initialLimit);
  const hasMoreProducts = filteredProducts.length > initialLimit;
  const remainingCount = filteredProducts.length - initialLimit;

  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (!hash) return;

      const rawTag = decodeURIComponent(hash.slice(1)).trim();
      if (!rawTag) return;

      // Check if target is #evento or #eventos
      if (isEventTag(rawTag)) {
        scrollToEventsSection();
        const t1 = setTimeout(scrollToEventsSection, 80);
        const t2 = setTimeout(scrollToEventsSection, 250);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }

      if (rawTag === 'produtos' || rawTag === 'todos' || rawTag === 'catalogo') {
        setSelectedCategory('all');
        setSearchQuery('');
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        return;
      }

      const targetSlug = resolveCategorySlug(rawTag, settings.categories);
      setSelectedCategory(targetSlug);
      setSearchQuery('');

      // Execute smooth scrolling only if navigating specifically to a category slug
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

  const navigate = useNavigate();
  const location = useLocation();

  const handlePromoBannerClick = (e: React.MouseEvent<HTMLAnchorElement>, rawLink?: string) => {
    const link = (rawLink || '#produtos').trim();
    if (!link) return;

    const isAnchorOrCategory =
      link.startsWith('#') ||
      (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('/'));

    if (isAnchorOrCategory) {
      e.preventDefault();
      const rawTarget = decodeURIComponent(link.replace(/^#/, '')).trim();

      if (isEventTag(rawTarget)) {
        const newHash = '#evento';
        if (window.location.hash !== newHash) {
          window.history.pushState(null, '', newHash);
        }
        if (location.pathname !== '/') {
          navigate('/' + newHash);
          setTimeout(scrollToEventsSection, 150);
        } else {
          scrollToEventsSection();
        }
        return;
      }

      const targetSlug = resolveCategorySlug(rawTarget, settings.categories);
      setSelectedCategory(targetSlug);
      setSearchQuery('');

      const newHash = targetSlug === 'all' ? '#produtos' : `#${targetSlug}`;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash);
      }

      if (location.pathname !== '/') {
        navigate('/' + newHash);
        setTimeout(scrollToCatalogSection, 150);
      } else {
        scrollToCatalogSection();
      }
      return;
    }

    if (link.startsWith('http://') || link.startsWith('https://')) {
      window.open(link, '_blank', 'noopener,noreferrer');
      e.preventDefault();
      return;
    }

    navigate(link);
    e.preventDefault();
  };

  const promoImage =
    settings.promoBannerActive !== false
      ? (settings.promoBannerUrl || DEFAULT_SETTINGS.promoBannerUrl)
      : null;

  return (
    <div className="flex-1 w-full flex flex-col">
      {/* Full-width Edge-to-Edge Hero Carousel right beneath topbar */}
      <HeroCarousel />

      {/* Welcome Section - Balanced typography & elegant proportion */}
      <motion.section
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-3 text-center space-y-3 w-full"
      >
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-charcoal tracking-tight leading-snug max-w-2xl mx-auto">
          {settings.welcomeTitle}
        </h2>

        <p className="text-brand-muted text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-lg mx-auto">
          {settings.welcomeSubtitle}
        </p>
      </motion.section>

      {/* Full-width Edge-to-Edge 21:9 Promotional Banner */}
      {promoImage && (
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full overflow-hidden select-none my-4 sm:my-8 bg-[#FAF8F5]"
        >
          {settings.promoBannerLink ? (
            <a
              href={settings.promoBannerLink}
              onClick={(e) => handlePromoBannerClick(e, settings.promoBannerLink)}
              className="block w-full group relative overflow-hidden cursor-pointer"
            >
              <img
                src={promoImage}
                alt="Banner Bellclay"
                className="w-full aspect-[21/9] object-cover transition-transform duration-700 ease-out group-hover:scale-101"
                loading="lazy"
              />
            </a>
          ) : (
            <div className="w-full relative overflow-hidden">
              <img
                src={promoImage}
                alt="Banner Bellclay"
                className="w-full aspect-[21/9] object-cover"
                loading="lazy"
              />
            </div>
          )}
        </motion.section>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-8 sm:pb-14 w-full space-y-8 sm:space-y-12">

        {/* Categories & Catalog Section */}
        <section id="produtos" className="space-y-4 sm:space-y-6 scroll-mt-24 sm:scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-1 px-1"
          >
            <div>
              <h3 className="font-serif text-[22px] sm:text-2xl md:text-3xl font-extrabold text-brand-charcoal tracking-tight">
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
          </motion.div>

          {/* Category Filter Pills */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.85, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <CategoryPills />
          </motion.div>

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
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 pt-2">
                {displayedProducts.map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>

              {/* "Ver mais" Button (6 on mobile, 8 on computer initial limit) - Opens full Products Page */}
              {hasMoreProducts && (
                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-8 sm:pt-10 flex flex-col items-center justify-center"
                >
                  <button
                    type="button"
                    onClick={() => navigate('/produtos')}
                    className="group inline-flex items-center gap-2.5 px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-white hover:bg-brand-pink-subtle border-2 border-brand-pink/35 hover:border-brand-pink text-brand-charcoal hover:text-brand-pink font-extrabold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all duration-200 transform hover:scale-102 active:scale-98 cursor-pointer"
                  >
                    <span>Ver mais anúncios</span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-brand-pink/15 text-brand-pink font-extrabold group-hover:bg-brand-pink group-hover:text-white transition-colors">
                      +{remainingCount}
                    </span>
                    <ArrowRight className="w-4 h-4 text-brand-pink group-hover:translate-x-1 transition-transform" />
                  </button>
                  <span className="text-[11px] text-brand-muted mt-2">
                    Exibindo {displayedProducts.length} de {filteredProducts.length} peças
                  </span>
                </motion.div>
              )}
            </>
          )}
        </section>

        {/* Section: Eventos Bellclay */}
        <EventsCarousel />

      </div>
    </div>
  );
};
