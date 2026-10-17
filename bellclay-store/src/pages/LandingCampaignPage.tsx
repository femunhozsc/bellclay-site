import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Check,
  Copy,
  Star,
  ShieldCheck,
  MessageCircle
} from 'lucide-react';
import { getCampaignBySlug, trackCampaignView, trackCampaignClick, DEFAULT_STORE_CAMPAIGNS } from '../services/firebase';
import { AdCampaign, Product } from '../types';
import { useSettings } from '../context/SettingsContext';
import { HomePage } from './HomePage';

export const LandingCampaignPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products } = useSettings();

  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOpeningUp, setIsOpeningUp] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadCampaign = async () => {
      if (!slug) {
        setCampaign(DEFAULT_STORE_CAMPAIGNS[0]);
        setLoading(false);
        return;
      }

      try {
        const found = await getCampaignBySlug(slug);
        if (isMounted) {
          if (found && found.active !== false) {
            setCampaign(found);
            trackCampaignView(found.id);
          } else {
            setCampaign(DEFAULT_STORE_CAMPAIGNS[0]);
          }
        }
      } catch (err) {
        console.warn('Erro ao carregar tela de anúncio:', err);
        if (isMounted) setCampaign(DEFAULT_STORE_CAMPAIGNS[0]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadCampaign();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Match featured product if ID is provided
  useEffect(() => {
    if (campaign?.showFeaturedProduct && campaign.featuredProductId && products.length > 0) {
      const match = products.find(p => p.id === campaign.featuredProductId);
      if (match) {
        setFeaturedProduct(match);
      }
    }
  }, [campaign, products]);

  const handleCopyCoupon = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCoupon(true);
      setTimeout(() => setCopiedCoupon(false), 2500);
    }
  };

  const handleConhecerSite = () => {
    if (campaign) {
      trackCampaignClick(campaign.id);

      // If coupon exists, store in localStorage for auto-apply in cart
      if (campaign.couponCode) {
        try {
          localStorage.setItem('bellclay_applied_coupon', campaign.couponCode);
        } catch {}
      }
    }

    // Scroll window smoothly/instantly to top so user begins at top of the store
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Trigger smooth upward curtain opening animation
    setIsOpeningUp(true);

    // If destination is other than Home ('/'), navigate after opening curtain
    const target = campaign?.targetUrl || '/';
    if (target !== '/' && target !== '#produtos') {
      setTimeout(() => {
        navigate(target);
      }, 700);
    } else if (target === '#produtos') {
      setTimeout(() => {
        const el = document.getElementById('produtos');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 750);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium text-brand-muted tracking-wide">
            Carregando Bellclay...
          </p>
        </div>
      </div>
    );
  }

  const current = campaign || DEFAULT_STORE_CAMPAIGNS[0];
  const overlayPercent = (current.overlayOpacity ?? 50) / 100;

  return (
    <div className="relative min-h-screen w-full bg-[#FAF7F2] overflow-x-hidden">
      {/* 
        The underlying store content:
        Revealed seamlessly as the welcome curtain slides UP!
      */}
      <div className="w-full">
        <HomePage />
      </div>

      {/* 
        Full-screen Welcome Ad Curtain Overlay 
        Animates UPWARDS ('translateY(-100%)') when 'Conhecer o site' is clicked!
      */}
      <AnimatePresence>
        {!isOpeningUp && (
          <motion.div
            key="ad-curtain"
            initial={{ y: 0, opacity: 1 }}
            exit={{
              y: '-100%',
              opacity: 0.98,
              transition: {
                duration: 0.85,
                ease: [0.16, 1, 0.3, 1] // Smooth luxury spring curve
              }
            }}
            className={`fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-[#1E191A] ${
              isOpeningUp ? 'pointer-events-none' : ''
            }`}
          >
            {/* Background Banner with Dynamic Contrast Gradient */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <picture>
                {current.mobileBannerUrl && (
                  <source media="(max-width: 640px)" srcSet={current.mobileBannerUrl} />
                )}
                <img
                  src={current.bannerUrl}
                  alt={current.headline}
                  className="w-full h-full object-cover object-center filter brightness-95"
                />
              </picture>

              {/* Natural Dark Gradient for Contrast & Legibility */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/35"
                style={{ opacity: overlayPercent }}
              />

              {/* Soft Brand Ambience */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-charcoal/40 via-transparent to-black/80 pointer-events-none" />
            </div>

            {/* 
              Top Brand Bar (Grounded & Professional, not floating)
            */}
            <header className="relative z-10 w-full border-b border-white/10 bg-black/20 backdrop-blur-md">
              <div className="max-w-5xl mx-auto px-5 py-3.5 sm:py-4 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <img
                    src="/bellclay_logo.png"
                    alt="Bellclay"
                    className="h-11 sm:h-12 w-auto object-contain filter drop-shadow-sm"
                  />
                  <span className="font-serif text-lg sm:text-xl font-normal text-white tracking-tight">
                    BELLCLAY
                  </span>
                </div>

                {/* Clean, Non-Emoji Campaign Tag */}
                {current.badgeText && (
                  <span className="text-[11px] font-medium tracking-wider uppercase px-3 py-1 rounded-full bg-white/10 text-white/90 border border-white/20 backdrop-blur-xs">
                    {current.badgeText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()}
                  </span>
                )}
              </div>
            </header>

            {/* Central Content Area (Artisanal, Human & Elegant) */}
            <main className="relative z-10 w-full max-w-2xl mx-auto px-5 py-8 sm:py-12 flex flex-col items-center text-center my-auto">
              {/* Eyebrow Label */}
              <span className="text-xs uppercase tracking-[0.25em] text-[#FD7687] font-semibold mb-3">
                Cerâmica Fria Autoral
              </span>

              {/* Main Headline (Editorial Fraunces Serif) */}
              <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-normal text-white leading-[1.18] tracking-tight drop-shadow-sm mb-3.5">
                {current.headline}
              </h1>

              {/* Subtitle */}
              <p className="font-sans text-sm sm:text-base text-white/85 font-normal max-w-lg mb-4 leading-relaxed">
                {current.subtitle}
              </p>

              {/* Storytelling Block (Letter from the artisan, warm left border, no floating emoji box) */}
              {current.storyText && (
                <div className="w-full max-w-lg border-l-2 border-[#FD7687]/80 pl-4 sm:pl-5 text-left mb-5 my-2">
                  <p className="font-serif text-sm sm:text-base text-white/95 italic leading-relaxed">
                    "{current.storyText}"
                  </p>
                </div>
              )}

              {/* ACTION BUTTONS (Placed directly below story quote and ABOVE badges!) */}
              <div className="w-full max-w-sm flex flex-col gap-2.5 my-2 mb-6">
                <button
                  onClick={handleConhecerSite}
                  className="w-full py-3.5 px-6 rounded-full bg-[#FD7687] hover:bg-[#f06073] text-white font-semibold text-sm sm:text-base shadow-soft hover:shadow-soft-hover transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>
                    {current.buttonText
                      ? current.buttonText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()
                      : 'Conhecer o site'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary Button: WhatsApp direct contact */}
                {current.secondaryButtonUrl && (
                  <a
                    href={current.secondaryButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xs text-white font-medium text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {current.secondaryButtonText
                        ? current.secondaryButtonText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()
                        : 'Atendimento no WhatsApp'}
                    </span>
                  </a>
                )}

                {/* Subtle entry microcopy */}
                <button
                  onClick={handleConhecerSite}
                  className="text-[11px] text-white/60 hover:text-white/90 transition-colors tracking-wide cursor-pointer font-medium pt-0.5"
                >
                  Toque para abrir a loja online
                </button>
              </div>

              {/* Highlights List (Clean typography without emojis) */}
              {current.highlights && current.highlights.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-lg">
                  {current.highlights.map((item, idx) => {
                    const cleanItem = item.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim();
                    return (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/85 text-xs font-medium border border-white/15 backdrop-blur-xs"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FD7687]" />
                        {cleanItem}
                      </span>
                    );
                  })}
                </div>
              )}

              {/* 
                Voucher / Coupon Card (Tactile, Human Boutique Ticket)
                - NO generic courier font
                - NO neon gradients
                - Clean porcelain palette
              */}
              {current.showCoupon && current.couponCode && (
                <div className="w-full max-w-md bg-white rounded-2xl p-4 mb-6 shadow-md border border-[#EAE3DA] text-left">
                  <div className="flex items-center justify-between pb-2 border-b border-[#EAE3DA]/80 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#756D69]">
                      {current.couponDiscountText || 'Benefício de Boas-Vindas'}
                    </span>
                    <span className="text-[10px] font-semibold text-[#FD7687] uppercase tracking-wide">
                      Primeira Compra
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-[#FDFBF7] rounded-xl px-3.5 py-2.5 border border-dashed border-[#D4AF37]/50">
                    <div>
                      <span className="text-[10px] text-[#756D69] block font-medium">Código do cupom</span>
                      <span className="font-sans font-extrabold text-base tracking-wider text-[#2B2625] block">
                        {current.couponCode}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCoupon(current.couponCode!)}
                      className="px-4 py-2 rounded-xl bg-[#2B2625] hover:bg-black text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                    >
                      {copiedCoupon ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-white/80" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Featured Product Preview Card (Tactile, Clean, Human) */}
              {current.showFeaturedProduct && featuredProduct && (
                <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-3 mb-6 flex items-center gap-3.5 shadow-md border border-white/40 text-left">
                  <img
                    src={featuredProduct.images?.[0] || current.bannerUrl}
                    alt={featuredProduct.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#EAE3DA]"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#FD7687] block">
                      Peça em Destaque
                    </span>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#2B2625] truncate">
                      {featuredProduct.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-[#2B2625]">
                        R$ {featuredProduct.promotionalPrice?.toFixed(2) || featuredProduct.price.toFixed(2)}
                      </span>
                      {featuredProduct.promotionalPrice && (
                        <span className="text-[11px] text-[#756D69] line-through">
                          R$ {featuredProduct.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 pr-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#756D69] bg-[#FAF7F2] px-2 py-0.5 rounded-md border border-[#EAE3DA]">
                      <Star className="w-3 h-3 fill-[#FD7687] text-[#FD7687]" />
                      5.0
                    </span>
                  </div>
                </div>
              )}

              {/* Trust Badge (Clean icon and text, zero emojis) */}
              {current.showTrustBadges && (
                <div className="flex items-center justify-center gap-1.5 text-white/80 text-xs font-medium mb-6">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>
                    {current.trustBadgeText
                      ? current.trustBadgeText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()
                      : 'Avaliação 5.0 • Mais de 500 pedidos entregues em todo o Brasil'}
                  </span>
                </div>
              )}

            </main>

            {/* Bottom Footer Details */}
            <footer className="relative z-10 w-full text-center py-4 px-5 text-white/40 text-[11px] border-t border-white/5">
              Bellclay Artesanatos • Modelagem autoral em Cerâmica Fria • Campo Mourão, PR
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
