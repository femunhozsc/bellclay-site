import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Eye,
  MousePointerClick,
  TrendingUp,
  Edit2,
  Trash2,
  Sparkles,
  Smartphone,
  Share2,
  Tag,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { AdCampaign, Product } from '../types';

interface CampaignsPageProps {
  campaigns: AdCampaign[];
  products: Product[];
  onOpenCreateModal: () => void;
  onEditCampaign: (campaign: AdCampaign) => void;
  onDeleteCampaign: (campaignId: string) => void;
  onToggleActive: (campaign: AdCampaign) => void;
}

export const CampaignsPage: React.FC<CampaignsPageProps> = ({
  campaigns,
  products,
  onOpenCreateModal,
  onEditCampaign,
  onDeleteCampaign,
  onToggleActive
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // UTM Generator Modal / Popover state
  const [utmCampaign, setUtmCampaign] = useState<AdCampaign | null>(null);
  const [utmSource, setUtmSource] = useState('instagram');
  const [utmMedium, setUtmMedium] = useState('stories');

  // Metrics summary
  const totalCampaigns = campaigns.length;
  const totalViews = campaigns.reduce((acc, c) => acc + (c.viewsCount || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
  const overallRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0';

  // Base URL calculation (uses current host or store default)
  const getStoreUrl = (slug: string, utmQuery = '') => {
    // If running in development on port 5174 (painel), target store port 5173
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isDev ? 'http://localhost:5173' : 'https://bellclayart.vercel.app';
    return `${baseUrl}/lp/${slug}${utmQuery ? `?${utmQuery}` : ''}`;
  };

  const handleCopyLink = (campaignId: string, url: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(campaignId);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const filteredCampaigns = campaigns.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.headline.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'active') return matchesSearch && c.active !== false;
    if (statusFilter === 'inactive') return matchesSearch && c.active === false;
    return matchesSearch;
  });

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-brand-border/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-muted block">Telas de Anúncios</span>
            <span className="text-2xl font-extrabold text-brand-charcoal mt-0.5 block">
              {totalCampaigns}
            </span>
            <span className="text-[11px] text-brand-muted block mt-0.5">Links personalizados</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-pink-light flex items-center justify-center text-brand-pink">
            <Megaphone className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-muted block">Visualizações Totais</span>
            <span className="text-2xl font-extrabold text-brand-charcoal mt-0.5 block">
              {totalViews}
            </span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
              Impactos de anúncios
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Eye className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-muted block">Cliques "Conhecer o site"</span>
            <span className="text-2xl font-extrabold text-brand-charcoal mt-0.5 block">
              {totalClicks}
            </span>
            <span className="text-[11px] text-brand-pink font-bold block mt-0.5">
              Aberturas para o site
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-brand-pink-light flex items-center justify-center text-brand-pink">
            <MousePointerClick className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-brand-border/70 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-brand-muted block">Taxa de Abertura</span>
            <span className="text-2xl font-extrabold text-brand-charcoal mt-0.5 block">
              {overallRate}%
            </span>
            <span className="text-[11px] text-brand-muted block mt-0.5">
              Conversão da tela de anúncio
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search & Filters */}
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, slug ou título do anúncio..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-brand-border bg-[#FAF8F5] text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-pink/30 font-medium"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-2xl border border-brand-border/60 shrink-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-brand-charcoal shadow-xs'
                  : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-brand-muted hover:text-emerald-600'
              }`}
            >
              Ativas
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'inactive'
                  ? 'bg-white text-brand-muted shadow-xs'
                  : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              Pausadas
            </button>
          </div>
        </div>

        {/* Create Campaign CTA Button */}
        <button
          onClick={onOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-brand-pink hover:bg-brand-pink/90 text-white text-xs font-bold transition-all shadow-pink-soft flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Tela de Anúncio</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-brand-border/70 p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-brand-pink-light flex items-center justify-center text-brand-pink mx-auto mb-4">
            <Megaphone className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-brand-charcoal mb-1">
            Nenhuma tela de anúncio encontrada
          </h3>
          <p className="text-xs text-brand-muted leading-relaxed mb-6">
            Crie links personalizados com fotos de capa, histórias acolhedoras e um botão de abertura para cima para compartilhar nos seus anúncios do Instagram, TikTok e Facebook.
          </p>
          <button
            onClick={onOpenCreateModal}
            className="px-5 py-2.5 rounded-2xl bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink/90 transition-all shadow-pink-soft cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Primeira Tela de Anúncio</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCampaigns.map(camp => {
            const rawRate =
              camp.viewsCount && camp.viewsCount > 0
                ? (((camp.clicksCount || 0) / camp.viewsCount) * 100).toFixed(1)
                : '0';

            const publicUrl = getStoreUrl(camp.slug);

            return (
              <div
                key={camp.id}
                className="bg-white rounded-3xl border border-brand-border/70 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                {/* Banner Thumbnail & Status Badge */}
                <div className="relative h-44 overflow-hidden bg-brand-charcoal">
                  <img
                    src={camp.bannerUrl}
                    alt={camp.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30" />

                  {/* Top Bar with Status & Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          camp.active !== false ? 'bg-emerald-400 animate-pulse' : 'bg-gray-400'
                        }`}
                      />
                      <span>{camp.active !== false ? 'Ativa' : 'Pausada'}</span>
                    </span>

                    {camp.badgeText && (
                      <span className="px-2.5 py-1 rounded-full bg-brand-pink/90 backdrop-blur-md text-white text-[10px] font-bold shadow-xs">
                        {camp.badgeText}
                      </span>
                    )}
                  </div>

                  {/* Bottom of Banner: Title & Slug */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="font-extrabold text-sm text-white drop-shadow-md truncate">
                      {camp.name}
                    </h4>
                    <p className="text-[11px] text-white/80 font-mono drop-shadow-xs truncate">
                      /lp/{camp.slug}
                    </p>
                  </div>
                </div>

                {/* Campaign Body Details */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs text-brand-charcoal line-clamp-1">
                      "{camp.headline}"
                    </h5>
                    <p className="text-[11px] text-brand-muted line-clamp-2">
                      {camp.subtitle}
                    </p>

                    {/* Features Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {camp.showCoupon && camp.couponCode && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                          <Tag className="w-2.5 h-2.5" />
                          Cupom: {camp.couponCode}
                        </span>
                      )}
                      {camp.showFeaturedProduct && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                          <Sparkles className="w-2.5 h-2.5" />
                          Produto em Destaque
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                        Destino: {camp.targetUrl === '/' ? 'Home' : camp.targetUrl}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-2xl bg-[#FAF8F5] border border-brand-border/60 text-center">
                    <div>
                      <span className="text-[10px] text-brand-muted block">Visualizações</span>
                      <span className="text-xs font-extrabold text-brand-charcoal">
                        {camp.viewsCount || 0}
                      </span>
                    </div>
                    <div className="border-x border-brand-border/60">
                      <span className="text-[10px] text-brand-muted block">Cliques</span>
                      <span className="text-xs font-extrabold text-brand-pink">
                        {camp.clicksCount || 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-brand-muted block">Taxa</span>
                      <span className="text-xs font-extrabold text-emerald-600">
                        {rawRate}%
                      </span>
                    </div>
                  </div>

                  {/* Quick Copy Link & Actions */}
                  <div className="space-y-2 pt-1 border-t border-brand-border/60">
                    {/* Share / Copy URL Pill */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleCopyLink(camp.id, publicUrl)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-brand-pink-light/40 text-brand-charcoal text-xs font-bold transition-all border border-brand-border/70 flex items-center justify-between cursor-pointer group/copy"
                      >
                        <span className="truncate text-[11px] font-mono text-brand-pink mr-1">
                          /lp/{camp.slug}
                        </span>
                        {copiedId === camp.id ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold shrink-0">
                            <Check className="w-3.5 h-3.5" />
                            <span>Copiado!</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-brand-muted group-hover/copy:text-brand-pink shrink-0">
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copiar</span>
                          </span>
                        )}
                      </button>

                      {/* UTM Generator Button */}
                      <button
                        onClick={() => setUtmCampaign(camp)}
                        className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-white text-brand-charcoal border border-brand-border/70 hover:border-brand-pink text-xs font-bold transition-all cursor-pointer"
                        title="Gerador de Link com UTM para Anúncios"
                      >
                        <Share2 className="w-4 h-4 text-brand-muted hover:text-brand-pink" />
                      </button>

                      {/* Open in Store in New Tab */}
                      <a
                        href={publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#FAF8F5] hover:bg-white text-brand-charcoal border border-brand-border/70 hover:border-brand-pink text-xs font-bold transition-all cursor-pointer"
                        title="Abrir Tela no Navegador"
                      >
                        <ExternalLink className="w-4 h-4 text-brand-muted hover:text-brand-pink" />
                      </a>
                    </div>

                    {/* Manage Buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={() => onToggleActive(camp)}
                        className={`text-[11px] font-bold cursor-pointer transition-colors ${
                          camp.active !== false
                            ? 'text-brand-muted hover:text-amber-600'
                            : 'text-emerald-600 hover:text-emerald-700'
                        }`}
                      >
                        {camp.active !== false ? 'Pausar Campanha' : 'Ativar Campanha'}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onEditCampaign(camp)}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-brand-charcoal hover:bg-black/5 transition-all cursor-pointer"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja excluir a tela "${camp.name}"?`)) {
                              onDeleteCampaign(camp.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-brand-muted hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* UTM Link Generator Modal */}
      {utmCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-brand-charcoal/50 backdrop-blur-xs" onClick={() => setUtmCampaign(null)} />

          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-pink-light flex items-center justify-center text-brand-pink">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-brand-charcoal">
                    Gerador de Link de Anúncio com UTM
                  </h4>
                  <p className="text-[11px] text-brand-muted">
                    Rastreie exatamente de onde vêm as pessoas que clicam no seu anúncio
                  </p>
                </div>
              </div>
              <button
                onClick={() => setUtmCampaign(null)}
                className="p-1.5 rounded-xl text-brand-muted hover:text-brand-charcoal cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Platform Quick Selection */}
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-2">
                Onde você vai veicular esse anúncio?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setUtmSource('instagram');
                    setUtmMedium('stories');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    utmSource === 'instagram' && utmMedium === 'stories'
                      ? 'border-brand-pink bg-brand-pink-light/40 text-brand-pink'
                      : 'border-brand-border bg-[#FAF8F5] text-brand-charcoal hover:bg-white'
                  }`}
                >
                  📸 Insta Stories
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUtmSource('instagram');
                    setUtmMedium('reels');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    utmSource === 'instagram' && utmMedium === 'reels'
                      ? 'border-brand-pink bg-brand-pink-light/40 text-brand-pink'
                      : 'border-brand-border bg-[#FAF8F5] text-brand-charcoal hover:bg-white'
                  }`}
                >
                  🎬 Insta Reels
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUtmSource('tiktok');
                    setUtmMedium('ad');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    utmSource === 'tiktok'
                      ? 'border-brand-pink bg-brand-pink-light/40 text-brand-pink'
                      : 'border-brand-border bg-[#FAF8F5] text-brand-charcoal hover:bg-white'
                  }`}
                >
                  🎵 TikTok Ad
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUtmSource('facebook');
                    setUtmMedium('feed');
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    utmSource === 'facebook'
                      ? 'border-brand-pink bg-brand-pink-light/40 text-brand-pink'
                      : 'border-brand-border bg-[#FAF8F5] text-brand-charcoal hover:bg-white'
                  }`}
                >
                  📘 Facebook
                </button>
              </div>
            </div>

            {/* Generated Link Display */}
            {(() => {
              const fullUtmUrl = getStoreUrl(
                utmCampaign.slug,
                `utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign.slug}`
              );

              return (
                <div className="space-y-3 pt-2">
                  <label className="block text-xs font-bold text-brand-charcoal">
                    Link Pronto para o Anúncio:
                  </label>
                  <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-brand-border font-mono text-xs text-brand-charcoal break-all select-all">
                    {fullUtmUrl}
                  </div>

                  <button
                    onClick={() => handleCopyLink('utm-modal', fullUtmUrl)}
                    className="w-full py-3 rounded-2xl bg-brand-pink text-white font-bold text-xs hover:bg-brand-pink/90 transition-all flex items-center justify-center gap-2 shadow-pink-soft cursor-pointer"
                  >
                    {copiedId === 'utm-modal' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Link de Anúncio Copiado com Sucesso!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar Link com Rastreamento UTM</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
