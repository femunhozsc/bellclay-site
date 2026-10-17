import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Sparkles,
  Check,
  Copy,
  Plus,
  Smartphone,
  Monitor,
  Star,
  MessageCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw
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
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [active, setActive] = useState(true);

  // Visual
  const [bannerUrl, setBannerUrl] = useState('');
  const [mobileBannerUrl, setMobileBannerUrl] = useState('');
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [badgeText, setBadgeText] = useState('Edição Especial');

  // Storytelling & Text
  const [headline, setHeadline] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [storyText, setStoryText] = useState('');
  const [highlights, setHighlights] = useState<string[]>([
    'Modelagem 100% Manual',
    'Frete Grátis acima de R$ 149',
    'Embalagem para Presente'
  ]);
  const [newHighlight, setNewHighlight] = useState('');

  // Offer & Product
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountText, setCouponDiscountText] = useState('10% OFF na Primeira Compra');

  const [showFeaturedProduct, setShowFeaturedProduct] = useState(false);
  const [featuredProductId, setFeaturedProductId] = useState('');

  const [showTrustBadges, setShowTrustBadges] = useState(true);
  const [trustBadgeText, setTrustBadgeText] = useState('Avaliação 5.0 • Mais de 500 pedidos entregues no Brasil');

  // Actions
  const [buttonText, setButtonText] = useState('Conhecer o site');
  const [targetUrl, setTargetUrl] = useState('/');
  const [secondaryButtonText, setSecondaryButtonText] = useState('Atendimento no WhatsApp');
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState('');

  // Upload States
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingMobile, setIsUploadingMobile] = useState(false);

  // Tab & Preview States
  const [activeTab, setActiveTab] = useState<'geral' | 'visual' | 'textos' | 'oferta' | 'acoes'>('geral');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [previewOpened, setPreviewOpened] = useState(false);

  const formatSlug = (str: string) => {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/--+/g, '-')
      .replace(/^-|-$/g, '');
  };

  useEffect(() => {
    if (!isOpen) return;

    if (campaign) {
      // Editing existing campaign: load exact values
      setName(campaign.name || '');
      setSlug(campaign.slug || '');
      setIsSlugManuallyEdited(true);
      setActive(campaign.active !== false);
      setBannerUrl(campaign.bannerUrl || '');
      setMobileBannerUrl(campaign.mobileBannerUrl || '');
      setOverlayOpacity(campaign.overlayOpacity ?? 50);
      setBadgeText(campaign.badgeText || 'Edição Especial');
      setHeadline(campaign.headline || '');
      setSubtitle(campaign.subtitle || '');
      setStoryText(campaign.storyText || '');
      setHighlights(
        campaign.highlights && campaign.highlights.length > 0
          ? campaign.highlights
          : ['Modelagem 100% Manual', 'Frete Grátis acima de R$ 149', 'Embalagem para Presente']
      );
      setShowCoupon(Boolean(campaign.showCoupon));
      setCouponCode(campaign.couponCode || '');
      setCouponDiscountText(campaign.couponDiscountText || '10% OFF na Primeira Compra');
      setShowFeaturedProduct(Boolean(campaign.showFeaturedProduct));
      setFeaturedProductId(campaign.featuredProductId || (products[0]?.id || ''));
      setShowTrustBadges(campaign.showTrustBadges !== false);
      setTrustBadgeText(campaign.trustBadgeText || 'Avaliação 5.0 • Mais de 500 pedidos entregues no Brasil');
      setButtonText(campaign.buttonText || 'Conhecer o site');
      setTargetUrl(campaign.targetUrl || '/');
      setSecondaryButtonText(campaign.secondaryButtonText || 'Atendimento no WhatsApp');
      setSecondaryButtonUrl(campaign.secondaryButtonUrl || '');
    } else {
      // Creating NEW campaign: start clean without hardcoded gatinhos text!
      setName('');
      setSlug('');
      setIsSlugManuallyEdited(false);
      setActive(true);
      setBannerUrl('https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80');
      setMobileBannerUrl('');
      setOverlayOpacity(50);
      setBadgeText('Coleção Exclusiva');
      setHeadline('');
      setSubtitle('');
      setStoryText('');
      setHighlights([
        'Modelagem 100% Manual',
        'Frete Grátis acima de R$ 149',
        'Embalagem para Presente'
      ]);
      setShowCoupon(false);
      setCouponCode('BEMVINDO10');
      setCouponDiscountText('10% OFF na Primeira Compra');
      setShowFeaturedProduct(false);
      setFeaturedProductId(products[0]?.id || '');
      setShowTrustBadges(true);
      setTrustBadgeText('Avaliação 5.0 • Mais de 500 pedidos entregues no Brasil');
      setButtonText('Conhecer o site');
      setTargetUrl('/');
      setSecondaryButtonText('Atendimento no WhatsApp');
      setSecondaryButtonUrl('');
    }
    setPreviewOpened(false);
    setActiveTab('geral');
  }, [campaign, isOpen, products]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isSlugManuallyEdited && !campaign) {
      setSlug(formatSlug(val));
    }
  };

  const handleSlugInputChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    setSlug(formatSlug(val));
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

    const finalSlug = slug.trim() || formatSlug(name) || `anuncio-${Date.now().toString().slice(-4)}`;

    onSave({
      id: campaign?.id || `camp-${Date.now()}`,
      name: name.trim(),
      slug: finalSlug,
      active,
      bannerUrl: bannerUrl.trim() || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80',
      mobileBannerUrl: mobileBannerUrl.trim() || undefined,
      overlayOpacity: Number(overlayOpacity),
      badgeText: badgeText.trim(),
      headline: headline.trim() || name.trim(),
      subtitle: subtitle.trim(),
      storyText: storyText.trim() || undefined,
      highlights,
      showCoupon,
      couponCode: showCoupon && couponCode.trim() ? couponCode.trim().toUpperCase() : undefined,
      couponDiscountText: showCoupon && couponDiscountText.trim() ? couponDiscountText.trim() : undefined,
      showFeaturedProduct,
      featuredProductId: showFeaturedProduct ? featuredProductId : undefined,
      showTrustBadges,
      trustBadgeText: showTrustBadges ? trustBadgeText.trim() : undefined,
      buttonText: buttonText.trim() || 'Conhecer o site',
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
      <div className="fixed inset-0 bg-[#2B2625]/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border/60 bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-brand-pink-light flex items-center justify-center text-brand-pink">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-brand-charcoal">
                {campaign ? 'Editar Tela de Anúncio' : 'Nova Tela de Anúncio'}
              </h3>
              <p className="text-xs text-brand-muted">
                Página de boas-vindas compartilhável para campanhas e anúncios
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'visual'
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-white'
                }`}
              >
                2. Banner & Imagem
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('textos')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  activeTab === 'oferta'
                    ? 'bg-brand-pink text-white shadow-xs'
                    : 'text-brand-muted hover:text-brand-charcoal hover:bg-white'
                }`}
              >
                4. Cupom & Peça
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('acoes')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
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
                      Nome da Campanha (Identificação Interna) *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => handleNameChange(e.target.value)}
                      placeholder="Ex: Coleção Especial de Páscoa - Stories"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 font-medium"
                      required
                    />
                    <p className="text-[11px] text-brand-muted mt-1">
                      Nome visível apenas para você no painel para acompanhar os resultados.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Link Amigável do Anúncio (Slug da URL) *
                    </label>
                    <div className="flex items-center rounded-xl border border-brand-border bg-[#FAF8F5] overflow-hidden focus-within:ring-2 focus-within:ring-brand-pink/30">
                      <span className="px-3 py-2.5 text-xs text-brand-muted border-r border-brand-border/70 bg-black/5 select-none font-mono">
                        loja/lp/
                      </span>
                      <input
                        type="text"
                        value={slug}
                        onChange={e => handleSlugInputChange(e.target.value)}
                        placeholder="colecao-pascoa"
                        className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none font-sans font-bold text-brand-pink"
                        required
                      />
                    </div>
                    <p className="text-[11px] text-brand-muted mt-1">
                      O endereço final compartilhado no anúncio (ex: bellclayart.vercel.app/lp/colecao-pascoa).
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
                          Quando desativada, redireciona suavemente para a página inicial da loja.
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* TAB 2: BANNER & VISUAL */}
              {activeTab === 'visual' && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Imagem de Fundo Principal *
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={bannerUrl}
                        onChange={e => setBannerUrl(e.target.value)}
                        placeholder="Cole a URL ou envie uma foto do ateliê/peças"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                        required
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-brand-pink text-white text-xs font-semibold cursor-pointer hover:bg-brand-pink/90 transition-all flex items-center gap-1.5 shrink-0 shadow-xs">
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
                        <img src={bannerUrl} alt="Preview Banner" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Imagem Vertical para Celular (Opcional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={mobileBannerUrl}
                        onChange={e => setMobileBannerUrl(e.target.value)}
                        placeholder="Opcional: foto vertical específica para tela de celular"
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                      />
                      <label className="px-4 py-2.5 rounded-xl bg-brand-charcoal text-white text-xs font-semibold cursor-pointer hover:bg-black transition-all flex items-center gap-1.5 shrink-0 shadow-xs">
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

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-brand-charcoal">
                        Contraste da Foto (Escurecimento suave)
                      </label>
                      <span className="text-xs font-bold text-brand-pink">{overlayOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="85"
                      value={overlayOpacity}
                      onChange={e => setOverlayOpacity(Number(e.target.value))}
                      className="w-full accent-brand-pink cursor-pointer"
                    />
                    <p className="text-[11px] text-brand-muted mt-1">
                      Ajuste para garantir que o texto fique perfeitamente nítido sobre a imagem.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Etiqueta do Topo (Sem emojis)
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={e => setBadgeText(e.target.value)}
                      placeholder="Ex: Coleção Limitada, Lançamento Exclusivo"
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
                      Título Principal *
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={e => setHeadline(e.target.value)}
                      placeholder="Ex: Peças Únicas em Cerâmica Fria Feitas com Amor"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 font-serif"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Subtítulo Acolhedor *
                    </label>
                    <textarea
                      rows={2}
                      value={subtitle}
                      onChange={e => setSubtitle(e.target.value)}
                      placeholder="Ex: Modeladas e pintadas à mão em Campo Mourão - PR. Dê um toque de afeto à sua rotina."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Mensagem da Artesã / História da Peça ("Tela que fala alguma coisa")
                    </label>
                    <textarea
                      rows={3}
                      value={storyText}
                      onChange={e => setStoryText(e.target.value)}
                      placeholder="Ex: Cada detalhe que você vê nasce de um pedaço de argila moldado pacientemente pelas mãos, finalizado com verniz vitrificado resistente para acompanhar você onde for."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30"
                    />
                    <p className="text-[11px] text-brand-muted mt-1">
                      Aparece como uma citação elegante com traço lateral na cor da marca.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Destaques da Marca (Sem emojis)
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {highlights.map((h, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink-light text-brand-charcoal text-xs font-medium border border-brand-pink/20"
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
                        placeholder="Ex: Embalagem para Presente"
                        className="flex-1 px-3.5 py-2 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs focus:bg-white focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleAddHighlight}
                        className="px-3 py-2 rounded-xl bg-brand-charcoal text-white text-xs font-semibold hover:bg-black transition-all flex items-center gap-1 cursor-pointer"
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
                  <div className="p-4 rounded-2xl border border-brand-border bg-[#FAF8F5] space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCoupon}
                        onChange={e => setShowCoupon(e.target.checked)}
                        className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink cursor-pointer"
                      />
                      <span className="text-xs font-bold text-brand-charcoal">
                        Exibir Cupom de Desconto com Botão Copiar
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
                            className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white font-sans font-bold text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-brand-charcoal mb-1">
                            Benefício Explicativo
                          </label>
                          <input
                            type="text"
                            value={couponDiscountText}
                            onChange={e => setCouponDiscountText(e.target.value)}
                            placeholder="10% OFF na Primeira Compra"
                            className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-medium"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Featured Product */}
                  <div className="p-4 rounded-2xl border border-brand-border bg-[#FAF8F5] space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showFeaturedProduct}
                        onChange={e => setShowFeaturedProduct(e.target.checked)}
                        className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink cursor-pointer"
                      />
                      <span className="text-xs font-bold text-brand-charcoal">
                        Destacar Peça Específica do Anúncio (Mini Card)
                      </span>
                    </label>

                    {showFeaturedProduct && (
                      <div>
                        <label className="block text-[11px] font-bold text-brand-charcoal mb-1">
                          Selecione o Produto
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

                  {/* Trust Badge */}
                  <div className="p-4 rounded-2xl border border-brand-border bg-[#FAF8F5] space-y-2">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTrustBadges}
                        onChange={e => setShowTrustBadges(e.target.checked)}
                        className="w-4 h-4 text-brand-pink rounded focus:ring-brand-pink cursor-pointer"
                      />
                      <span className="text-xs font-bold text-brand-charcoal">
                        Exibir Indicador de Confiança & Avaliação
                      </span>
                    </label>

                    {showTrustBadges && (
                      <input
                        type="text"
                        value={trustBadgeText}
                        onChange={e => setTrustBadgeText(e.target.value)}
                        placeholder="Avaliação 5.0 • Mais de 500 pedidos entregues no Brasil"
                        className="w-full px-3 py-2 rounded-xl border border-brand-border bg-white text-xs font-medium mt-1"
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
                      Texto do Botão Principal *
                    </label>
                    <input
                      type="text"
                      value={buttonText}
                      onChange={e => setButtonText(e.target.value)}
                      placeholder="Conhecer o site"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 font-semibold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Destino após a Abertura para Cima
                    </label>
                    <select
                      value={targetUrl}
                      onChange={e => setTargetUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs font-bold text-brand-charcoal focus:bg-white"
                    >
                      <option value="/">Página Inicial Completa da Loja</option>
                      <option value="#produtos">Rolar até o Catálogo de Peças</option>
                      <optgroup label="Categorias">
                        {categories.map(cat => (
                          <option key={cat.id} value={`/produtos/${cat.slug}`}>
                            Categoria: {cat.name}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Peças Específicas">
                        {products.slice(0, 10).map(prod => (
                          <option key={prod.id} value={`/produto/${prod.slug}`}>
                            Peça: {prod.title}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="pt-2 border-t border-brand-border/60">
                    <label className="block text-xs font-bold text-brand-charcoal mb-1.5">
                      Botão Secundário Opcional (WhatsApp)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-brand-muted block mb-1">Texto</span>
                        <input
                          type="text"
                          value={secondaryButtonText}
                          onChange={e => setSecondaryButtonText(e.target.value)}
                          placeholder="Atendimento no WhatsApp"
                          className="w-full px-3 py-2 rounded-xl border border-brand-border bg-[#FAF8F5] text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[11px] text-brand-muted block mb-1">Link do WhatsApp</span>
                        <input
                          type="url"
                          value={secondaryButtonUrl}
                          onChange={e => setSecondaryButtonUrl(e.target.value)}
                          placeholder="https://wa.me/55..."
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
              <span className="text-xs text-brand-muted font-sans font-medium truncate max-w-xs">
                Destino: /lp/{slug || '...'}
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

          {/* Right Column: Live Mockup Preview (Clean Artisanal Aesthetic) */}
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
                  title="Celular"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    previewDevice === 'desktop' ? 'bg-white text-brand-charcoal font-bold' : 'text-white/70 hover:text-white'
                  }`}
                  title="Desktop"
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
                    <span>Ver Tela</span>
                  </button>
                )}
                <span className="text-[11px] text-white/50 font-medium">
                  {previewDevice === 'mobile' ? 'Mobile' : 'Desktop'}
                </span>
              </div>
            </div>

            {/* Mockup Frame */}
            <div className="flex-1 w-full flex items-center justify-center p-2 overflow-hidden my-auto">
              <div
                className={`relative bg-[#1E191A] rounded-[32px] overflow-hidden border-4 border-white/20 shadow-2xl transition-all duration-300 flex flex-col justify-between ${
                  previewDevice === 'mobile'
                    ? 'w-[290px] h-[520px]'
                    : 'w-[420px] h-[480px]'
                }`}
              >
                {/* Simulated Store Underneath */}
                <div className="absolute inset-0 bg-[#FAF7F2] p-4 flex flex-col items-center justify-center text-center">
                  <h4 className="font-serif font-bold text-base text-brand-charcoal">
                    Loja Bellclay Carregada
                  </h4>
                  <p className="text-[11px] text-brand-muted mt-1 max-w-[200px]">
                    A tela abriu para cima e o visitante já está na loja!
                  </p>
                  <button
                    onClick={() => setPreviewOpened(false)}
                    className="mt-4 px-3 py-1.5 rounded-full bg-brand-pink text-white text-[10px] font-bold shadow-xs cursor-pointer"
                  >
                    Testar Novamente
                  </button>
                </div>

                {/* Simulated Welcome Screen Curtain */}
                <div
                  className={`absolute inset-0 flex flex-col justify-between p-3.5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    previewOpened ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
                  }`}
                  style={{ backgroundColor: '#1E191A' }}
                >
                  {/* Banner Image */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <img
                      src={mobileBannerUrl && previewDevice === 'mobile' ? mobileBannerUrl : (bannerUrl || 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=1600&q=80')}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 bg-black"
                      style={{ opacity: overlayOpacity / 100 }}
                    />
                  </div>

                  {/* Top Bar (Grounded, non-floating) */}
                  <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5">
                      <img src="/bellclay_logo.png" alt="Logo" className="h-5 w-auto object-contain" />
                      <span className="font-serif text-[10px] uppercase tracking-wider text-white font-medium">
                        BELLCLAY
                      </span>
                    </div>
                    {badgeText && (
                      <span className="text-[8px] font-medium text-white/90 bg-white/10 px-2 py-0.5 rounded-full border border-white/20 uppercase tracking-wide">
                        {badgeText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()}
                      </span>
                    )}
                  </div>

                  {/* Center Text */}
                  <div className="relative z-10 flex flex-col items-center text-center my-auto py-2">
                    <span className="text-[8px] font-semibold text-[#FD7687] uppercase tracking-[0.2em] mb-1">
                      Cerâmica Fria Autoral
                    </span>

                    <h3 className="font-serif text-xs sm:text-sm font-normal text-white leading-tight mb-1 drop-shadow-sm">
                      {headline || (name || 'Título da Peça')}
                    </h3>

                    <p className="text-[9px] text-white/80 line-clamp-2 mb-2 font-sans">
                      {subtitle || 'Subtítulo da mensagem de boas-vindas'}
                    </p>

                    {/* Story Preview */}
                    {storyText && (
                      <div className="w-full border-l-2 border-[#FD7687] pl-2 text-left mb-2">
                        <p className="font-serif text-[8px] text-white/90 italic line-clamp-2">
                          "{storyText}"
                        </p>
                      </div>
                    )}

                    {/* Coupon Preview (Clean tactile boutique card) */}
                    {showCoupon && couponCode && (
                      <div className="w-full bg-white rounded-xl p-2 text-left mb-2 shadow-xs border border-[#EAE3DA]">
                        <span className="text-[7px] font-bold text-[#756D69] uppercase tracking-wide block">
                          {couponDiscountText || 'Cupom Especial'}
                        </span>
                        <div className="flex items-center justify-between bg-[#FDFBF7] rounded-lg px-2 py-1 border border-dashed border-[#D4AF37]/40 mt-0.5">
                          <span className="font-sans text-[9px] font-extrabold text-[#2B2625] tracking-wide">
                            {couponCode}
                          </span>
                          <span className="text-[8px] font-semibold bg-[#2B2625] text-white px-2 py-0.5 rounded-md">
                            Copiar
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Featured Product Preview */}
                    {showFeaturedProduct && selectedProd && (
                      <div className="w-full bg-white/95 rounded-xl p-1.5 flex items-center gap-2 text-left mb-2 shadow-xs border border-[#EAE3DA]">
                        <img
                          src={selectedProd.images?.[0] || bannerUrl}
                          alt="Prod"
                          className="w-7 h-7 rounded-lg object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[8px] font-semibold text-[#2B2625] truncate block">
                            {selectedProd.title}
                          </span>
                          <span className="text-[8px] font-bold text-[#FD7687]">
                            R$ {selectedProd.promotionalPrice || selectedProd.price}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Trust */}
                    {showTrustBadges && (
                      <div className="flex items-center gap-1 text-[8px] text-white/80 font-medium mb-1">
                        <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                        <span className="truncate max-w-[200px]">
                          {trustBadgeText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action CTA: Click triggers opening animation! */}
                  <div className="relative z-10 w-full flex flex-col gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPreviewOpened(true)}
                      className="w-full py-2 px-3 rounded-full bg-[#FD7687] text-white font-medium text-[11px] shadow-soft flex items-center justify-center gap-1.5 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                    >
                      <span>
                        {buttonText.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu, '').trim() || 'Conhecer o site'}
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Hint */}
            <div className="w-full pt-2 border-t border-white/10 text-center shrink-0">
              <span className="text-[11px] text-white/60">
                Toque no botão para simular a animação de abertura para cima
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
