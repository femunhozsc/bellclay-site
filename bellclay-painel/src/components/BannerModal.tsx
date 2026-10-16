import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import { BannerSlide } from '../types';
import { uploadToCloudinary } from '../services/cloudinaryService';

interface BannerModalProps {
  banner: BannerSlide | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (banner: BannerSlide) => void;
}

export const BannerModal: React.FC<BannerModalProps> = ({
  banner,
  isOpen,
  onClose,
  onSave
}) => {
  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [badge, setBadge] = useState(banner?.badge || 'Destaque');
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '');
  const [buttonText, setButtonText] = useState(banner?.buttonText || 'Ver Coleção');
  const [buttonLink, setButtonLink] = useState(banner?.buttonLink || '#produtos');
  const [active, setActive] = useState(banner?.active !== false);
  const [isUploading, setIsUploading] = useState(false);

  React.useEffect(() => {
    if (banner) {
      setTitle(banner.title || '');
      setSubtitle(banner.subtitle || '');
      setBadge(banner.badge || 'Destaque');
      setImageUrl(banner.imageUrl || '');
      setButtonText(banner.buttonText || 'Ver Coleção');
      setButtonLink(banner.buttonLink || '#produtos');
      setActive(banner.active !== false);
    } else {
      setTitle('');
      setSubtitle('');
      setBadge('Destaque');
      setImageUrl('');
      setButtonText('Ver Coleção');
      setButtonLink('#produtos');
      setActive(true);
    }
  }, [banner, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: banner?.id || `banner-${Date.now()}`,
      title,
      subtitle,
      badge,
      imageUrl,
      buttonText,
      buttonLink,
      active
    });
    onClose();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const cloudUrl = await uploadToCloudinary(file, 'bellclay/banners');
        setImageUrl(cloudUrl);
      } catch (err) {
        console.error('Erro no upload do banner para o Cloudinary:', err);
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      <div className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 max-h-[88vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-brand-border/60 bg-[#FAF8F5] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-pink-light flex items-center justify-center text-brand-pink">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-brand-charcoal">
                {banner ? 'Editar Slide do Carrossel' : 'Novo Slide do Carrossel'}
              </h3>
              <p className="text-[11px] text-brand-muted">
                Configure os textos, botões e imagem do banner principal da loja
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-gray-100 text-brand-muted hover:text-brand-charcoal cursor-pointer transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body with 2-Column Wide Layout */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
            
            {/* Left Column: Text & Navigation Controls (7 cols) */}
            <div className="md:col-span-7 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Título do Slide *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Coleção Bosque Encantado"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Subtítulo / Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Chaveiros e pins exclusivos modelados à mão..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">Etiqueta (Badge)</label>
                  <input
                    type="text"
                    placeholder="Ex: Lançamento"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">Texto do Botão</label>
                  <input
                    type="text"
                    placeholder="Ex: Ver Coleção"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Link do Botão</label>
                <input
                  type="text"
                  placeholder="Ex: #evento, #produtos ou #Chaveiros"
                  value={buttonLink}
                  onChange={(e) => setButtonLink(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink transition-colors"
                />
                <p className="text-[10.5px] text-brand-muted mt-1 leading-snug">
                  Dica: <code className="bg-brand-pink/10 text-brand-pink px-1 py-0.5 rounded font-bold">#evento</code> vai aos eventos, <code className="bg-brand-pink/10 text-brand-pink px-1 py-0.5 rounded font-bold">#Categoria</code> filtra a categoria, ou <code className="bg-brand-pink/10 text-brand-pink px-1 py-0.5 rounded font-bold">#produtos</code> vai ao catálogo.
                </p>
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-2.5 text-xs font-bold text-brand-charcoal cursor-pointer p-2.5 rounded-xl bg-[#FAF8F5] border border-brand-border/60 hover:border-brand-pink/40 transition-colors w-full">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-brand-pink focus:ring-brand-pink w-4 h-4 cursor-pointer"
                  />
                  <span>Slide Ativo no Carrossel da Loja</span>
                </label>
              </div>
            </div>

            {/* Right Column: Image Upload & Visual Preview (5 cols) */}
            <div className="md:col-span-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-brand-charcoal">Imagem do Banner *</label>
                  <span className="text-[10px] font-semibold text-brand-pink bg-brand-pink-subtle px-2 py-0.5 rounded-full border border-brand-pink/20">
                    Proporção no celular: 2:3
                  </span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="URL da imagem"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink transition-colors"
                  />
                  <label className={`px-3 py-2.5 bg-white border border-brand-border hover:border-brand-pink rounded-xl text-xs font-bold text-brand-charcoal flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${isUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                    {isUploading ? (
                      <div className="w-4 h-4 border-2 border-brand-pink border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 text-brand-pink" />
                    )}
                    <span>{isUploading ? 'Enviando...' : 'Upload'}</span>
                    <input type="file" accept="image/*" disabled={isUploading} onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Live Preview Container */}
              <div className="flex-1 flex flex-col min-h-[170px] max-h-[240px] rounded-2xl overflow-hidden border border-brand-border bg-[#FAF7F2] relative shadow-2xs">
                {imageUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                    <img src={imageUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-left text-white">
                      {badge && (
                        <span className="inline-block px-2 py-0.5 rounded-full bg-brand-pink text-[9px] font-bold uppercase tracking-wider mb-1 shadow-xs">
                          {badge}
                        </span>
                      )}
                      <p className="text-xs font-bold truncate drop-shadow-sm">{title || 'Título do banner'}</p>
                      {subtitle && <p className="text-[10.5px] text-white/80 truncate drop-shadow-xs">{subtitle}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-brand-muted space-y-1.5">
                    <Upload className="w-7 h-7 text-brand-muted/50" />
                    <span className="text-xs font-semibold text-brand-charcoal">Nenhuma imagem selecionada</span>
                    <span className="text-[11px] text-brand-muted/80">Insira uma URL ou envie um arquivo para pré-visualizar</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Fixed Footer Buttons */}
          <div className="px-6 py-3.5 border-t border-brand-border/60 bg-[#FAF8F5] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-charcoal transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft transition-all cursor-pointer"
            >
              Salvar Slide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
