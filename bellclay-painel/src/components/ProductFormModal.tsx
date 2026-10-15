import React, { useState } from 'react';
import { X, Upload, Plus, Trash2, Scale, Box, DollarSign } from 'lucide-react';
import { Product } from '../types';
import { compressImage } from '../utils/imageCompressor';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => Promise<void>;
  categories: { id: string; name: string; slug: string }[];
}

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
  categories
}) => {
  const isEditing = Boolean(product);

  const [title, setTitle] = useState(product?.title || '');
  const [slug, setSlug] = useState(product?.slug || '');
  const [description, setDescription] = useState(product?.description || '');
  const [category, setCategory] = useState(product?.category || categories[0]?.slug || 'chaveiros');
  const [price, setPrice] = useState(product?.price ? String(product.price) : '29.90');
  const [promotionalPrice, setPromotionalPrice] = useState(product?.promotionalPrice ? String(product.promotionalPrice) : '');
  const [costPrice, setCostPrice] = useState(product?.costPrice ? String(product.costPrice) : '8.00');
  const [stock, setStock] = useState(product?.stock ? String(product.stock) : '10');

  // Shipping specifications
  const [weightGrams, setWeightGrams] = useState(product?.weightKg ? String(Math.round(product.weightKg * 1000)) : '50');
  const [heightCm, setHeightCm] = useState(product?.dimensions?.heightCm ? String(product.dimensions.heightCm) : '4');
  const [widthCm, setWidthCm] = useState(product?.dimensions?.widthCm ? String(product.dimensions.widthCm) : '10');
  const [lengthCm, setLengthCm] = useState(product?.dimensions?.lengthCm ? String(product.dimensions.lengthCm) : '15');

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [featured, setFeatured] = useState(product?.featured || false);
  const [isNew, setIsNew] = useState(product?.isNew || false);
  const [active, setActive] = useState(product?.active !== false);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing) {
      const generatedSlug = val
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleAddImageUrl = () => {
    if (imageUrlInput.trim()) {
      setImages(prev => [...prev, imageUrlInput.trim()]);
      setImageUrlInput('');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1000, 0.82);
        setImages(prev => [...prev, compressedBase64]);
      } catch (err) {
        console.error('Erro na compressão:', err);
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Informe o título da peça.');
      return;
    }
    if (images.length === 0) {
      setError('Adicione pelo menos uma foto do produto.');
      return;
    }

    setIsSaving(true);
    setError(null);

    const parsedPrice = parseFloat(price.replace(',', '.')) || 0;
    const parsedPromo = promotionalPrice ? parseFloat(promotionalPrice.replace(',', '.')) : undefined;
    const parsedCost = parseFloat(costPrice.replace(',', '.')) || 0;
    const parsedWeightKg = (parseFloat(weightGrams) || 50) / 1000;

    const savedItem: Product = {
      id: product?.id || `prod-${Date.now()}`,
      title,
      slug: slug || `artesanato-${Date.now()}`,
      description,
      category,
      price: parsedPrice,
      promotionalPrice: parsedPromo && parsedPromo < parsedPrice ? parsedPromo : undefined,
      costPrice: parsedCost,
      stock: parseInt(stock, 10) || 0,
      images,
      weightKg: parsedWeightKg,
      dimensions: {
        heightCm: parseFloat(heightCm) || 4,
        widthCm: parseFloat(widthCm) || 10,
        lengthCm: parseFloat(lengthCm) || 15
      },
      featured,
      isNew,
      active,
      createdAt: product?.createdAt || new Date().toISOString()
    };

    try {
      await onSave(savedItem);
      onClose();
    } catch (err) {
      setError('Erro ao salvar produto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-brand-border/60 flex items-center justify-between bg-[#FDFBF7]">
          <div>
            <h2 className="font-bold text-lg text-brand-charcoal">
              {isEditing ? 'Editar Peça em Cerâmica Fria' : 'Cadastrar Nova Peça'}
            </h2>
            <p className="text-xs text-brand-muted">
              Preencha os detalhes, fotos e dimensões para o frete automático.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-pink-subtle/50 text-brand-charcoal cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Section: Basic info */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              1. Informações Básicas
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Título da Peça *</label>
                <input
                  type="text"
                  placeholder="Ex: Chaveiro Moranguinho Vitrificado"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Categoria *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Link Amigável (Slug)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2] font-mono text-brand-muted"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Descrição Detalhada</label>
                <textarea
                  rows={3}
                  placeholder="Descreva o processo artesanal, material (cerâmica fria), acabamento com verniz, etc..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                />
              </div>
            </div>
          </div>

          {/* Section: Photos */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              2. Fotos da Peça (Galeria)
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden border border-brand-border bg-[#FAF7F2] group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-md"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[9px] px-2 py-0.5 rounded-md font-bold">
                      Principal
                    </span>
                  )}
                </div>
              ))}

              {/* Upload button */}
              <label className="border-2 border-dashed border-brand-border hover:border-brand-pink rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors bg-[#FAF7F2]/50 hover:bg-brand-pink-light/30">
                <Upload className="w-6 h-6 text-brand-pink mb-1" />
                <span className="text-[11px] font-bold text-brand-charcoal">Enviar Foto</span>
                <span className="text-[9px] text-brand-muted">PNG ou JPG</span>
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* URL Fallback input */}
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Ou cole uma URL direta da imagem (ex: Unsplash / Imgur)"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="flex-1 text-xs px-3.5 py-2 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-4 py-2 rounded-xl bg-brand-charcoal text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
              >
                Adicionar URL
              </button>
            </div>
          </div>

          {/* Section: Price, Cost, Stock */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-brand-green" />
              <span>3. Preço e Estoque</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Preço Venda (R$) *</label>
                <input
                  type="text"
                  placeholder="34,90"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2] font-bold"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Preço Promo (R$)</label>
                <input
                  type="text"
                  placeholder="29,90"
                  value={promotionalPrice}
                  onChange={(e) => setPromotionalPrice(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Custo Estimado (R$)</label>
                <input
                  type="text"
                  placeholder="8,00"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-brand-charcoal mb-1">Estoque Disponível *</label>
                <input
                  type="number"
                  placeholder="10"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section: Weight & Dimensions for Shipping API */}
          <div className="space-y-4 p-4 rounded-2xl bg-[#FFF6F7] border border-brand-pink/20">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-brand-pink" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
                4. Informações de Envio & Frete (Melhor Envio / Correios)
              </h3>
            </div>
            <p className="text-[11px] text-brand-muted">
              Esses dados são usados para calcular o frete exato automaticamente a partir do CEP de origem (87302-060).
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Peso (Gramas)</label>
                <input
                  type="number"
                  placeholder="50"
                  value={weightGrams}
                  onChange={(e) => setWeightGrams(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-pink/30 bg-white focus:border-brand-pink outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Altura (cm)</label>
                <input
                  type="number"
                  placeholder="4"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-pink/30 bg-white focus:border-brand-pink outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Largura (cm)</label>
                <input
                  type="number"
                  placeholder="10"
                  value={widthCm}
                  onChange={(e) => setWidthCm(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-pink/30 bg-white focus:border-brand-pink outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Comprimento (cm)</label>
                <input
                  type="number"
                  placeholder="15"
                  value={lengthCm}
                  onChange={(e) => setLengthCm(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-pink/30 bg-white focus:border-brand-pink outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Section: Badges & Status Switches */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-charcoal">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="rounded-md text-brand-pink focus:ring-brand-pink w-4 h-4"
              />
              <span>Produto Ativo na Loja</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-charcoal">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded-md text-brand-pink focus:ring-brand-pink w-4 h-4"
              />
              <span>Destaque na Página Inicial</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-brand-charcoal">
              <input
                type="checkbox"
                checked={isNew}
                onChange={(e) => setIsNew(e.target.checked)}
                className="rounded-md text-brand-green focus:ring-brand-green w-4 h-4"
              />
              <span>Selo de "Novo" / Lançamento</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-brand-border/60 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-charcoal transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-7 py-2.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft hover:shadow-soft-hover transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Salvando...' : isEditing ? 'Atualizar Peça' : 'Cadastrar Peça'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
