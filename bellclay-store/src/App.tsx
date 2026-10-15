import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from './components/Header';
import { HeroCarousel } from './components/HeroCarousel';
import { CategoryPills } from './components/CategoryPills';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { useSettings } from './context/SettingsContext';
import { Sparkles, Heart, PackageCheck, ShieldCheck, Flame } from 'lucide-react';

export const App: React.FC = () => {
  const { settings, filteredProducts, searchQuery, selectedCategory, isLoading } = useSettings();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-brand-charcoal font-sans selection:bg-brand-pink/20 selection:text-brand-pink">
      {/* Header */}
      <Header />

      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-10">
        
        {/* Welcome Section (Editable via Admin Panel) */}
        <section className="text-center max-w-3xl mx-auto space-y-3 pt-2">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-pink-subtle/80 text-brand-pink"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ateliê Artesanal em Campo Mourão - PR</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl font-extrabold text-brand-charcoal tracking-tight"
          >
            {settings.welcomeTitle}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-brand-muted text-sm sm:text-base leading-relaxed"
          >
            {settings.welcomeSubtitle}
          </motion.p>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="p-3 rounded-2xl bg-white border border-brand-border/60 shadow-xs flex flex-col items-center text-center">
              <Sparkles className="w-5 h-5 text-brand-pink mb-1" />
              <span className="text-xs font-bold text-brand-charcoal">100% Cerâmica Fria</span>
              <span className="text-[10px] text-brand-muted">Modelado à mão</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-brand-border/60 shadow-xs flex flex-col items-center text-center">
              <ShieldCheck className="w-5 h-5 text-brand-green mb-1" />
              <span className="text-xs font-bold text-brand-charcoal">Resina Vitrificada</span>
              <span className="text-[10px] text-brand-muted">Alta durabilidade</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-brand-border/60 shadow-xs flex flex-col items-center text-center">
              <PackageCheck className="w-5 h-5 text-brand-pink mb-1" />
              <span className="text-xs font-bold text-brand-charcoal">Envio Seguro</span>
              <span className="text-[10px] text-brand-muted">Para todo o Brasil</span>
            </div>
            <div className="p-3 rounded-2xl bg-white border border-brand-border/60 shadow-xs flex flex-col items-center text-center">
              <Heart className="w-5 h-5 text-brand-green mb-1" />
              <span className="text-xs font-bold text-brand-charcoal">Mercado Pago</span>
              <span className="text-[10px] text-brand-muted">Pix & Cartões</span>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section id="produtos" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-brand-border/60 pb-3">
            <div>
              <h3 className="font-serif text-2xl font-bold text-brand-charcoal flex items-center gap-2">
                <span>Catálogo de Artesanatos</span>
                <Flame className="w-5 h-5 text-brand-pink" />
              </h3>
              <p className="text-xs text-brand-muted">
                Escolha uma categoria ou filtre pelas suas peças favoritas
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-muted">
              Mostrando {filteredProducts.length} peças
            </span>
          </div>

          {/* Category Filter Pills */}
          <CategoryPills />

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-3xl p-4 border border-brand-border animate-pulse space-y-3">
                  <div className="aspect-square bg-gray-200 rounded-2xl"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-brand-border p-8 space-y-3">
              <p className="font-serif text-xl font-bold text-brand-charcoal">Nenhuma peça encontrada</p>
              <p className="text-xs text-brand-muted max-w-sm mx-auto">
                Não encontramos resultados para sua busca ou categoria. Tente limpar os filtros para ver todas as fofuras!
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 pt-2"
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </motion.div>
          )}
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      <ProductModal />
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <AuthModal />
    </div>
  );
};
