import React, { useEffect, useRef } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X, ArrowLeft, ShoppingBag, Sparkles } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { ProductCard } from '../components/ProductCard';
import { CategoryPills } from '../components/CategoryPills';
import { resolveCategorySlug } from '../utils/categoryResolver';

export const ProductsPage: React.FC = () => {
  const {
    products,
    filteredProducts,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    settings
  } = useSettings();

  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchParams] = useSearchParams();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync title and handle query parameters or route params on mount
  useEffect(() => {
    document.title = 'Catálogo de Produtos | Bellclay Artesanatos';

    // Route param (e.g., /produtos/chaveiros)
    if (categorySlug) {
      const resolved = resolveCategorySlug(categorySlug, settings.categories);
      setSelectedCategory(resolved);
    } else {
      const catQuery = searchParams.get('categoria');
      if (catQuery) {
        const resolved = resolveCategorySlug(catQuery, settings.categories);
        setSelectedCategory(resolved);
      }
    }

    const buscaQuery = searchParams.get('busca');
    if (buscaQuery !== null && buscaQuery !== undefined) {
      setSearchQuery(buscaQuery);
    }
  }, [categorySlug, searchParams, settings.categories, setSelectedCategory, setSearchQuery]);

  const activeCategoryObj = settings.categories.find(
    (c) =>
      c.slug.toLowerCase() === selectedCategory.toLowerCase() ||
      c.name.toLowerCase() === selectedCategory.toLowerCase()
  );

  const categoryDisplayName =
    selectedCategory === 'all'
      ? 'Todos os Artesanatos'
      : activeCategoryObj?.name || selectedCategory;

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="flex-1 w-full bg-[#FDFBF7] pb-16 sm:pb-24">
      {/* Page Breadcrumbs & Navigation Header */}
      <div className="border-b border-brand-border/40 bg-white/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-brand-muted">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-charcoal hover:text-brand-pink transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Voltar ao Início</span>
            </Link>
            <span>/</span>
            <span className="text-brand-charcoal font-bold">Catálogo de Produtos</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pt-5 sm:pt-8 space-y-6 sm:space-y-8">
        {/* Page Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-1"
        >
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-pink fill-brand-pink/20" />
              <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-extrabold text-brand-charcoal tracking-tight">
                {searchQuery ? 'Resultados da Busca' : categoryDisplayName}
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-2xl">
              {searchQuery
                ? `Exibindo artesanatos que coincidem com o termo "${searchQuery}".`
                : 'Todas as nossas criações colecionáveis modeladas à mão em cerâmica fria com acabamento vitrificado.'}
            </p>
          </div>
        </motion.div>

        {/* Real-time Search Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full"
        >
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar por nome da peça, chaveiro, botton, escultura..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white text-brand-charcoal text-xs sm:text-sm sm:text-base rounded-2xl pl-12 pr-12 py-3.5 sm:py-4 border-none outline-none shadow-xs hover:shadow-sm focus:shadow-md transition-all duration-200"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  searchInputRef.current?.focus();
                }}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal cursor-pointer p-1.5 transition-colors"
                aria-label="Limpar busca"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="flex items-center justify-between text-xs text-brand-muted pt-2 px-1">
              <span>
                Filtrando catálogo por: <strong className="text-brand-charcoal font-bold">"{searchQuery}"</strong>
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-brand-pink hover:underline font-bold cursor-pointer"
              >
                Limpar busca
              </button>
            </div>
          )}
        </motion.div>

        {/* Category Sections Tab Bar (No rounded badges, side-drag support) */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        >
          <CategoryPills layoutId="productsPageCategoryActiveTab" updateHash={false} />
        </motion.div>

        {/* Products Grid - Identical Card Style & Responsive Grid */}
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
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 sm:py-20 bg-white rounded-3xl p-8 space-y-4 border border-brand-border/60 shadow-xs max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-brand-pink-subtle text-brand-pink flex items-center justify-center mx-auto">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal">
                Nenhuma peça encontrada
              </h3>
              <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto leading-relaxed">
                Não localizamos nenhuma peça correspondente aos filtros atuais. Tente buscar com outros termos ou selecione outra categoria.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white text-xs sm:text-sm font-bold shadow-soft transition-all cursor-pointer"
              >
                Ver Todas as Peças ({products.length})
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 pt-2">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
