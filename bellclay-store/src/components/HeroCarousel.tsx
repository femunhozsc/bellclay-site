import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
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

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % activeBanners.length);
  };

  return (
    <div
      className="relative w-full overflow-hidden py-4 sm:py-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#FFF0F2] via-[#FDFBF7] to-[#F1F8EC] border border-brand-border/60 shadow-soft min-h-[380px] sm:min-h-[460px] flex items-center">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id || currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-12 lg:p-16 gap-8 z-10"
            >
              {/* Left Column: Text & CTA */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
                {current.badge && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 backdrop-blur-xs text-brand-pink border border-brand-pink/20 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{current.badge}</span>
                  </motion.div>
                )}

                <motion.h1
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-charcoal leading-[1.15] tracking-tight"
                >
                  {current.title}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-brand-muted text-sm sm:text-base lg:text-lg max-w-xl font-normal leading-relaxed"
                >
                  {current.subtitle}
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-2 flex flex-wrap items-center gap-4"
                >
                  <a
                    href={current.buttonLink || "#produtos"}
                    className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-semibold text-sm shadow-pink-soft hover:shadow-soft-hover transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <span>{current.buttonText || "Explorar Peças"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>

                  <div className="text-xs text-brand-muted flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                    <span>Envios para todo o Brasil de Campo Mourão - PR</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Featured Image with Organic Clay Border */}
              <div className="lg:col-span-5 flex justify-center items-center">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.5 }}
                  className="relative group w-full max-w-[320px] sm:max-w-[380px] aspect-4/3 sm:aspect-square"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-brand-pink/30 to-brand-green/30 rounded-3xl blur-xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500"></div>
                  <img
                    src={current.imageUrl}
                    alt={current.title}
                    className="relative w-full h-full object-cover rounded-3xl border-4 border-white shadow-soft transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                  <div className="absolute -bottom-3 -right-3 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-md border border-brand-border/60 flex items-center gap-1.5 text-[11px] font-bold text-brand-charcoal">
                    <span>Modelado 100% à mão</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Carousel Arrows */}
          {activeBanners.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-brand-charcoal shadow-md border border-brand-border/50 hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/80 hover:bg-white text-brand-charcoal shadow-md border border-brand-border/50 hover:scale-110 active:scale-95 transition-all duration-200 z-20 cursor-pointer"
                aria-label="Próximo slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Dots Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
                {activeBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`transition-all duration-300 rounded-full cursor-pointer ${
                      currentIndex === idx
                        ? 'w-7 h-2 bg-brand-pink'
                        : 'w-2 h-2 bg-brand-charcoal/20 hover:bg-brand-charcoal/40'
                    }`}
                    aria-label={`Ir para slide ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
