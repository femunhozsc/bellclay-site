import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Tag,
  Check,
  Copy,
  Star,
  Heart,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ChevronDown
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
            // Fallback to first active campaign or null
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

    // Trigger upward curtain opening animation
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
          <div className="w-10 h-10 border-3 border-brand-pink border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-brand-muted tracking-wide">
            Preparando experiência Bellclay...
          </p>
        </div>
      </div>
    );
  }

  const current = campaign || DEFAULT_STORE_CAMPAIGNS[0];
  const overlayPercent = (current.overlayOpacity ?? 45) / 100;

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
            className="fixed inset-0 z-50 flex flex-col justify-between overflow-y-auto overflow-x-hidden bg-[#2D1B22]"
          >
            {/* Background Banner with Dynamic Overlay */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <picture>
                {current.mobileBannerUrl && (
                  <source media="(max-width: 640px)" srcSet={current.mobileBannerUrl} />
                )}
                <img
                  src={current.bannerUrl}
                  alt={current.headline}
                  className="w-full h-full object-cover object-center scale-105 filter brightness-95"
                />
              </picture>
              
              {/* Customizable Dark/Color Overlay for high readability */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40"
                style={{ opacity: overlayPercent }}
              />

              {/* Subtle Warm Pink Tint & Glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-brand-pink/15 via-transparent to-brand-charcoal/80 mix-blend-multiply" />
            </div>

            {/* Top Brand Bar */}
            <header className="relative z-10 w-full max-w-5xl mx-auto px-5 pt-6 pb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-xl flex items-center justify-center border border-white/20">
                  <img
                    src="/bellclay_logo.png"
                    alt="Bellclay"
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div>
                  <span className="font-extrabold text-sm sm:text-base text-white tracking-wide block drop-shadow-md">
                    Bellclay
                  </span>
                  <span className="text-[10px] sm:text-xs text-white/80 font-medium block">
                    Arte em Cerâmica Fria • Campo Mourão
                  </span>
                </div>
              </div>

              {/* Badge */}
              {current.badgeText && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-brand-pink-light" />
                  <span>{current.badgeText}</span>
                </div>
              )}
            </header>

            {/* Central Content Area ("Uma tela que fala alguma coisa e leva para o site") */}
            <main className="relative z-10 w-full max-w-2xl mx-auto px-5 py-6 sm:py-10 flex flex-col items-center text-center my-auto">
              {/* Highlight Tag */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-pink/90 text-white text-xs sm:text-sm font-bold shadow-pink-soft mb-4 border border-white/25"
              >
                <Heart className="w-3.5 h-3.5 fill-current" />
                <span>Modelado 100% à Mão</span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight drop-shadow-lg mb-3"
              >
                {current.headline}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-sm sm:text-base md:text-lg text-white/90 font-medium max-w-xl mb-4 leading-relaxed drop-shadow-md"
              >
                {current.subtitle}
              </motion.p>

              {/* Storytelling Box ("Fala alguma coisa") */}
              {current.storyText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="w-full max-w-lg bg-white/15 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 text-white/95 text-xs sm:text-sm leading-relaxed mb-5 shadow-xl text-left"
                >
                  <p className="italic">"{current.storyText}"</p>
                </motion.div>
              )}

              {/* Highlights Chips */}
              {current.highlights && current.highlights.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="flex flex-wrap items-center justify-center gap-2 mb-6 max-w-lg"
                >
                  {current.highlights.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold border border-white/15"
                    >
                      <Check className="w-3 h-3 text-emerald-300" />
                      {item}
                    </span>
                  ))}
                </motion.div>
              )}

              {/* Exclusive Welcome Coupon Card (High Conversion Ad Idea!) */}
              {current.showCoupon && current.couponCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="w-full max-w-md bg-gradient-to-r from-amber-500/20 via-pink-500/25 to-amber-500/20 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-amber-300/40 mb-6 flex items-center justify-between shadow-2xl"
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-brand-charcoal flex items-center justify-center shrink-0 font-bold shadow-md">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] text-amber-200 font-bold uppercase tracking-wider block">
                        {current.couponDiscountText || 'Cupom Exclusivo de Boas-Vindas'}
                      </span>
                      <span className="font-mono font-extrabold text-base sm:text-lg text-white tracking-widest block">
                        {current.couponCode}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopyCoupon(current.couponCode!)}
                    className="px-3.5 py-2 rounded-xl bg-white text-brand-charcoal hover:bg-amber-100 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer shrink-0"
                  >
                    {copiedCoupon ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* Featured Product Preview Spotlight */}
              {current.showFeaturedProduct && featuredProduct && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65, duration: 0.5 }}
                  className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-3 mb-6 flex items-center gap-3 shadow-2xl border border-white/40 text-left"
                >
                  <img
                    src={featuredProduct.images?.[0] || current.bannerUrl}
                    alt={featuredProduct.title}
                    className="w-16 h-16 rounded-xl object-cover shrink-0 border border-brand-border"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold uppercase text-brand-pink block">
                      Peça do Anúncio
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-brand-charcoal truncate">
                      {featuredProduct.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-extrabold text-brand-charcoal">
                        R$ {featuredProduct.promotionalPrice?.toFixed(2) || featuredProduct.price.toFixed(2)}
                      </span>
                      {featuredProduct.promotionalPrice && (
                        <span className="text-[11px] text-brand-muted line-through">
                          R$ {featuredProduct.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-current" />
                      5.0
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Trust Badge / Social Proof */}
              {current.showTrustBadges && (
                <div className="flex items-center justify-center gap-1.5 text-white/80 text-xs font-semibold mb-6">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{current.trustBadgeText || '⭐ 5.0 estrelas (+500 clientes encantadas em todo o Brasil)'}</span>
                </div>
              )}

              {/* ACTION BUTTONS (The Main Upward Animation Trigger) */}
              <div className="w-full max-w-sm flex flex-col gap-3">
                {/* 
                  Primary CTA: "Conhecer o site" 
                  On Click: Plays upward curtain animation revealing the store underneath!
                */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleConhecerSite}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-pink via-pink-500 to-rose-400 text-white font-extrabold text-base sm:text-lg shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 transition-all flex items-center justify-center gap-2 group cursor-pointer border border-white/30"
                >
                  <Sparkles className="w-5 h-5 text-yellow-200 group-hover:rotate-12 transition-transform" />
                  <span>{current.buttonText || 'Conhecer o site ✨'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                {/* Secondary Button: WhatsApp direct contact */}
                {current.secondaryButtonUrl && (
                  <a
                    href={current.secondaryButtonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-5 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-xs sm:text-sm border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>{current.secondaryButtonText || 'Conversar no WhatsApp'}</span>
                  </a>
                )}
              </div>

              {/* Micro hint to pull/click */}
              <div
                onClick={handleConhecerSite}
                className="mt-6 flex flex-col items-center gap-1 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <span className="text-[11px] font-medium tracking-wide">
                  Clique para entrar no site
                </span>
                <ChevronDown className="w-4 h-4 animate-bounce" />
              </div>
            </main>

            {/* Bottom Footer Details */}
            <footer className="relative z-10 w-full text-center py-4 px-5 text-white/50 text-[11px]">
              Bellclay Artesanatos • Peças autorais em Cerâmica Fria • Campo Mourão, PR
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
