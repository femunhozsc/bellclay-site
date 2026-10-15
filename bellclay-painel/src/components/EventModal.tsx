import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Star, Calendar, MapPin, Sparkles } from 'lucide-react';
import { BellclayEvent } from '../types';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../services/cloudinaryService';

interface EventModalProps {
  event: BellclayEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: BellclayEvent) => Promise<void> | void;
}

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
};

export const EventModal: React.FC<EventModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState(event?.title || '');
  const [slug, setSlug] = useState(event?.slug || '');
  const [subtitle, setSubtitle] = useState(event?.subtitle || '');
  const [badge, setBadge] = useState(event?.badge || 'Edição Especial');
  const [dateText, setDateText] = useState(event?.dateText || '');
  const [locationText, setLocationText] = useState(event?.locationText || 'Campo Mourão, PR');
  const [buttonText, setButtonText] = useState(event?.buttonText || 'Ver Fotos e Detalhes');
  const [coverImage, setCoverImage] = useState(event?.coverImage || '');
  const [images, setImages] = useState<string[]>(event?.images || []);
  const [description, setDescription] = useState(event?.description || '');
  const [active, setActive] = useState(event?.active !== false);

  const [newImageUrl, setNewImageUrl] = useState('');
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Auto-generate slug when title changes if slug is empty or matches previous slug
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(val));
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingFiles(true);
      try {
        const cloudUrl = await uploadToCloudinary(file, 'bellclay/eventos');
        setCoverImage(cloudUrl);
        if (!images.includes(cloudUrl)) {
          setImages(prev => [cloudUrl, ...prev]);
        }
      } catch (err: any) {
        console.error('Erro ao enviar foto de capa para o Cloudinary:', err);
        setSaveError(err.message || 'Erro ao enviar foto de capa para o Cloudinary.');
      } finally {
        setIsProcessingFiles(false);
        e.target.value = '';
      }
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFiles(true);
    try {
      const cloudUrls = await uploadMultipleToCloudinary(files, 'bellclay/eventos');
      setImages(prev => [...prev, ...cloudUrls]);
      if (!coverImage && cloudUrls.length > 0) {
        setCoverImage(cloudUrls[0]);
      }
    } catch (err: any) {
      console.error('Erro ao adicionar imagens para o Cloudinary:', err);
      setSaveError(err.message || 'Erro ao enviar fotos para o Cloudinary.');
    } finally {
      setIsProcessingFiles(false);
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    setImages(prev => [...prev, url]);
    if (!coverImage) {
      setCoverImage(url);
    }
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedImg = images[indexToRemove];
    const newImgs = images.filter((_, i) => i !== indexToRemove);
    setImages(newImgs);
    if (coverImage === removedImg) {
      setCoverImage(newImgs[0] || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSaveError('Por favor informe o nome do evento.');
      return;
    }

    const finalSlug = slugify(slug || title || `evento-${Date.now()}`);
    const finalCover = coverImage || images[0] || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1200&q=80';
    const finalImages = images.length > 0 ? images : [finalCover];

    setIsSaving(true);
    setSaveError(null);
    try {
      await onSave({
        id: event?.id || `event-${Date.now()}`,
        slug: finalSlug,
        title: title.trim(),
        subtitle: subtitle.trim(),
        badge: badge.trim(),
        dateText: dateText.trim(),
        locationText: locationText.trim(),
        buttonText: buttonText.trim() || 'Ver Fotos e Detalhes',
        coverImage: finalCover,
        images: finalImages,
        description: description.trim(),
        active
      });
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar evento:', err);
      setSaveError('Erro ao salvar evento no banco de dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-border/60 bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-pink-light flex items-center justify-center text-brand-pink">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-charcoal">
                {event ? 'Editar Evento Bellclay' : 'Novo Evento Bellclay'}
              </h3>
              <p className="text-xs text-brand-muted">
                Adicione fotos, carrossel de memórias, data, local e história completa do evento.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5 text-brand-muted" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Status & Badge */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/80">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded text-brand-pink focus:ring-brand-pink w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-bold text-brand-charcoal">Evento Ativo (Visível no site e carrossel)</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-brand-muted">Etiqueta:</span>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Ex: Bazar Presencial, Lançamento"
                className="text-xs px-3 py-1.5 rounded-lg border border-brand-border bg-white outline-hidden focus:border-brand-pink font-semibold"
              />
            </div>
          </div>

          {/* Titles & Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-brand-charcoal mb-1">Nome do Evento *</label>
              <input
                type="text"
                required
                placeholder="Ex: Bazar das Flores de Primavera"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">Link amigável (Slug da página)</label>
              <div className="flex items-center rounded-xl border border-brand-border bg-[#FAF7F2] px-3.5 py-2.5 text-xs text-brand-muted">
                <span className="select-none">/evento/</span>
                <input
                  type="text"
                  required
                  placeholder="bazar-flores-primavera"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="w-full bg-transparent outline-hidden text-brand-charcoal font-semibold ml-0.5"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">Texto do Botão no Carrossel</label>
              <input
                type="text"
                placeholder="Ex: Ver Fotos e Detalhes"
                value={buttonText}
                onChange={(e) => setButtonText(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brand-pink" />
                <span>Data / Período</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 14 e 15 de Outubro de 2024"
                value={dateText}
                onChange={(e) => setDateText(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-brand-green" />
                <span>Localização</span>
              </label>
              <input
                type="text"
                placeholder="Ex: Praça Central - Campo Mourão, PR"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>
          </div>

          {/* Subtitle / Teaser */}
          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              Subtítulo do Carrossel (Resumo curto que aparece no slide da Home) *
            </label>
            <textarea
              rows={2}
              required
              placeholder="Ex: Nosso stand especial com peças modeladas à mão, novidades da primavera e um dia inesquecível com nossos clientes..."
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
            />
          </div>

          {/* Detailed Description */}
          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              Descrição Completa do Evento (Exibida na página interna do evento) *
            </label>
            <textarea
              rows={5}
              required
              placeholder="Conte toda a experiência do evento! Como foi o espaço, quais peças foram levadas, o carinho do público, oficinas realizadas, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink leading-relaxed"
            />
          </div>

          {/* Cover Photo */}
          <div className="space-y-2 p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/80">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal">
                  Foto de Capa Principal (Banner do Carrossel da Home) *
                </label>
                <p className="text-[11px] text-brand-muted">
                  Esta foto será usada no carrossel da tela inicial e como capa do evento.
                </p>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-brand-border hover:bg-brand-pink hover:text-white text-xs font-bold transition-all shadow-2xs">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Capa</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Ou cole a URL da foto de capa (https://...)"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-brand-border bg-white outline-hidden focus:border-brand-pink"
              />
              {coverImage && (
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-brand-border shrink-0 bg-gray-100">
                  <img src={coverImage} alt="Capa" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Gallery Photos (All Photos for Event Page Carousel) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal">
                  Galeria de Fotos do Evento ({images.length} {images.length === 1 ? 'foto' : 'fotos'})
                </label>
                <p className="text-[11px] text-brand-muted">
                  Todas as fotos aparecerão em carrossel na página exclusiva deste evento.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-brand-pink text-white hover:bg-pink-600 text-xs font-bold transition-all shadow-xs">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isProcessingFiles ? 'Carregando...' : '+ Subir Fotos (Várias)'}</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    disabled={isProcessingFiles}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Add via URL */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adicionar foto por URL (https://...)"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-2 rounded-xl bg-brand-charcoal text-white text-xs font-bold hover:bg-black cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Image Grid / Thumbnails */}
            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-2">
                {images.map((img, idx) => {
                  const isCover = img === coverImage;
                  return (
                    <div
                      key={idx}
                      className={`group relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                        isCover ? 'border-brand-pink shadow-md ring-2 ring-brand-pink/20' : 'border-brand-border/70 hover:border-brand-charcoal'
                      }`}
                    >
                      <img src={img} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover" />

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-brand-pink text-white text-[9px] font-bold flex items-center gap-1 shadow-xs">
                          <Star className="w-2.5 h-2.5 fill-current" /> Capa
                        </span>
                      )}

                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="p-1 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer shadow-xs"
                            title="Remover foto"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => setCoverImage(img)}
                            className="w-full py-1 rounded-md bg-white/90 hover:bg-white text-brand-charcoal text-[10px] font-bold transition-colors cursor-pointer shadow-xs text-center"
                          >
                            Tornar Capa
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-brand-border text-center bg-[#FAF8F5]">
                <p className="text-xs text-brand-muted">
                  Nenhuma foto na galeria ainda. Clique em <strong>"+ Subir Fotos"</strong> ou adicione uma URL acima.
                </p>
              </div>
            )}
          </div>
        </form>

        {/* Modal Footer */}
        <div className="p-4 border-t border-brand-border/60 bg-[#FAF8F5] flex flex-col sm:flex-row items-center justify-between gap-3">
          {saveError ? (
            <span className="text-xs text-red-600 font-semibold">{saveError}</span>
          ) : (
            <span className="text-[11px] text-brand-muted">
              {isProcessingFiles ? 'Processando fotos em alta definição...' : 'Todas as fotos são otimizadas automaticamente em HD.'}
            </span>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-full border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-white cursor-pointer transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving || isProcessingFiles}
              className="px-6 py-2.5 rounded-full bg-brand-pink hover:bg-pink-600 text-white text-xs font-bold shadow-md cursor-pointer transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? 'Salvando Evento...' : (event ? 'Salvar Alterações' : 'Criar Evento')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
