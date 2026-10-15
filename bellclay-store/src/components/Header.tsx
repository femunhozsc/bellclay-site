import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, MessageCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { totalItems, subtotal, setIsOpen: setIsCartOpen } = useCart();
  const { settings, searchQuery, setSearchQuery } = useSettings();
  const { customerProfile } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const whatsappNumber = "5544991074932";
  const whatsappMessage = encodeURIComponent(
    "Olá Bellclay! Estive no site e adorei os artesanatos em cerâmica fria. Gostaria de tirar uma dúvida sobre uma peça!"
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDFBF7]/95 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300">
      {/* Announcement Bar without sparkle/ai icons */}
      {settings.announcementActive && settings.announcementText && (
        <div className="bg-gradient-to-r from-brand-pink via-[#ff8394] to-brand-green py-2 px-3 text-white text-[11px] sm:text-xs font-semibold text-center tracking-wide">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <span>{settings.announcementText}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
          
          {/* Left: LOGO ONLY (No text, as requested) */}
          <div className="flex items-center shrink-0">
            <Link 
              to="/" 
              className="flex items-center transition-transform hover:scale-105 active:scale-95 duration-200"
              aria-label="Bellclay Artesanatos"
            >
              <img
                src="/bellclay_logo.png"
                alt="Bellclay Artesanatos"
                className="h-12 sm:h-16 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4 lg:mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder="Buscar chaveiros, bottons, esculturas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5EFE6]/70 hover:bg-[#F5EFE6] focus:bg-white text-brand-charcoal text-xs sm:text-sm rounded-full pl-10 pr-10 py-2.5 border border-transparent focus:border-brand-pink/40 focus:ring-2 focus:ring-brand-pink/20 outline-hidden transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 rounded-full text-brand-charcoal hover:bg-brand-pink-subtle/50 transition-colors cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WhatsApp Contact with predefined message to 44991074932 */}
            <a
              href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-brand-green-subtle text-brand-green hover:bg-brand-green hover:text-white transition-all duration-200 cursor-pointer shadow-xs"
              title="Fale conosco no WhatsApp"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Account Profile - Dedicated Page, No popup */}
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

        {/* Mobile Search Bar Dropdown */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden pb-3 overflow-hidden"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Buscar peças em cerâmica fria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F5EFE6] text-brand-charcoal text-xs rounded-full pl-10 pr-10 py-2 border border-transparent focus:border-brand-pink/40 focus:ring-1 focus:ring-brand-pink/30 outline-hidden"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-charcoal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
