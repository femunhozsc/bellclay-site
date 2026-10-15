import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, X, ChevronRight } from 'lucide-react';
import { WhatsAppIcon } from './SocialIcons';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems, subtotal, setIsOpen: setIsCartOpen } = useCart();
  const { settings, searchQuery, setSearchQuery, products, isLoading } = useSettings();
  const { customerProfile } = useAuth();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const whatsappNumber = (settings.whatsapp || "5544991074932").replace(/\D/g, '') || "5544991074932";
  const whatsappMessage = encodeURIComponent(
    "Olá Bellclay! Estive no site e adorei os artesanatos em cerâmica fria. Gostaria de tirar uma dúvida sobre uma peça!"
  );

  // Normalize string for live matching
  const normalize = (str: string) =>
    (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

  const queryNormalized = normalize(searchQuery);

  // Instant live matched items (up to 5 for instant dropdown preview)
  const matchedPreviewProducts = queryNormalized
    ? products.filter((p) => {
        return (
          normalize(p.title).includes(queryNormalized) ||
          normalize(p.description || '').includes(queryNormalized) ||
          normalize(p.category || '').includes(queryNormalized) ||
          p.tags?.some((t) => normalize(t).includes(queryNormalized))
        );
      }).slice(0, 5)
    : [];

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleSelectProduct = (slug: string) => {
    setSearchQuery('');
    setIsMobileSearchOpen(false);
    navigate(`/produto/${slug}`);
  };

  const handleViewAllResults = () => {
    setIsMobileSearchOpen(false);
    if (location.pathname !== '/') {
      navigate('/');
    }
    setTimeout(() => {
      const elem = document.getElementById('produtos');
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  // Close preview dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        // keep query but close if needed
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Announcement Bar - Instant render from cache without layout jumping */}
      {settings.announcementActive && Boolean(settings.announcementText?.trim()) && (
        <div className="w-full bg-gradient-to-r from-brand-pink via-[#ff8394] to-brand-green py-2 px-3 text-white text-[11px] sm:text-xs font-semibold text-center tracking-wide relative z-30 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <span>{settings.announcementText}</span>
          </div>
        </div>
      )}

      {/* Main Topbar - Always visible on scroll (Sticky Top-0) */}
      <header className="sticky top-0 z-40 w-full bg-[#FDFBF7]/95 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3.5 sm:py-4.5 gap-2 sm:gap-4 min-h-[80px] sm:min-h-[92px]">
          
          {/* Left: LOGO ONLY with comfortable margin and plenty of vertical room */}
          <div className="flex items-center shrink-0 pl-1.5 sm:pl-3">
            <Link 
              to="/" 
              className="flex items-center transition-transform hover:scale-105 active:scale-95 duration-200"
              aria-label="Bellclay Artesanatos"
            >
              <img
                src="/bellclay_logo.png"
                alt="Bellclay Artesanatos"
                className="h-12 sm:h-16 w-auto max-h-[60px] object-contain"
              />
            </Link>
          </div>

          {/* Center: Search Bar with Live Instant Results Popover (Desktop) */}
          <div ref={searchContainerRef} className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-6 relative">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder="Buscar chaveiros, bottons, esculturas..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{ outline: 'none' }}
                className="w-full bg-[#F5EFE6]/80 hover:bg-[#F5EFE6] focus:bg-white text-brand-charcoal text-xs sm:text-sm rounded-full pl-11 pr-10 py-3 border border-brand-border/80 focus:border-brand-pink outline-none transition-all duration-200 shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal cursor-pointer p-1"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Live Search Results Popover */}
            {queryNormalized && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-brand-border/80 shadow-2xl overflow-hidden z-50 p-2 space-y-1">
                <div className="px-3 py-1.5 text-[11px] font-bold text-brand-muted border-b border-brand-border/50 flex justify-between">
                  <span>Resultados instantâneos ({matchedPreviewProducts.length})</span>
                  {matchedPreviewProducts.length > 0 && (
                    <button
                      onClick={handleViewAllResults}
                      className="text-brand-pink hover:underline cursor-pointer"
                    >
                      Ver todos no catálogo
                    </button>
                  )}
                </div>

                {matchedPreviewProducts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-brand-muted">
                    Nenhuma peça encontrada com "{searchQuery}".
                  </div>
                ) : (
                  matchedPreviewProducts.map((p) => {
                    const price = p.promotionalPrice || p.price;
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p.slug)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                      >
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs font-bold text-brand-charcoal block truncate">
                            {p.title}
                          </span>
                          <span className="text-[10px] text-brand-muted">
                            {p.category}
                          </span>
                        </div>
                        <span className="text-xs font-extrabold text-brand-pink shrink-0">
                          R$ {price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3 pr-1">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="md:hidden p-2.5 rounded-full text-brand-charcoal hover:bg-brand-pink-subtle/50 transition-colors cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WhatsApp Contact with predefined message to 44991074932 */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-brand-green-subtle text-brand-green hover:bg-brand-green hover:text-white transition-all duration-200 cursor-pointer shadow-xs"
              title="Fale conosco no WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4 shrink-0 fill-current" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Account Profile */}
            <Link
              to="/minha-conta"
              className="p-2 sm:p-2.5 rounded-full text-brand-charcoal hover:bg-brand-pink-subtle/50 transition-colors cursor-pointer relative"
              aria-label="Minha Conta"
              title={customerProfile.name ? `Minha Conta (${customerProfile.name})` : "Minha Conta"}
            >
              <User className="w-5 h-5 text-brand-charcoal" />
            </Link>

            {/* Shopping Cart Button */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 bg-gradient-to-r from-brand-pink to-[#f56377] text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-pink-soft hover:shadow-soft-hover transition-all duration-200 cursor-pointer"
              aria-label="Carrinho de Compras"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-brand-green text-white text-[10px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold tracking-wide">
                {subtotal > 0 ? `R$ ${subtotal.toFixed(2).replace('.', ',')}` : <span className="hidden sm:inline">Carrinho</span>}
              </span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Search Bar Dropdown (Lowered with no blue border or cutoff + instant results) */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden pt-2 pb-4 px-1"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Buscar chaveiros, bottons, esculturas..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  style={{ outline: 'none' }}
                  className="w-full bg-[#F5EFE6] focus:bg-white text-brand-charcoal text-xs sm:text-sm rounded-full pl-11 pr-10 py-3 border border-brand-border/80 focus:border-brand-pink outline-none transition-all shadow-xs"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal cursor-pointer p-1"
                    aria-label="Limpar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Results on Mobile right under the input */}
              {queryNormalized && (
                <div className="mt-2 bg-white rounded-2xl border border-brand-border/80 shadow-lg p-2 space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-brand-muted flex justify-between">
                    <span>Resultados ({matchedPreviewProducts.length})</span>
                    {matchedPreviewProducts.length > 0 && (
                      <button
                        onClick={handleViewAllResults}
                        className="text-brand-pink font-semibold underline"
                      >
                        Ver no catálogo
                      </button>
                    )}
                  </div>

                  {matchedPreviewProducts.length === 0 ? (
                    <div className="p-3 text-center text-xs text-brand-muted">
                      Nenhuma peça encontrada.
                    </div>
                  ) : (
                    matchedPreviewProducts.map((p) => {
                      const price = p.promotionalPrice || p.price;
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p.slug)}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#FAF8F5] cursor-pointer"
                        >
                          <img
                            src={p.images[0]}
                            alt={p.title}
                            className="w-10 h-10 rounded-lg object-cover bg-gray-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-bold text-brand-charcoal block truncate">
                              {p.title}
                            </span>
                            <span className="text-[10px] text-brand-muted">{p.category}</span>
                          </div>
                          <span className="text-xs font-extrabold text-brand-pink shrink-0">
                            R$ {price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
    </>
  );
};
