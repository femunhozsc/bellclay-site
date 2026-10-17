import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductPage } from './pages/ProductPage';
import { EventPage } from './pages/EventPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { trackEvent } from './services/firebase';

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Clean up residual #produtos or #todos hash so page always enters 100% at the top
    if (window.location.hash === '#produtos' || window.location.hash === '#todos') {
      window.history.replaceState(null, '', window.location.pathname);
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    // Force scroll to top if there is no explicit anchor in the URL
    if (!hash && !window.location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, [pathname, hash]);

  return null;
};

export const App: React.FC = () => {
  const location = useLocation();
  const isCheckout = location.pathname.startsWith('/checkout');

  useEffect(() => {
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#FDFBF7] text-brand-charcoal font-sans selection:bg-brand-pink/20 selection:text-brand-pink">
      <ScrollToTop />

      {/* Main Header (Hidden during streamlined Checkout) */}
      {!isCheckout && <Header />}

      {/* Dynamic Route Pages */}
      <div className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/produtos" element={<ProductsPage />} />
          <Route path="/produtos/:categorySlug" element={<ProductsPage />} />
          <Route path="/produto/:slug" element={<ProductPage />} />
          <Route path="/evento/:slug" element={<EventPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/minha-conta" element={<AccountPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </div>

      {/* Main Footer (Hidden during streamlined Checkout) */}
      {!isCheckout && <Footer />}

      {/* Global Shopping Cart Drawer */}
      <CartDrawer />
    </div>
  );
};
