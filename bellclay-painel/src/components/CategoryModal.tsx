import React, { useState } from 'react';
import { X, Palette, KeyRound, Smile, Gem, HeartHandshake } from 'lucide-react';
import { CategoryItem } from '../types';

interface CategoryModalProps {
  category: CategoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: CategoryItem) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [iconName, setIconName] = useState(category?.iconName || 'Palette');

  React.useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setDescription(category.description || '');
      setIconName(category.iconName || 'Palette');
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIconName('Palette');
    }
  }, [category, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (!category) {
      setSlug(
        val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: category?.id || `cat-${Date.now()}`,
      name,
      slug: slug || name.toLowerCase(),
      description,
      iconName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <h3 className="font-bold text-base text-brand-charcoal">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5 text-brand-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Nome da Categoria *</label>
            <input
              type="text"
              required
              placeholder="Ex: Esculturas Mágicas"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Slug (Identificador URL)</label>
            <input
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Ícone</label>
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
            >
              <option value="Palette">Palette (Pintura / Artesanato)</option>
              <option value="KeyRound">KeyRound (Chaveiro)</option>
              <option value="Smile">Smile (Rostinhos / Fofura)</option>
              <option value="Gem">Gem (Jóias / Acessórios)</option>
              <option value="HeartHandshake">HeartHandshake (Coleções Especiais)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Descrição</label>
            <textarea
              rows={2}
              placeholder="Ex: Peças especiais modeladas em cerâmica fria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
            />
          </div>

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
              Salvar Categoria
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
