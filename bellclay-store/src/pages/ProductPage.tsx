import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Heart, ShoppingBag, Truck, ShieldCheck, Check,
  ChevronRight, ChevronLeft, ArrowLeft, Info, CheckCircle2,
  Maximize2
} from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useCart } from '../context/CartContext';
import { calculateShipping } from '../services/shippingService';
import { ShippingOption } from '../types';
import { ProductCard } from '../components/ProductCard';
import { ProductImageLightbox } from '../components/ProductImageLightbox';
import { WhatsAppIcon } from '../components/SocialIcons';

export const ProductPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, settings, isLoading } = useSettings();
  const { addItem, setIsOpen: setIsCartOpen } = useCart();

  // Find product by slug or id
  const product = products.find((p) => p.slug === slug || p.id === slug);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Freight calculation
  const [simulatedCep, setSimulatedCep] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isCalculatingFreight, setIsCalculatingFreight] = useState(false);
  const [freightError, setFreightError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'details' | 'specs' | 'care'>('details');

  // Touch Swipe Gesture & Image Transition Direction for Photo Carousel
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleNextImage = () => {
    if (!product || product.images.length <= 1) return;
    setSlideDirection('right');
    setActiveImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const handlePrevImage = () => {
    if (!product || product.images.length <= 1) return;
    setSlideDirection('left');
    setActiveImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleSelectImage = (idx: number) => {
    if (idx === activeImageIndex) return;
    setSlideDirection(idx > activeImageIndex ? 'right' : 'left');
    setActiveImageIndex(idx);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleNextImage();
      } else {
        handlePrevImage();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Reset scroll and selection on route change
  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveImageIndex(0);
    setQuantity(1);
    setIsAdded(false);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full animate-pulse space-y-8">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded-3xl"></div>
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-pink-subtle flex items-center justify-center mx-auto text-brand-pink">
          <Info className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-brand-charcoal">Peça não encontrada</h1>
        <p className="text-sm text-brand-muted">
          O produto que você procura pode ter esgotado ou mudado de link. Explore nossas outras peças exclusivas!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-sm shadow-soft transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para o Início</span>
        </Link>
      </div>
    );
  }

  const currentPrice = product.promotionalPrice || product.price;
  const hasDiscount = Boolean(product.promotionalPrice && product.promotionalPrice < product.price);
  const discountPercent = hasDiscount
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  // Dynamic Installments & Pix Discount configured in Admin Panel
  const maxInstallments = Math.max(1, Number(settings.maxInstallmentsNoInterest ?? 3));
  const pixDiscountPercent = Number(settings.pixDiscountPercent ?? 0);
  const installmentValue = (currentPrice / maxInstallments).toFixed(2).replace('.', ',');
  const pixPrice = (currentPrice * (1 - pixDiscountPercent / 100)).toFixed(2).replace('.', ',');

  const handleAddToCart = () => {
    addItem(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    navigate('/checkout');
  };

  const handleCalculateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = simulatedCep.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      setFreightError('Digite um CEP válido com 8 dígitos.');
      return;
    }
    setIsCalculatingFreight(true);
    setFreightError(null);
    try {
      const options = await calculateShipping({
        destinationCep: cleanCep,
        items: [{ product, quantity }],
        freeShippingThreshold: settings.freeShippingThreshold,
        melhorEnvioToken: settings.melhorEnvioToken
      });
      setShippingOptions(options);
      if (options.length === 0) {
        setFreightError('Nenhum frete disponível para o CEP informado.');
      }
    } catch {
      setFreightError('Erro ao calcular frete. Tente novamente.');
    } finally {
      setIsCalculatingFreight(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Olá Bellclay! Estou na página da peça "${product.title}" (R$ ${currentPrice.toFixed(2).replace('.', ',')}) e gostaria de tirar uma dúvida!`
  );

  // Related products from same category or general list
  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.category === product.category || !product.category))
    .slice(0, 4);

  return (
    <motion.div
      key={slug}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#FDFBF7] pb-24 md:pb-16"
    >
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-brand-muted">
          <Link to="/" className="hover:text-brand-pink transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <Link to={`/?categoria=${encodeURIComponent(product.category)}`} className="hover:text-brand-pink transition-colors">
            {product.category || 'Artesanatos'}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <span className="text-brand-charcoal font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.title}
          </span>
        </nav>
      </div>

      {/* Main Product Container - Frameless with edge-to-edge photo on mobile */}
      <main className="max-w-7xl mx-auto px-0 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-14 items-start">
          
          {/* Left Column: Image Gallery (Full width 100vw on mobile, rounded on desktop) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Photo: Full Width on Mobile like the Hero Banner with Smooth Slide Transition */}
            <div
              onClick={() => setIsLightboxOpen(true)}
              className="group relative aspect-square sm:aspect-4/3 lg:aspect-square w-full md:rounded-3xl overflow-hidden bg-[#FAF7F2] shadow-sm select-none touch-pan-y cursor-zoom-in"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              title="Clique para ver a foto em tela cheia e dar zoom"
            >
              <AnimatePresence initial={false} custom={slideDirection} mode="popLayout">
                <motion.img
                  key={activeImageIndex}
                  src={product.images[activeImageIndex] || product.images[0]}
                  alt={product.title}
                  custom={slideDirection}
                  initial={{
                    opacity: 0,
                    x: slideDirection === 'right' ? 80 : -80,
                    scale: 0.98
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: {
                      x: { type: 'spring', stiffness: 260, damping: 26 },
                      opacity: { duration: 0.35, ease: 'easeOut' },
                      scale: { duration: 0.35, ease: 'easeOut' }
                    }
                  }}
                  exit={{
                    opacity: 0,
                    x: slideDirection === 'right' ? -80 : 80,
                    scale: 0.98,
                    transition: {
                      x: { type: 'spring', stiffness: 260, damping: 26 },
                      opacity: { duration: 0.25, ease: 'easeIn' },
                      scale: { duration: 0.25, ease: 'easeIn' }
                    }
                  }}
                  className="w-full h-full object-cover pointer-events-none select-none absolute inset-0"
                />
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-charcoal text-white shadow-md">
                  Cerâmica Fria
                </span>
                {product.isNew && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-green text-white shadow-md">
                    Novo
                  </span>
                )}
                {hasDiscount && (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-pink text-white shadow-md">
                    -{discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Prev / Next Chevrons (if multiple photos) */}
              {product.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevImage();
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 backdrop-blur-xs text-brand-charcoal hover:bg-white shadow-md flex items-center justify-center transition-all cursor-pointer z-10 active:scale-90"
                    aria-label="Foto anterior"
                  >
                    <ChevronLeft className="w-5 h-5 text-brand-charcoal" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNextImage();
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 backdrop-blur-xs text-brand-charcoal hover:bg-white shadow-md flex items-center justify-center transition-all cursor-pointer z-10 active:scale-90"
                    aria-label="Próxima foto"
                  >
                    <ChevronRight className="w-5 h-5 text-brand-charcoal" />
                  </button>

                  {/* Mobile Pagination Indicator Dots */}
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center items-center gap-1.5 z-10 md:hidden pointer-events-none">
                    {product.images.map((_, idx) => (
                      <span
                        key={idx}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          activeImageIndex === idx ? 'w-5 bg-white shadow-sm' : 'w-1.5 bg-white/60'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Fullscreen Zoom Pill Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLightboxOpen(true);
                }}
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95 z-10 cursor-pointer opacity-90 group-hover:opacity-100"
                title="Ampliar foto em tela cheia"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tela cheia / Zoom</span>
              </button>
            </div>

            {/* Thumbnails Row */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pt-2 pb-3 px-4 md:px-1 items-center scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectImage(idx)}
                    className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx
                        ? 'border-brand-pink ring-2 ring-brand-pink/30 scale-105 shadow-sm'
                        : 'border-brand-border/60 hover:border-brand-pink/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${product.title} miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Actions (Padded on mobile) */}
          <div className="lg:col-span-5 px-4 md:px-0 space-y-6">
            
            <div className="space-y-4">
              {/* Category & Rating */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-3.5 py-1 rounded-full text-xs sm:text-sm font-semibold bg-brand-pink-subtle text-brand-pink">
                  {product.category || 'Artesanato'}
                </span>
                
                <div className="flex items-center gap-1.5 bg-[#F6F1E8] px-3 py-1 rounded-full">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="text-xs sm:text-sm font-bold text-brand-charcoal">
                    {product.rating?.toFixed(1) || '5.0'}
                  </span>
                  <span className="text-xs text-brand-muted">
                    ({product.reviewsCount || 18} avaliações)
                  </span>
                </div>
              </div>

              {/* Title - Enlarged & Elegant */}
              <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-extrabold text-brand-charcoal leading-tight">
                {product.title}
              </h1>

              {/* Price Display */}
              <div className="py-4 space-y-2 border-y border-brand-border/60">
                <div className="flex items-baseline gap-2">
                  {hasDiscount && (
                    <span className="text-base sm:text-lg text-brand-muted line-through">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className="text-base font-bold text-brand-pink">R$</span>
                  <span className="text-3xl sm:text-5xl font-black text-brand-charcoal tracking-tight">
                    {currentPrice.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="flex flex-col gap-1 text-xs sm:text-sm text-brand-muted">
                  {maxInstallments > 1 ? (
                    <p className="font-medium text-brand-charcoal">
                      ou em até <strong className="text-brand-pink font-bold">{maxInstallments}x de R$ {installmentValue}</strong> sem juros no cartão
                    </p>
                  ) : (
                    <p className="font-medium text-brand-charcoal">
                      ou em até <strong className="text-brand-pink font-bold">12x</strong> no cartão de crédito
                    </p>
                  )}

                  {pixDiscountPercent > 0 ? (
                    <p className="text-xs sm:text-sm text-brand-green font-semibold">
                      • R$ {pixPrice} no Pix ({pixDiscountPercent}% de desconto automático)
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-brand-green font-semibold">
                      • Pagamento seguro via Pix instantâneo ou Cartão de Crédito
                    </p>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-brand-charcoal/85 leading-relaxed">
                {product.description}
              </p>

              {/* Trust Highlights - Below Description, Above Purchase Buttons, Borderless */}
              <div className="grid grid-cols-3 gap-3 py-3 px-4 rounded-2xl bg-[#FAF7F2] shadow-2xs">
                <div className="flex flex-col items-center text-center">
                  <Heart className="w-5 h-5 text-brand-pink mb-1 fill-brand-pink/20" />
                  <span className="text-xs font-bold text-brand-charcoal">Feito à Mão</span>
                  <span className="text-[10px] text-brand-muted">Peça única</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <ShieldCheck className="w-5 h-5 text-brand-green mb-1" />
                  <span className="text-xs font-bold text-brand-charcoal">Resina Vitrificada</span>
                  <span className="text-[10px] text-brand-muted">Alta durabilidade</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="w-5 h-5 text-brand-pink mb-1" />
                  <span className="text-xs font-bold text-brand-charcoal">Envio Seguro</span>
                  <span className="text-[10px] text-brand-muted">Embalagem protegida</span>
                </div>
              </div>

              {/* Quantity and Action Buttons */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-brand-border rounded-full bg-white px-3 py-2 shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-lg font-bold text-brand-charcoal px-2 hover:text-brand-pink transition-colors"
                      aria-label="Diminuir quantidade"
                    >
                      -
                    </button>
                    <span className="text-sm sm:text-base font-bold text-brand-charcoal px-3">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="text-lg font-bold text-brand-charcoal px-2 hover:text-brand-pink transition-colors"
                      aria-label="Aumentar quantidade"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-full bg-white border-2 border-brand-pink text-brand-pink hover:bg-gradient-to-r hover:from-brand-pink hover:to-brand-green hover:text-white hover:border-transparent font-bold text-xs sm:text-sm shadow-xs transition-all duration-200 cursor-pointer active:scale-95"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Adicionado ao Carrinho!</span>
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Adicionar ao Carrinho</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Buy Now (Direct to Checkout) */}
                <button
                  onClick={handleBuyNow}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-extrabold text-sm sm:text-base shadow-green-soft hover:shadow-soft-hover transition-all duration-200 cursor-pointer"
                >
                  <span>Comprar Agora</span>
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Ask Question on WhatsApp */}
                <a
                  href={`https://wa.me/${(settings.whatsapp || '5544991074932').replace(/\D/g, '') || '5544991074932'}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-brand-muted hover:text-[#25D366] hover:bg-brand-green-subtle/50 transition-colors"
                >
                  <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                  <span>Dúvidas sobre esta peça? Fale conosco no WhatsApp</span>
                </a>
              </div>

              {/* Freight Calculator Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-pink-light/75 via-white/50 to-brand-green-light/75 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-brand-charcoal flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-brand-pink" />
                    Calcular Frete e Prazo de Entrega:
                  </span>
                  <span className="text-[11px] text-brand-muted">
                    Origem: Campo Mourão - PR
                  </span>
                </div>

                <form onSubmit={handleCalculateShipping} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={9}
                    placeholder="00000-000"
                    value={simulatedCep}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setSimulatedCep(v.length > 5 ? `${v.slice(0, 5)}-${v.slice(5)}` : v);
                    }}
                    className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border-none outline-none bg-white/90 focus:bg-white transition-all shadow-2xs focus:ring-1 focus:ring-brand-pink"
                  />
                  <button
                    type="submit"
                    disabled={isCalculatingFreight}
                    className="px-4 py-2.5 rounded-xl bg-brand-charcoal hover:bg-black text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isCalculatingFreight ? 'Calculando...' : 'Calcular'}
                  </button>
                </form>

                {freightError && (
                  <p className="text-xs text-red-500">{freightError}</p>
                )}

                {shippingOptions.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-brand-border/40">
                    {shippingOptions.map((opt) => (
                      <div
                        key={opt.id}
                        className="flex items-center justify-between text-xs sm:text-sm p-2.5 rounded-xl bg-white/80 shadow-2xs"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold text-brand-charcoal">{opt.name}</span>
                          <span className="text-[11px] text-brand-muted">
                            Chega em cerca de {opt.deliveryDays} {opt.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-brand-charcoal">
                            {opt.price === 0 ? (
                              <span className="text-brand-green font-bold">Grátis</span>
                            ) : (
                              `R$ ${opt.price.toFixed(2).replace('.', ',')}`
                            )}
                          </span>
                          {opt.badge && (
                            <span className="block text-[10px] font-bold text-brand-pink uppercase">
                              {opt.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[11px] text-brand-muted pt-1">
                  ✨ Frete Grátis em pedidos a partir de R$ {(settings.freeShippingThreshold || 150).toFixed(0)} (para o Paraná ou envios até R$ 15).
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Product Specifications & Care Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 sm:mt-8 pt-5 border-t border-brand-border/60 px-4 md:px-0"
        >
          {/* Tab Headers */}
          <div className="flex gap-4 sm:gap-6 border-b border-brand-border/60 pb-3">
            <button
              onClick={() => setActiveTab('details')}
              className={`pb-2 text-sm sm:text-base font-bold transition-colors cursor-pointer relative ${
                activeTab === 'details'
                  ? 'text-brand-pink'
                  : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              Detalhes da Peça
              {activeTab === 'details' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 text-sm sm:text-base font-bold transition-colors cursor-pointer relative ${
                activeTab === 'specs'
                  ? 'text-brand-pink'
                  : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              Dimensões & Peso
              {activeTab === 'specs' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('care')}
              className={`pb-2 text-sm sm:text-base font-bold transition-colors cursor-pointer relative ${
                activeTab === 'care'
                  ? 'text-brand-pink'
                  : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              Cuidados Especiais
              {activeTab === 'care' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-pink" />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <div className="py-6 text-sm sm:text-base text-brand-charcoal leading-relaxed max-w-3xl">
            {activeTab === 'details' && (
              <div className="space-y-3">
                <p>
                  Esta peça é modelada à mão uma a uma em nosso ateliê Bellclay em Campo Mourão - PR, utilizando porcelana fria de altíssima qualidade (cerâmica plástica/fria que seca ao ar e ganha solidez de porcelana).
                </p>
                <p>
                  Após a secagem completa de até 72 horas, recebe pintura detalhada e camadas de resina vitrificada/verniz impermeabilizante de alta durabilidade, garantindo acabamento brilhante, suave ao toque e resistente ao uso diário.
                </p>
                <div className="flex items-center gap-2 pt-2 text-brand-green font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Peça autoral e exclusiva — nenhuma sai exatamente idêntica à outra!</span>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="divide-y divide-brand-border/60 border-y border-brand-border/60">
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-brand-muted">Altura aproximada</span>
                    <strong className="text-sm sm:text-base font-semibold text-brand-charcoal">{product.dimensions?.heightCm || 4} cm</strong>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-brand-muted">Largura aproximada</span>
                    <strong className="text-sm sm:text-base font-semibold text-brand-charcoal">{product.dimensions?.widthCm || 4} cm</strong>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-brand-muted">Comprimento aproximado</span>
                    <strong className="text-sm sm:text-base font-semibold text-brand-charcoal">{product.dimensions?.lengthCm || 4} cm</strong>
                  </div>
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-brand-muted">Peso da peça</span>
                    <strong className="text-sm sm:text-base font-semibold text-brand-charcoal">{Math.round((product.weightKg || 0.05) * 1000)} g</strong>
                  </div>
                </div>
                <p className="text-xs text-brand-muted italic">
                  *Por ser um artesanato manual, pequenas variações milimétricas e de tonalidade fazem parte do charme único de cada criação.
                </p>
              </div>
            )}

            {activeTab === 'care' && (
              <div className="space-y-3">
                <p className="font-semibold text-brand-charcoal">
                  Como manter sua peça linda por muitos anos:
                </p>
                <ul className="space-y-2 list-disc pl-5 text-brand-charcoal/90">
                  <li>Limpe suavemente com um pano macio e seco ou levemente umedecido em água.</li>
                  <li>Evite submergir ou lavar em água quente/fervente ou produtos químicos abrasivos como álcool ou acetona.</li>
                  <li>Embora seja resistente e envernizada, evite quedas bruscas em superfícies de pedra ou atritos pontiagudos.</li>
                  <li>Guarde com carinho em local protegido do calor excessivo direto.</li>
                </ul>
              </div>
            )}
          </div>
        </motion.div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 sm:mt-18 space-y-6 px-4 md:px-0"
          >
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-charcoal">
              Você Também Pode Amar
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p, idx) => (
                <ProductCard key={p.id} product={p} index={idx} />
              ))}
            </div>
          </motion.section>
        )}
      </main>

      {/* Mobile Sticky Bottom Action Bar with Safe-Area insets */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#FDFBF7]/95 backdrop-blur-md border-t border-brand-border/80 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-11 h-11 rounded-lg object-cover bg-gray-100 shrink-0"
          />
          <div className="min-w-0">
            <span className="text-xs font-bold text-brand-charcoal truncate block">
              {product.title}
            </span>
            <span className="text-sm font-extrabold text-brand-pink">
              R$ {currentPrice.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className="shrink-0 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-pink to-[#f56377] text-white font-extrabold text-xs sm:text-sm shadow-pink-soft active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Adicionado!</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Adicionar ao Carrinho</span>
            </>
          )}
        </button>
      </div>

      {/* Fullscreen Photo Lightbox with Zoom & Pan */}
      <ProductImageLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={product.images}
        initialIndex={activeImageIndex}
        productTitle={product.title}
      />

    </motion.div>
  );
};
