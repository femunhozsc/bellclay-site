import React, { useState } from 'react';
import { Sliders, Palette, Plus, Edit3, Trash2, CheckCircle2, Image, Layers, Megaphone, ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';
import { SiteSettings, BannerSlide, CategoryItem } from '../types';

interface CustomizerPageProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
  onOpenBannerModal: (banner?: BannerSlide) => void;
  onOpenCategoryModal: (category?: CategoryItem) => void;
  onDeleteBanner: (id: string) => void;
  onDeleteCategory: (id: string) => void;
}

export const CustomizerPage: React.FC<CustomizerPageProps> = ({
  settings,
  onSaveSettings,
  onOpenBannerModal,
  onOpenCategoryModal,
  onDeleteBanner,
  onDeleteCategory
}) => {
  const [welcomeTitle, setWelcomeTitle] = useState(settings.welcomeTitle);
  const [welcomeSubtitle, setWelcomeSubtitle] = useState(settings.welcomeSubtitle);
  const [announcementText, setAnnouncementText] = useState(settings.announcementText);
  const [announcementActive, setAnnouncementActive] = useState(settings.announcementActive);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(settings.freeShippingThreshold));

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleMoveBanner = async (currentIndex: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= settings.banners.length) return;

    const newBanners = [...settings.banners];
    const item = newBanners.splice(currentIndex, 1)[0];
    newBanners.splice(targetIndex, 0, item);

    setIsSaving(true);
    try {
      await onSaveSettings({
        ...settings,
        banners: newBanners
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeBannerPosition = async (currentIndex: number, newPosition: number) => {
    if (newPosition < 0 || newPosition >= settings.banners.length || newPosition === currentIndex) return;

    const newBanners = [...settings.banners];
    const item = newBanners.splice(currentIndex, 1)[0];
    newBanners.splice(newPosition, 0, item);

    setIsSaving(true);
    try {
      await onSaveSettings({
        ...settings,
        banners: newBanners
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTextChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated: SiteSettings = {
        ...settings,
        welcomeTitle,
        welcomeSubtitle,
        announcementText,
        announcementActive,
        freeShippingThreshold: parseFloat(freeShippingThreshold) || 149
      };
      await onSaveSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal">Personalizar Loja Online</h2>
          <p className="text-xs text-brand-muted">
            Edite o carrossel, títulos de boas-vindas, barra de anúncios e categorias em tempo real.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Alterações salvas e sincronizadas!</span>
          </div>
        )}
      </div>

      {/* Section 1: Welcome Header & Announcement Bar */}
      <form onSubmit={handleSaveTextChanges} className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-brand-border/60">
          <Palette className="w-5 h-5 text-brand-pink" />
          <h3 className="font-bold text-sm text-brand-charcoal">
            Títulos de Boas-Vindas da Página Inicial
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              Título Principal de Boas-Vindas *
            </label>
            <input
              type="text"
              required
              value={welcomeTitle}
              onChange={(e) => setWelcomeTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              Subtítulo / Mensagem do Ateliê *
            </label>
            <textarea
              rows={2}
              required
              value={welcomeSubtitle}
              onChange={(e) => setWelcomeSubtitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
            />
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="pt-4 border-t border-brand-border/60 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-green" />
              <h4 className="font-bold text-xs text-brand-charcoal">Barra Superior de Aviso / Promoção</h4>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={announcementActive}
                onChange={(e) => setAnnouncementActive(e.target.checked)}
                className="rounded text-brand-pink focus:ring-brand-pink w-4 h-4"
              />
              <span>Exibir barra no topo do site</span>
            </label>
          </div>

          <input
            type="text"
            placeholder="Ex: ✨ Frete Grátis para todo o Paraná acima de R$ 149..."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-full bg-brand-charcoal hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            {isSaving ? 'Salvando...' : 'Salvar Textos & Avisos'}
          </button>
        </div>
      </form>

      {/* Section 2: Carousel & Banners */}
      <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/60">
          <div className="flex items-center gap-2">
            <Image className="w-5 h-5 text-brand-pink" />
            <div>
              <h3 className="font-bold text-sm text-brand-charcoal">Banners do Carrossel Inicial</h3>
              <p className="text-xs text-brand-muted">Adicione, reordene (mude a ordem de exibição) ou edite os slides</p>
            </div>
          </div>

          <button
            onClick={() => onOpenBannerModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-pink-light text-brand-pink hover:bg-brand-pink hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Novo Slide</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {settings.banners.map((banner, idx) => (
            <div key={banner.id} className="rounded-2xl border border-brand-border overflow-hidden bg-[#FAF8F5] flex flex-col justify-between">
              <div className="relative aspect-video bg-gray-100">
                <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-bold shadow-xs">
                  Slide {idx + 1} de {settings.banners.length}
                </span>
                {banner.active && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-brand-green text-white text-[10px] font-bold shadow-xs">
                    Ativo
                  </span>
                )}
              </div>

              {/* Order / Position Controls Bar */}
              <div className="px-3.5 py-2 bg-[#F3EDE2] border-b border-brand-border/60 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold text-brand-charcoal flex items-center gap-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-brand-pink" />
                  <span>Ordem:</span>
                </span>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMoveBanner(idx, 'left')}
                    disabled={idx === 0 || isSaving}
                    className="p-1 rounded-md bg-white border border-brand-border hover:bg-brand-pink hover:text-white hover:border-transparent text-brand-charcoal transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs"
                    title="Mover para trás (exibir antes)"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <select
                    value={idx}
                    onChange={(e) => handleChangeBannerPosition(idx, Number(e.target.value))}
                    disabled={isSaving}
                    className="bg-white border border-brand-border rounded-md px-1.5 py-0.5 text-[11px] font-bold text-brand-charcoal cursor-pointer outline-none shadow-2xs"
                    title="Mudar posição na fila de slides"
                  >
                    {settings.banners.map((_, i) => (
                      <option key={i} value={i}>
                        {i + 1}º lugar
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => handleMoveBanner(idx, 'right')}
                    disabled={idx === settings.banners.length - 1 || isSaving}
                    className="p-1 rounded-md bg-white border border-brand-border hover:bg-brand-pink hover:text-white hover:border-transparent text-brand-charcoal transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer shadow-2xs"
                    title="Mover para frente (exibir depois)"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-brand-pink uppercase tracking-wide block">{banner.badge}</span>
                  <h4 className="font-bold text-xs text-brand-charcoal line-clamp-1 mt-0.5">{banner.title}</h4>
                  <p className="text-[11px] text-brand-muted line-clamp-2 mt-1">{banner.subtitle}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-brand-border/60 flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-[10px] text-brand-charcoal font-bold truncate">{banner.buttonText || 'Ver Coleção'}</span>
                    <span className="text-[9px] text-brand-pink font-mono truncate" title={banner.buttonLink || '#produtos'}>
                      {banner.buttonLink || '#produtos'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenBannerModal(banner)}
                      className="p-1.5 rounded-lg hover:bg-white text-brand-charcoal cursor-pointer"
                      title="Editar"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {settings.banners.length > 1 && (
                      <button
                        onClick={() => onDeleteBanner(banner.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Categories Management */}
      <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-brand-border/60">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-green" />
            <div>
              <h3 className="font-bold text-sm text-brand-charcoal">Categorias da Loja</h3>
              <p className="text-xs text-brand-muted">Defina as seções de artesanato (chaveiros, bottons, etc.)</p>
            </div>
          </div>

          <button
            onClick={() => onOpenCategoryModal()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-green-subtle text-brand-green hover:bg-brand-green hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nova Categoria</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
          {settings.categories.map((cat) => (
            <div key={cat.id} className="p-4 rounded-2xl border border-brand-border bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-brand-charcoal block">{cat.name}</span>
                <span className="text-[10px] text-brand-muted font-mono">{cat.slug} • {cat.iconName}</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onOpenCategoryModal(cat)}
                  className="p-1.5 rounded-lg hover:bg-white text-brand-charcoal cursor-pointer"
                  title="Editar"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                {settings.categories.length > 1 && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
