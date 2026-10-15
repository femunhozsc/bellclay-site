import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Share2,
  CheckCircle2,
  Info
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const EventPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();

  const events = settings.events || [];
  const event = events.find((e) => e.slug === slug || e.id === slug);

  // Gallery Photos (combining cover and all event images)
  const allImages = event
    ? Array.from(new Set([event.coverImage, ...(event.images || [])])).filter(Boolean)
    : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-pink-subtle flex items-center justify-center mx-auto text-brand-pink">
          <Info className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
          Evento não encontrado
        </h1>
        <p className="text-sm text-brand-muted max-w-md mx-auto">
          O evento que você procura pode ter mudado de endereço ou não estar mais disponível.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-sm shadow-soft transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para a Página Inicial</span>
        </Link>
      </div>
    );
  }

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event.title} - Bellclay Artesanatos`,
        text: event.subtitle,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Bellclay! Estive no site e adorei os detalhes do evento "${event.title}". Gostaria de saber mais informações!`
  );
  const whatsappUrl = `https://wa.me/5544991074932?text=${whatsappMessage}`;

  return (
    <div className="flex-1 w-full bg-[#FDFBF7] py-6 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between border-b border-brand-border/60 pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brand-muted hover:text-brand-charcoal transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-brand-pink" />
            <span>Voltar para a Loja</span>
          </Link>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-brand-border/80 hover:border-brand-pink bg-white text-xs font-bold text-brand-charcoal shadow-2xs transition-all cursor-pointer"
          >
            {copiedLink ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                <span className="text-brand-green">Link copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-brand-pink" />
                <span>Compartilhar</span>
              </>
            )}
          </button>
        </div>

        {/* Event Header Banner */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {event.badge && (
              <span className="px-3.5 py-1 rounded-full bg-brand-pink text-white text-xs font-bold uppercase tracking-wider shadow-xs">
                {event.badge}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-green/15 text-brand-green font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bellclay Artesanatos</span>
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight leading-[1.15]">
            {event.title}
          </h1>

          <p className="text-brand-muted text-sm sm:text-lg leading-relaxed max-w-3xl">
            {event.subtitle}
          </p>

          {/* Quick Date and Location info bar */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 pt-2">
            {event.dateText && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-charcoal bg-white px-3.5 py-2 rounded-xl border border-brand-border/80 shadow-2xs">
                <Calendar className="w-4 h-4 text-brand-green shrink-0" />
                <span>{event.dateText}</span>
              </div>
            )}
            {event.locationText && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-brand-charcoal bg-white px-3.5 py-2 rounded-xl border border-brand-border/80 shadow-2xs">
                <MapPin className="w-4 h-4 text-brand-pink shrink-0" />
                <span>{event.locationText}</span>
              </div>
            )}
          </div>
        </div>

        {/* High-Impact Photos Carousel for this specific event */}
        <div className="space-y-3">
          <div className="relative w-full h-[360px] sm:h-[500px] md:h-[580px] rounded-3xl overflow-hidden bg-black shadow-xl">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeImageIndex}
                src={allImages[activeImageIndex]}
                alt={`${event.title} foto ${activeImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="w-full h-full object-cover object-center"
              />
            </AnimatePresence>

            {/* Subtle Gradient & Photo Counter */}
            <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold shadow-md z-10">
              Foto {activeImageIndex + 1} de {allImages.length}
            </div>

            {/* Carousel Navigation Arrows */}
            {allImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 z-10"
                  aria-label="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-10 sm:w-12 h-10 sm:h-12 rounded-full bg-black/45 hover:bg-black/75 backdrop-blur-md text-white flex items-center justify-center transition-all cursor-pointer shadow-lg hover:scale-110 active:scale-95 z-10"
                  aria-label="Próxima foto"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                </button>
              </>
            )}
          </div>

          {/* Gallery Thumbnails Below Main Carousel */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-brand-pink ring-2 ring-brand-pink/30 scale-102 shadow-md'
                      : 'border-transparent opacity-60 hover:opacity-100 hover:border-brand-border'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Full Rich Description & Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-charcoal border-b border-brand-border/60 pb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-pink" />
                <span>Sobre o Evento</span>
              </h2>

              <div className="text-brand-charcoal/90 text-sm sm:text-base leading-relaxed space-y-4 whitespace-pre-line font-normal">
                {event.description}
              </div>
            </div>
          </div>

          {/* Sidebar / Info & WhatsApp Contact */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-[#FFE2E6]/60 via-white to-[#EBF6E4]/60 p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
              <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                Informações & Atendimento
              </h3>

              <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
                Quer tirar dúvidas sobre o evento, saber se teremos peças específicas ou agendar uma participação? Entre em contato direto com a gente!
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white font-bold text-xs sm:text-sm shadow-md transition-all transform hover:scale-102 active:scale-98 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Conversar no WhatsApp</span>
              </a>

              <div className="pt-2 border-t border-brand-border/40 text-[11px] text-brand-muted space-y-1">
                <p>• Peças artesanais modeladas à mão</p>
                <p>• Acabamento vitrificado em resina e verniz</p>
                <p>• Ateliê baseado em Campo Mourão - PR</p>
              </div>
            </div>

            {/* Back to Catalog Link */}
            <div className="p-6 rounded-3xl bg-white border border-brand-border/70 shadow-xs text-center space-y-3">
              <h4 className="font-bold text-xs text-brand-charcoal">Gostou das nossas criações?</h4>
              <p className="text-xs text-brand-muted">
                Explore nosso catálogo completo e receba na sua casa com frete seguro!
              </p>
              <Link
                to="/#produtos"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-brand-charcoal hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <span>Ver Catálogo de Artesanatos</span>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
