import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, User, MessageCircle, X, Sparkles, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { totalItems, subtotal, setIsOpen: setIsCartOpen } = useCart();
  const { settings, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = useSettings();
  const { currentUser, customerProfile, setIsAuthModalOpen } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDFBF7]/90 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300">
      {/* Announcement Bar */}
      {settings.announcementActive && settings.announcementText && (
        <div className="bg-gradient-to-r from-brand-pink via-[#ff8897] to-brand-green py-2 px-4 text-white text-xs sm:text-sm font-medium text-center shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-200 animate-spin-slow shrink-0" />
            <span>{settings.announcementText}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Left: LOGO ONLY (No text, as requested) */}
          <div className="flex items-center shrink-0">
            <a 
              href="/" 
              className="group relative flex items-center transition-transform hover:scale-105 active:scale-95 duration-200"
              aria-label="Bellclay Artesanatos"
            >
              <img
                src="/bellclay_logo.png"
                alt="Bellclay Artesanatos Logo"
                className="h-14 sm:h-16 w-auto object-contain drop-shadow-xs"
              />
            </a>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="text"
                placeholder="Buscar chaveiros, bottons, esculturas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#F5EFE6]/70 hover:bg-[#F5EFE6] focus:bg-white text-brand-charcoal text-sm rounded-full pl-10 pr-10 py-2.5 border border-transparent focus:border-brand-pink/40 focus:ring-2 focus:ring-brand-pink/20 outline-hidden transition-all duration-200"
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
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2.5 rounded-full text-brand-charcoal hover:bg-brand-pink-subtle/50 transition-colors cursor-pointer"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* WhatsApp Contact */}
            <a
              href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent('Olá Bellclay! Vim pelo site e gostaria de tirar uma dúvida sobre as peças em cerâmica fria.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full bg-brand-green-subtle text-brand-green hover:bg-brand-green hover:text-white transition-all duration-200 cursor-pointer shadow-xs"
              title="Fale conosco no WhatsApp"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            {/* Account Profile */}
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-2 p-2.5 rounded-full text-brand-charcoal hover:bg-brand-pink-subtle/50 transition-colors cursor-pointer relative"
              aria-label="Minha Conta"
              title={customerProfile.name ? `Logado como ${customerProfile.name}` : "Minha Conta"}
            >
              <User className="w-5 h-5 text-brand-charcoal" />
              {customerProfile.name && !customerProfile.isGuest && (
                <span className="hidden xl:inline text-xs font-medium text-brand-charcoal max-w-[80px] truncate">
                  {customerProfile.name.split(' ')[0]}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2.5 bg-gradient-to-r from-brand-pink to-[#f56377] text-white px-4 py-2.5 rounded-full shadow-pink-soft hover:shadow-soft-hover transition-all duration-200 cursor-pointer"
              aria-label="Carrinho de Compras"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-brand-green text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-bold tracking-wide">
                {subtotal > 0 ? `R$ ${subtotal.toFixed(2).replace('.', ',')}` : 'Carrinho'}
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
              className="md:hidden pb-4 overflow-hidden"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Buscar peças em cerâmica fria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#F5EFE6] text-brand-charcoal text-sm rounded-full pl-10 pr-10 py-2.5 border border-transparent focus:border-brand-pink/40 focus:ring-2 focus:ring-brand-pink/20 outline-hidden"
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
