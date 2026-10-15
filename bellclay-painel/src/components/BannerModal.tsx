import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { BannerSlide } from '../types';
import { compressImage } from '../utils/imageCompressor';

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
  if (!isOpen) return null;

  const [title, setTitle] = useState(banner?.title || '');
  const [subtitle, setSubtitle] = useState(banner?.subtitle || '');
  const [badge, setBadge] = useState(banner?.badge || 'Destaque');
  const [imageUrl, setImageUrl] = useState(banner?.imageUrl || '');
  const [buttonText, setButtonText] = useState(banner?.buttonText || 'Ver Coleção');
  const [buttonLink, setButtonLink] = useState(banner?.buttonLink || '#produtos');
  const [active, setActive] = useState(banner?.active !== false);

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
      try {
        const compressedBase64 = await compressImage(file, 1600, 0.82);
        setImageUrl(compressedBase64);
      } catch (err) {
        console.error('Erro na compressão do banner:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <h3 className="font-bold text-base text-brand-charcoal">
            {banner ? 'Editar Slide do Carrossel' : 'Novo Slide do Carrossel'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5 text-brand-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Título do Slide *</label>
            <input
              type="text"
              required
              placeholder="Ex: Coleção Bosque Encantado"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Subtítulo / Descrição</label>
            <textarea
              rows={2}
              placeholder="Ex: Chaveiros e pins exclusivos modelados à mão..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
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
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">Texto do Botão</label>
              <input
                type="text"
                placeholder="Ex: Ver Coleção"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Link do Botão</label>
            <input
              type="text"
              placeholder="Ex: #produtos ou #Chaveiros"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
            />
            <p className="text-[11px] text-brand-muted mt-1 leading-normal">
              Dica: Digite <code className="bg-brand-pink/10 text-brand-pink px-1 py-0.5 rounded font-bold">#nome-da-categoria</code> (ex: <span className="font-semibold text-brand-charcoal">#Chaveiros</span>, <span className="font-semibold text-brand-charcoal">#Bottons</span>, <span className="font-semibold text-brand-charcoal">#Esculturas</span>) para descer a página e já selecionar a categoria automaticamente, ou <code className="bg-brand-pink/10 text-brand-pink px-1 py-0.5 rounded font-bold">#produtos</code> para exibir todas as peças.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Imagem do Banner</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="URL da imagem (ex: Unsplash)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
              <label className="px-3 py-2.5 bg-white border border-brand-border hover:border-brand-pink rounded-xl text-xs font-bold text-brand-charcoal flex items-center gap-1 cursor-pointer">
                <Upload className="w-4 h-4 text-brand-pink" />
                <span>Arquivo</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            {imageUrl && (
              <div className="mt-2 h-24 rounded-xl overflow-hidden border border-brand-border bg-gray-50">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-brand-charcoal pt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded text-brand-pink focus:ring-brand-pink w-4 h-4"
            />
            <span>Slide Ativo no Carrossel</span>
          </label>

          <div className="pt-4 border-t border-brand-border/60 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-charcoal"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft"
            >
              Salvar Slide
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
