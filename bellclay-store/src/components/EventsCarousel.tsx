import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

// Guarda se a seção de eventos já foi animada uma vez para nunca mais sumir ou reanimar ao rolar a página
let hasAnimatedEventsSection = false;

export const EventsCarousel: React.FC = () => {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const activeEvents = (settings.events || []).filter((e) => e.active);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (activeEvents.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setSlideDirection('right');
      setCurrentIndex((prev) => (prev + 1) % activeEvents.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [activeEvents.length, isPaused]);

  if (activeEvents.length === 0) return null;

  const current = activeEvents[currentIndex] || activeEvents[0];

  const handleNext = () => {
    setSlideDirection('right');
    setCurrentIndex((prev) => (prev + 1) % activeEvents.length);
  };

  const handlePrev = () => {
    setSlideDirection('left');
    setCurrentIndex((prev) => (prev - 1 + activeEvents.length) % activeEvents.length);
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

  // Variantes de animação: arrasto para o lado fluido e acelerado por hardware
  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { duration: 0.4, ease: [0.25, 1, 0.5, 1] as const },
        opacity: { duration: 0.32, ease: 'easeOut' as const }
      }
    },
    exit: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { duration: 0.36, ease: [0.25, 1, 0.5, 1] as const },
        opacity: { duration: 0.25, ease: 'easeIn' as const }
      }
    })
  };

  const handleOpenEvent = (slug: string) => {
    navigate(`/evento/${slug}`);
  };

  return (
    <motion.section
      id="eventos"
      initial={hasAnimatedEventsSection ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      onViewportEnter={() => { hasAnimatedEventsSection = true; }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 scroll-mt-24 relative"
    >
      <div id="evento" className="absolute -top-24 pointer-events-none" />
      {/* Section Header */}
      <motion.div
        initial={hasAnimatedEventsSection ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-brand-border/60 pb-3 px-1"
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-pink fill-brand-pink/20" />
            <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-extrabold text-brand-charcoal tracking-tight">
              Eventos Bellclay
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
            Acompanhe nossas participações em feiras culturais, oficinas de modelagem e encontros de artesanato
          </p>
        </div>
        <span className="text-xs sm:text-sm font-semibold text-brand-muted self-start sm:self-auto">
          {activeEvents.length} {activeEvents.length === 1 ? 'evento em destaque' : 'eventos em destaque'}
        </span>
      </motion.div>

      {/* High-Impact Banner-style Event Carousel with Rounded Edges */}
      <motion.div
        initial={hasAnimatedEventsSection ? false : { opacity: 0, scale: 0.99, y: 16 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        transition={{ duration: 0.8, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full h-[460px] sm:h-[520px] md:h-[560px] rounded-3xl overflow-hidden select-none bg-black shadow-xl touch-pan-y"
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
            style={{ willChange: 'transform' }}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing bg-black"
          >
            {/* Background Cover Image */}
            <img
              src={current.coverImage || current.images?.[0]}
              alt={current.title}
              draggable={false}
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
            />

            {/* Gradient Darkening Overlay for maximum readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/55 via-50% to-black/20 pointer-events-none" />

            {/* Ambient Pink/Green Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-pink/25 via-transparent to-brand-green/20 pointer-events-none" />

            {/* Content Details */}
            <div className="absolute inset-x-0 bottom-0 z-10">
              <div className="max-w-5xl mx-auto px-4 sm:px-8 pb-10 sm:pb-14 pt-16 flex flex-col items-start text-left space-y-3 sm:space-y-4">
                
                {/* Meta Badges: Category, Date, Location */}
                <div className="flex flex-wrap items-center gap-2">
                  {current.badge && (
                    <span className="px-3 py-1 rounded-full bg-brand-pink text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs">
                      {current.badge}
                    </span>
                  )}
                  {current.dateText && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-brand-green" />
                      <span>{current.dateText}</span>
                    </span>
                  )}
                  {current.locationText && (
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                      <span>{current.locationText}</span>
                    </span>
                  )}
                </div>

                {/* Event Title */}
                <motion.h4
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.45 }}
                  className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.15] drop-shadow-lg max-w-3xl"
                >
                  {current.title}
                </motion.h4>

                {/* Subtitle */}
                <motion.p
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25, duration: 0.45 }}
                  className="text-white/90 text-xs sm:text-base md:text-lg font-normal leading-relaxed max-w-2xl drop-shadow-md line-clamp-2 sm:line-clamp-3"
                >
                  {current.subtitle}
                </motion.p>

                {/* Action CTA Button */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35, duration: 0.45 }}
                  className="pt-2 sm:pt-3"
                >
                  <button
                    type="button"
                    onClick={() => handleOpenEvent(current.slug || current.id)}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-3 px-7 sm:px-9 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer touch-auto"
                  >
                    <span>{current.buttonText || "Conhecer Evento"}</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                  </button>
                </motion.div>

              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows for desktop */}
        {activeEvents.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
              aria-label="Evento anterior"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>
            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/40 hover:bg-black/70 backdrop-blur-md text-white items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95"
              aria-label="Próximo evento"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </>
        )}

        {/* Pagination Dots at Bottom Center */}
        {activeEvents.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 inset-x-0 z-20 flex items-center justify-center gap-2">
            {activeEvents.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSlide(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? 'w-7 h-2 bg-white shadow-md'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Ir para evento ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.section>
  );
};
