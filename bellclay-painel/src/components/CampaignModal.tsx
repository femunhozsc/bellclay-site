import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Link as LinkIcon,
  Eye,
  Check,
  Copy,
  Plus,
  Trash2,
  Smartphone,
  Monitor,
  Tag,
  Star,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  Heart,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { AdCampaign, Product, CategoryItem } from '../types';
import { uploadToCloudinary } from '../services/cloudinaryService';

interface CampaignModalProps {
  campaign: AdCampaign | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaign: AdCampaign) => void;
  products: Product[];
  categories: CategoryItem[];
}

export const CampaignModal: React.FC<CampaignModalProps> = ({
  campaign,
  isOpen,
  onClose,
  onSave,
  products,
  categories
}) => {
  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [active, setActive] = useState(true);

  // Visual
  const [bannerUrl, setBannerUrl] = useState('');
  const [mobileBannerUrl, setMobileBannerUrl] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(45);
  const [badgeText, setBadgeText] = useState('🌸 Edição Especial Bellclay');

  // Storytelling & Text
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [highlights, setHighlights] = useState<string[]>([
    '100% Feito à Mão ✨',
    'Frete Grátis acima de R$ 149 🚚',
    'Embalagem Perfumada de Presente 🎁',
    'Envio Seguro para todo o Brasil 🇧🇷'
  ]);
  const [newHighlight, setNewHighlight] = useState('');

  // Offer & Product
  const [showCoupon, setShowCoupon] = useState(true);
  const [couponCode, setCouponCode] = useState('BEMVINDO10');
  const [couponDiscountText, setCouponDiscountText] = useState('10% OFF no seu primeiro pedido');

  const [showFeaturedProduct, setShowFeaturedProduct] = useState(false);
  const [featuredProductId, setFeaturedProductId] = useState('');

  const [showTrustBadges, setShowTrustBadges] = useState(true);
  const [trustBadgeText, setTrustBadgeText] = useState('⭐ 5.0 estrelas (+500 clientes encantadas em todo o Brasil)');

  // Actions
  const [buttonText, setButtonText] = useState('Conhecer o site ✨');
  const [targetUrl, setTargetUrl] = useState('/');
  const [secondaryButtonText, setSecondaryButtonText] = useState('Tirar Dúvidas no WhatsApp');
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState('');

  // Upload States
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  // Tab & Preview States
  const [activeTab, setActiveTab] = useState<'geral' | 'visual' | 'textos' | 'oferta' | 'acoes'>('geral');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [previewOpened, setPreviewOpened] = useState(false);

  useEffect(() => {
    if (campaign) {
      setName(campaign.name || '');
      setSlug(campaign.slug || '');
      setActive(campaign.active !== false);
      setBannerUrl(campaign.bannerUrl || '');
      setMobileBannerUrl(campaign.mobileBannerUrl || '');
      setOverlayOpacity(campaign.overlayOpacity ?? 45);
      setBadgeText(campaign.badgeText || '🌸 Edição Especial Bellclay');
      setHeadline(campaign.headline || '');
      setSubtitle(campaign.subtitle || '');
      setStoryText(campaign.storyText || '');
      setHighlights(
        campaign.highlights && campaign.highlights.length > 0
          ? campaign.highlights
          : [
              '100% Feito à Mão ✨',
              'Frete Grátis acima de R$ 149 🚚',
              'Embalagem Perfumada de Presente 🎁',
              'Envio Seguro para todo o Brasil 🇧🇷'
            ]
      );
      setShowCoupon(Boolean(campaign.showCoupon));
      setCouponCode(campaign.couponCode || 'BEMVINDO10');
      setCouponDiscountText(campaign.couponDiscountText || '10% OFF no seu primeiro pedido');
      setShowFeaturedProduct(Boolean(campaign.showFeaturedProduct));
      setFeaturedProductId(campaign.featuredProductId || (products[0]?.id || ''));
      setShowTrustBadges(campaign.showTrustBadges !== false);
      setTrustBadgeText(campaign.trustBadgeText || '⭐ 5.0 estrelas (+500 clientes encantadas em todo o Brasil)');
      setButtonText(campaign.buttonText || 'Conhecer o site ✨');
      setTargetUrl(campaign.targetUrl || '/');
      setSecondaryButtonText(campaign.secondaryButtonText || 'Tirar Dúvidas no WhatsApp');
      setSecondaryButtonUrl(campaign.secondaryButtonUrl || '');
    } else {
      // New campaign defaults
      setName('Nova Campanha de Anúncio');
      setSlug(`anuncio-${Date.now().toString().slice(-4)}`);
      setActive(true);
      setBannerUrl(
        'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80'
      );
      setMobileBannerUrl('');
      setOverlayOpacity(45);
      setBadgeText('🌸 Edição Especial Instagram');
      setHeadline('Peças Únicas em Cerâmica Fria Feitas com Amor');
      setSubtitle('Modeladas à mão em Campo Mourão - PR. Dê um toque de fofura e personalidade à sua rotina!');
      setStoryText(
        'Oi! Ficamos muito felizes de ter você aqui. Cada criação Bellclay é esculpida pacientemente à mão, com acabamento vitrificado super resistente e cheia de carinho.'
      );
      setHighlights([
        '100% Feito à Mão ✨',
        'Frete Grátis acima de R$ 149 🚚',
        'Embalagem Perfumada de Presente 🎁',
        'Envio Seguro para todo o Brasil 🇧🇷'
      ]);
      setShowCoupon(true);
      setCouponCode('BEMVINDO10');
      setCouponDiscountText('10% OFF no primeiro pedido');
      setShowFeaturedProduct(false);
      setFeaturedProductId(products[0]?.id || '');
      setShowTrustBadges(true);
      setTrustBadgeText('⭐ 5.0 estrelas (+500 clientes encantadas em todo o Brasil)');
      setButtonText('Conhecer o site ✨');
      setTargetUrl('/');
      setSecondaryButtonText('Tirar Dúvidas no WhatsApp');
      setSecondaryButtonUrl('https://wa.me/5544999999999');
    }
    setPreviewOpened(false);
  }, [campaign, isOpen, products]);

  if (!isOpen) return null;

  const handleSlugChange = (raw: string) => {
    const formatted = raw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
    setSlug(formatted);
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setHighlights([...highlights, newHighlight.trim()]);
      setNewHighlight('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'banner' | 'mobile'
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'banner') setIsUploadingBanner(true);
      else setIsUploadingMobile(true);

      try {
        const cloudUrl = await uploadToCloudinary(file, 'bellclay/campaigns');
        if (type === 'banner') setBannerUrl(cloudUrl);
        else setMobileBannerUrl(cloudUrl);
      } catch (err) {
        console.error('Erro no upload para o Cloudinary:', err);
      } finally {
        if (type === 'banner') setIsUploadingBanner(false);
        else setIsUploadingMobile(false);
        e.target.value = '';
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalSlug = slug.trim() || `anuncio-${Date.now().toString().slice(-4)}`;

    onSave({
      id: campaign?.id || `camp-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      active,
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80',
      mobileBannerUrl: mobileBannerUrl || undefined,
      overlayOpacity: Number(overlayOpacity),
      badgeText: badgeText.trim(),
      headline: headline.trim(),
      subtitle: subtitle.trim(),
      storyText: storyText.trim() || undefined,
      highlights,
      showCoupon,
      couponCode: showCoupon ? couponCode.trim() : undefined,
      couponDiscountText: showCoupon ? couponDiscountText.trim() : undefined,
      showFeaturedProduct,
      featuredProductId: showFeaturedProduct ? featuredProductId : undefined,
      showTrustBadges,
      trustBadgeText: showTrustBadges ? trustBadgeText.trim() : undefined,
      buttonText: buttonText.trim() || 'Conhecer o site ✨',
      targetUrl: targetUrl.trim() || '/',
      secondaryButtonText: secondaryButtonText.trim() || undefined,
      secondaryButtonUrl: secondaryButtonUrl.trim() || undefined,
      viewsCount: campaign?.viewsCount || 0,
      clicksCount: campaign?.clicksCount || 0,
      createdAt: campaign?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    onClose();
  };

  const selectedProd = products.find(p => p.id === featuredProductId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border/60 bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand-pink-light flex items-center justify-center text-brand-pink">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-brand-charcoal">
                {campaign ? 'Editar Tela de Anúncio' : 'Nova Tela de Anúncio (Landing Link)'}
              </h3>
              <p className="text-xs text-brand-muted">
                Configure a tela de boas-vindas com banner, storytelling e abertura para cima
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-brand-muted hover:text-brand-charcoal hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Split Form + Live Mockup Preview */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Column: Form Settings (Tabs) */}
          <div className="lg:col-span-7 flex flex-col h-full border-r border-brand-border/60 overflow-hidden">
            {/* Tabs Navigation */}
            <div className="flex items-center gap-1.5 px-6 py-2.5 border-b border-brand-border/60 bg-[#FAF8F5]/50 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('geral')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'geral'
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-white'
                }`}
              >
                1. Link & Geral
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('visual')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-white'
                }`}
              >
                2. Banner & Visual
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('textos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'textos'
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-white'
                }`}
              >
                3. Textos & História
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('oferta')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'oferta'
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-white'
                }`}
              >
                4. Cupom & Produto
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('acoes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'acoes'
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-white'
                }`}
              >
                5. Botão & Destino
              </button>
            </div>

            {/* Scrollable Form Content */}
            <form onSubmit={handleSubmit} id="campaign-form" className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* TAB 1: GERAL & LINK */}
              {activeTab === 'geral' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Nome Interno da Campanha *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ex: Instagram Stories - Coleção Gatinhos Fofos"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 font-medium"
                      required
                    />
                    <p className="text-[11px] text-brand-muted mt-1">
                      Apenas você vê este nome no painel para organizar suas métricas de anúncios.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Slug da URL do Anúncio (Link Compartilhável) *
                    </label>
                    <div className="flex items-center rounded-xl border border-brand-border bg-[#FAF8F5] overflow-hidden focus-within:ring-2 focus-within:ring-brand-pink/30">
                      <span className="px-3 py-2.5 text-xs text-brand-muted border-r border-brand-border/70 bg-black/5 select-none font-mono">
                        bellclayart.vercel.app/lp/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={e => handleSlugChange(e.target.value)}
                        placeholder="gatinhos-fofos"
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none font-mono font-bold text-brand-pink"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-brand-muted mt-1">
                      Este é o link que você vai colocar nos anúncios (Stories, Bio, TikTok, Google).
                    </p>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-brand-border/70 bg-[#FAF8F5] cursor-pointer hover:bg-brand-pink-light/30 transition-all">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={e => setActive(e.target.checked)}
                        className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-bold text-brand-charcoal block">
                          Campanha Ativa
                        </span>
                        <span className="text-[11px] text-brand-muted block">
                          Se desativada, o link redirecionará automaticamente para a home da loja.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: BANNER & VISUAL */}
              {activeTab === 'visual' && (
                <div className="space-y-5">
                  {/* Desktop Banner */}
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Banner de Fundo Principal (Desktop / Geral) *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={bannerUrl}
                        onChange={e => setBannerUrl(e.target.value)}
                        placeholder="https://... ou faça upload"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                        required
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold cursor-pointer hover:bg-brand-pink/90 transition-all flex items-center gap-1.5 shrink-0 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingBanner ? 'Enviando...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e, 'banner')}
                          className="hidden"
                          disabled={isUploadingBanner}
                        />
                      </label>
                    </div>

                    {bannerUrl && (
                      <div className="relative h-28 rounded-2xl overflow-hidden border border-brand-border shadow-inner">
                        <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Mobile Banner (Optional) */}
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Banner Otimizado para Celular (Vertical / Stories) - Opcional
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={mobileBannerUrl}
                        onChange={e => setMobileBannerUrl(e.target.value)}
                        placeholder="Imagem vertical específica para celular (opcional)"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-brand-charcoal text-white text-xs font-bold cursor-pointer hover:bg-black transition-all flex items-center gap-1.5 shrink-0 shadow-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingMobile ? 'Enviando...' : 'Upload'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleFileUpload(e, 'mobile')}
                          className="hidden"
                          disabled={isUploadingMobile}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Dark Overlay Opacity */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-brand-charcoal">
                        Escurecimento do Fundo (Overlay)
                      </label>
                      <span className="text-xs font-bold text-brand-pink">{overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="85"
                      value={overlayOpacity}
                      onChange={e => setOverlayOpacity(Number(e.target.value))}
                      className="w-full accent-brand-pink cursor-pointer"
                    />
                    <p className="text-[11px] text-brand-muted mt-1">
                      Garante contraste perfeito para os textos brancos ficarem legíveis sobre a foto.
                    </p>
                  </div>

                  {/* Badge Text */}
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Badge de Cabeçalho
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={e => setBadgeText(e.target.value)}
                      placeholder="Ex: 🌸 Edição Especial Bellclay"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: TEXTOS & HISTÓRIA */}
              {activeTab === 'textos' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Título Principal de Boas-Vindas *
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      placeholder="Ex: Peças Únicas em Cerâmica Fria Feitas com Amor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Subtítulo Explicativo *
                    </label>
                    <textarea
                      rows={2}
                      value={subtitle}
                      onChange={e => setSubtitle(e.target.value)}
                      placeholder="Ex: Modeladas à mão em Campo Mourão - PR. Dê um toque de fofura e personalidade à sua rotina!"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      História da Peça / Storytelling ("Tela que fala alguma coisa")
                    </label>
                    <textarea
                      rows={3}
                      value={storyText}
                      onChange={e => setStoryText(e.target.value)}
                      placeholder="Conte um pedacinho de história: 'Oi! Que bom que você veio pelo anúncio. Cada peça da Bellclay nasce de um pedaço de argila moldado à mão...'"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                    />
                    <p className="text-[11px] text-brand-muted mt-1">
                      Aparece em uma caixa translúcida charmosa estilo citação.
                    </p>
                  </div>

                  {/* Highlights / Benefícios em Pílulas */}
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Pílulas de Benefícios & Destaques
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {highlights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-brand-pink-light text-brand-charcoal text-xs font-semibold border border-brand-pink/20"
                        >
                          <span>{h}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveHighlight(i)}
                            className="text-brand-muted hover:text-red-500 cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newHighlight}
                        onChange={e => setNewHighlight(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddHighlight();
                          }
                        }}
                        placeholder="Ex: Embalagem Perfumada 🎁"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-3 py-2 rounded-xl bg-brand-charcoal text-white text-xs font-bold hover:bg-black transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Adicionar</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: OFERTA & PRODUTO */}
              {activeTab === 'oferta' && (
                <div className="space-y-5">
                  {/* Coupon Card */}
                  <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCoupon}
                        onChange={e => setShowCoupon(e.target.checked)}
                        className="w-4 h-4 text-amber-500 rounded focus:ring-amber-400 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-brand-charcoal">
                        Exibir Cupom de Boas-Vindas com 1-Clique para Copiar (Recomendado para Anúncios)
                      </span>
                    </label>

                    {showCoupon && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div>
                          <label className="block text-[11px] font-bold text-brand-charcoal mb-1">
                            Código do Cupom
                          </label>
                          <input
                            type="text"
                            value={couponCode}
                            onChange={e => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="BEMVINDO10"
                            className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white font-mono font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-brand-charcoal mb-1">
                            Texto da Oferta
                          </label>
                          <input
                            type="text"
                            value={couponDiscountText}
                            onChange={e => setCouponDiscountText(e.target.value)}
                            placeholder="10% OFF no seu primeiro pedido"
                            className="w-full px-3 py-2 rounded-xl border border-amber-300 bg-white text-xs font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Featured Product Spotlight */}
                  <div className="p-4 rounded-2xl border border-brand-border/80 bg-[#FAF8F5] space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFeaturedProduct}
                        onChange={e => setShowFeaturedProduct(e.target.checked)}
                        className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink cursor-pointer"
                      />
                      <span className="text-xs font-bold text-brand-charcoal">
                        Destacar Peça Específica do Anúncio (Mini Vitrine na Tela de Boas-Vindas)
                      </span>
                    </label>

                    {showFeaturedProduct && (
                      <div>
                        <label className="block text-[11px] font-bold text-brand-charcoal mb-1">
                          Selecione o Produto em Destaque
                        </label>
                        <select
                          value={featuredProductId}
                          onChange={e => setFeaturedProductId(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-xl border border-brand-border bg-white text-xs font-bold text-brand-charcoal"
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.title} - R$ {p.promotionalPrice || p.price}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Trust Badges */}
                  <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTrustBadges}
                        onChange={e => setShowTrustBadges(e.target.checked)}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className="text-xs font-bold text-brand-charcoal">
                        Exibir Selo de Avaliação & Prova Social
                      </span>
                    </label>

                    {showTrustBadges && (
                      <input
                        type="text"
                        value={trustBadgeText}
                        onChange={e => setTrustBadgeText(e.target.value)}
                        placeholder="⭐ 5.0 estrelas (+500 clientes encantadas em todo o Brasil)"
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs font-medium mt-1"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* TAB 5: BOTÃO & DESTINO */}
              {activeTab === 'acoes' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Texto do Botão Principal (Abertura para Cima) *
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={e => setButtonText(e.target.value)}
                      placeholder="Conhecer o site ✨"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Destino após a Animação de Abertura
                    </label>
                    <select
                      value={targetUrl}
                      onChange={e => setTargetUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs font-bold text-brand-charcoal focus:bg-white"
                    >
                      <option value="/">Página Inicial Completa da Loja (Home)</option>
                      <option value="#produtos">Rolar até a seção de Catálogo de Peças</option>
                      <optgroup label="Categorias Específicas">
                        {categories.map(cat => (
                          <option key={cat.id} value={`/produtos/${cat.slug}`}>
                            Categoria: {cat.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Produtos Específicos">
                        {products.slice(0, 10).map(prod => (
                          <option key={prod.id} value={`/produto/${prod.slug}`}>
                            Produto: {prod.title}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-brand-border/60">
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Botão Secundário Opcional (ex: Falar no WhatsApp)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-brand-muted block mb-1">Texto do botão</span>
                        <input
                          type="text"
                          value={secondaryButtonText}
                          onChange={e => setSecondaryButtonText(e.target.value)}
                          placeholder="Tirar Dúvidas no WhatsApp"
                          className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-brand-muted block mb-1">Link do WhatsApp / URL</span>
                        <input
                          type="url"
                          value={secondaryButtonUrl}
                          onChange={e => setSecondaryButtonUrl(e.target.value)}
                          placeholder="https://wa.me/5544999999999"
                          className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </form>

            {/* Modal Footer Controls */}
            <div className="p-4 px-6 border-t border-brand-border/60 bg-[#FAF8F5] flex items-center justify-between shrink-0">
              <span className="text-xs text-brand-muted font-mono truncate max-w-xs">
                Link: /lp/{slug || '...'}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-white transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="campaign-form"
                  className="px-5 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink/90 transition-all shadow-pink-soft cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Tela de Anúncio</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Mockup Preview */}
          <div className="lg:col-span-5 bg-[#1F181B] p-4 flex flex-col items-center justify-between overflow-hidden">
            {/* Device Bar Controls */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    previewDevice === 'mobile' ? 'bg-white text-brand-charcoal font-bold' : 'text-white/70 hover:text-white'
                  }`}
                  title="Simulador Celular (Instagram Stories)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-brand-charcoal font-bold' : 'text-white/70 hover:text-white'
                  }`}
                  title="Simulador Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                {previewOpened && (
                  <button
                    type="button"
                    onClick={() => setPreviewOpened(false)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-pink text-white text-[11px] font-bold hover:bg-brand-pink/90 transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Ver Tela Novamente</span>
                  </button>
                )}
                <span className="text-[11px] text-white/50 font-medium">
                  {previewDevice === 'mobile' ? 'Visualização Mobile' : 'Visualização Desktop'}
                </span>
              </div>
            </div>

            {/* Mockup Frame */}
            <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden my-auto">
              <div
                className={`relative bg-[#2D1B22] rounded-[32px] overflow-hidden border-4 border-white/20 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                  previewDevice === 'mobile'
                    ? 'w-[290px] h-[520px]'
                    : 'w-[420px] h-[480px]'
                }`}
              >
                {/* Simulated Store Underneath (Revealed when curtain goes up) */}
                <div className="absolute inset-0 bg-[#FAF7F2] p-4 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-2xl bg-brand-pink-light flex items-center justify-center text-brand-pink mb-3 shadow-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-brand-charcoal">
                    Loja Bellclay Carregada!
                  </h4>
                  <p className="text-[11px] text-brand-muted mt-1 max-w-[200px]">
                    A tela de boas-vindas subiu com sucesso e o cliente está na loja!
                  </p>
                  <button
                    onClick={() => setPreviewOpened(false)}
                    className="mt-4 px-3 py-1.5 rounded-xl bg-brand-pink text-white text-[10px] font-bold shadow-xs cursor-pointer"
                  >
                    Fechar e Testar Novamente
                  </button>
                </div>

                {/* Simulated Welcome Screen Curtain */}
                <div
                  className={`absolute inset-0 flex flex-col justify-between p-3.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    previewOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                  }`}
                  style={{
                    backgroundColor: '#1E1218'
                  }}
                >
                  {/* Banner Image */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <img
                      src={mobileBannerUrl && previewDevice === 'mobile' ? mobileBannerUrl : bannerUrl}
                      alt="Banner"
                      className="w-full h-full object-cover scale-105"
                    />
                    <div
                      className="absolute inset-0 bg-black"
                      style={{ opacity: overlayOpacity / 100 }}
                    />
                  </div>

                  {/* Top Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-white p-1">
                        <img src="/bellclay_logo.png" alt="Logo" className="w-full h-full object-contain" />
                      </div>
                      <span className="text-[11px] font-extrabold text-white">Bellclay</span>
                    </div>
                    {badgeText && (
                      <span className="text-[9px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                        {badgeText}
                      </span>
                    )}
                  </div>

                  {/* Center Text */}
                  <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-pink text-white text-[9px] font-bold mb-1.5">
                      <Heart className="w-2.5 h-2.5 fill-current" />
                      100% à mão
                    </span>

                    <h3 className="text-xs sm:text-sm font-extrabold text-white leading-tight mb-1 drop-shadow-md">
                      {headline || 'Título do Anúncio'}
                    </h3>

                    <p className="text-[10px] text-white/85 line-clamp-2 mb-2">
                      {subtitle || 'Subtítulo da mensagem de boas-vindas'}
                    </p>

                    {/* Story Preview */}
                    {storyText && (
                      <div className="w-full bg-white/15 backdrop-blur-xs rounded-xl p-2 text-[9px] text-white/90 italic mb-2 line-clamp-2">
                        "{storyText}"
                      </div>
                    )}

                    {/* Coupon Preview */}
                    {showCoupon && couponCode && (
                      <div className="w-full bg-amber-400/20 border border-amber-300/40 rounded-xl p-1.5 flex items-center justify-between text-left mb-2">
                        <div className="truncate">
                          <span className="text-[8px] text-amber-200 font-bold block">
                            {couponDiscountText || 'Cupom'}
                          </span>
                          <span className="font-mono text-[10px] font-extrabold text-white">
                            {couponCode}
                          </span>
                        </div>
                        <span className="text-[9px] font-bold bg-white text-brand-charcoal px-2 py-0.5 rounded-lg shrink-0">
                          Copiar
                        </span>
                      </div>
                    )}

                    {/* Featured Product Preview */}
                    {showFeaturedProduct && selectedProd && (
                      <div className="w-full bg-white/95 rounded-xl p-1.5 flex items-center gap-2 text-left mb-2 shadow-md">
                        <img
                          src={selectedProd.images?.[0] || bannerUrl}
                          alt="Prod"
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold text-brand-charcoal truncate block">
                            {selectedProd.title}
                          </span>
                          <span className="text-[9px] font-extrabold text-brand-pink">
                            R$ {selectedProd.promotionalPrice || selectedProd.price}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Trust */}
                    {showTrustBadges && (
                      <div className="flex items-center gap-1 text-[9px] text-white/80 font-medium mb-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-400" />
                        <span className="truncate max-w-[200px]">{trustBadgeText}</span>
                      </div>
                    )}
                  </div>

                  {/* Action CTA: Click triggers opening animation! */}
                  <div className="relative z-10 w-full flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewOpened(true)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-brand-pink to-rose-400 text-white font-extrabold text-[11px] shadow-lg flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer border border-white/20 animate-pulse"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{buttonText || 'Conhecer o site ✨'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>

                    <p className="text-[9px] text-white/50 text-center">
                      (Clique acima para testar a abertura para cima)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Hint */}
            <div className="w-full pt-2 border-t border-white/10 text-center shrink-0">
              <span className="text-[11px] text-white/60">
                ✨ O botão dispara a animação para cima revelando a loja por baixo!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
