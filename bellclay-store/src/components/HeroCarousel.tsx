import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const HeroCarousel: React.FC = () => {
  const { settings } = useSettings();
  const activeBanners = settings.banners.filter(b => b.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeBanners.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex] || activeBanners[0];

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleDragEnd = (_: any, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold || info.velocity.x < -400) {
      handleNext();
    } else if (info.offset.x > swipeThreshold || info.velocity.x > 400) {
      handlePrev();
    }
  };

  return (
    <div
      className="relative w-full overflow-hidden bg-gradient-to-b from-[#FFF0F2] via-[#FDFBF7] to-[#FDFBF7] border-b border-brand-border/40 select-none touch-pan-y"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12 lg:py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id || currentIndex}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragStart={() => setIsPaused(true)}
            onDragEnd={handleDragEnd}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-6 sm:gap-10 cursor-grab active:cursor-grabbing"
          >
            {/* Left Column: Text & CTA */}
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-5 text-left order-2 lg:order-1">
              {current.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold uppercase tracking-wider bg-brand-pink/10 text-brand-pink border border-brand-pink/20">
                  <span>{current.badge}</span>
                </div>
              )}

              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal leading-[1.18] tracking-tight">
                {current.title}
              </h1>

              <p className="text-brand-muted text-xs sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed">
                {current.subtitle}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3 sm:gap-4">
                <a
                  href={current.buttonLink || "#produtos"}
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-xs sm:text-sm shadow-pink-soft hover:shadow-soft-hover transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <span>{current.buttonText || "Explorar Peças"}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <div className="text-[11px] sm:text-xs text-brand-muted flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                  <span>Envios de Campo Mourão - PR para todo o Brasil</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Image - Framed clean and organic without heavy cards */}
            <div className="lg:col-span-5 flex justify-center items-center order-1 lg:order-2">
              <div className="relative w-full max-w-[280px] sm:max-w-[360px] lg:max-w-[420px] aspect-4/3 sm:aspect-square">
                <img
                  src={current.imageUrl}
                  alt={current.title}
                  draggable={false}
                  className="w-full h-full object-cover rounded-3xl shadow-soft"
                />
                <div className="absolute -bottom-2.5 right-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm border border-brand-border/60 text-[10px] sm:text-xs font-bold text-brand-charcoal">
                  Feito à mão em cerâmica fria
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Swipe Hint & Dots */}
        {activeBanners.length > 1 && (
          <div className="pt-4 flex items-center justify-between">
            <span className="text-[10px] text-brand-muted font-medium sm:hidden">
              Arraste para os lados para navegar
            </span>
            <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
              {activeBanners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    currentIndex === idx
                      ? 'w-6 h-1.5 bg-brand-pink'
                      : 'w-1.5 h-1.5 bg-brand-charcoal/20 hover:bg-brand-charcoal/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
