import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

import { resolveCategorySlug, scrollToCatalogSection, isEventTag, scrollToEventsSection } from '../utils/categoryResolver';

const normalizeText = (str: string) =>
  (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export const HeroCarousel: React.FC = () => {
  const { settings, setSelectedCategory, setSearchQuery } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();
  const activeBanners = settings.banners.filter((b) => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isPaused, setIsPaused] = useState(false);

  const handleBannerButtonClick = (e: React.MouseEvent<HTMLAnchorElement>, rawLink?: string) => {
    const link = (rawLink || '#produtos').trim();

    // Check if it's an anchor starting with '#' or a simple category/product target
    const isAnchorOrCategory =
      link.startsWith('#') ||
      (!link.startsWith('http://') && !link.startsWith('https://') && !link.startsWith('/'));

    if (isAnchorOrCategory) {
      e.preventDefault();
      const rawTarget = decodeURIComponent(link.replace(/^#/, '')).trim();

      // Check if button target is #evento or #eventos
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
          setTimeout(scrollToEventsSection, 80);
          setTimeout(scrollToEventsSection, 250);
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
        setTimeout(scrollToCatalogSection, 80);
        setTimeout(scrollToCatalogSection, 250);
      }
      return;
    }

    // Internal path route (e.g. /checkout, /minha-conta)
    if (link.startsWith('/')) {
      e.preventDefault();
      navigate(link);
      return;
    }

    // External link: allowed to navigate normally
  };

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setSlideDirection('right');
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5500);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) {
    return (
      <div className="relative w-full h-[480px] sm:h-[580px] md:h-[640px] bg-[#F7F4EE] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-pink border-t-transparent animate-spin opacity-30" />
      </div>
    );
  }

  const current = activeBanners[currentIndex] || activeBanners[0];

  const handleNext = () => {
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleSelectSlide = (idx: number) => {
    if (idx === currentIndex) return;
    setSlideDirection(idx > currentIndex ? 'right' : 'left');
    setCurrentIndex(idx);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 40;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -250) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 250) {
      handlePrev();
    }
  };

  // Variantes de animação: arrasto para o lado com suave fade branco
  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0,
      scale: 1
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring' as const, stiffness: 280, damping: 32 },
        opacity: { duration: 0.45, ease: 'easeOut' as const },
        scale: { duration: 0.45 }
      }
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: 'spring' as const, stiffness: 280, damping: 32 },
        opacity: { duration: 0.35, ease: 'easeIn' as const },
        scale: { duration: 0.35 }
      }
    })
  };

  return (
    <div
      className="relative w-full h-[480px] sm:h-[580px] md:h-[640px] overflow-hidden select-none bg-white touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
        <motion.div
          key={current.id || currentIndex}
          custom={slideDirection}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragStart={() => setIsPaused(true)}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing bg-white"
        >
          {/* Background Photo Occupying 100% of Width & Height */}
          <img
            src={current.imageUrl}
            alt={current.title}
            draggable={false}
            className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
          />

          {/* Flash/Fade branco sutil nas transições */}
          <div className="absolute inset-0 bg-white/10 pointer-events-none mix-blend-screen" />

          {/* Bottom-to-Top Fade Gradient transitioning into Title & Subtitle */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 via-55% to-black/10" />

          {/* Vibrant Pink & Green Ambient Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-pink/40 via-transparent to-brand-green/35 mix-blend-soft-light pointer-events-none" />

          {/* Content Overlay directly over the bottom fade */}
          <div className="absolute inset-x-0 bottom-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12 sm:pb-16 pt-20 flex flex-col items-start text-left space-y-4 sm:space-y-6">
              
              {/* Large, High-Impact Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] drop-shadow-lg max-w-4xl"
              >
                {current.title}
              </motion.h1>

              {/* Large, Readable Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-white/95 text-sm sm:text-lg md:text-xl font-normal leading-relaxed max-w-2xl drop-shadow-md"
              >
                {current.subtitle}
              </motion.p>

              {/* Big "Ver Coleção" CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="pt-2 sm:pt-4"
              >
                <a
                  href={current.buttonLink || "#produtos"}
                  onClick={(e) => handleBannerButtonClick(e, current.buttonLink)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-4.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-extrabold text-sm sm:text-base shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer touch-auto"
                >
                  <span>{current.buttonText || "Ver Coleção"}</span>
                  <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                </a>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Dots at Bottom Center */}
      {activeBanners.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-20 flex items-center justify-center gap-2">
          {activeBanners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectSlide(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                currentIndex === idx
                  ? 'w-7 h-2 bg-white shadow-md'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
