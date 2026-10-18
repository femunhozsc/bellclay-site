import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Eye, Box, Scale, Check, AlertCircle, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductsPageProps {
  products: Product[];
  categories: { id: string; name: string; slug: string }[];
  onOpenCreateModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => Promise<void>;
  onToggleActive: (product: Product) => Promise<void>;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  categories,
  onOpenCreateModal,
  onEditProduct,
  onDeleteProduct,
  onToggleActive
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const handleSelectCategory = (slug: string) => {
    setSelectedCat(slug);
    const scrollContainer = document.querySelector('.overflow-y-auto');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filtered = products.filter(p => {
    const matchesCat = selectedCat === 'all' || p.category.toLowerCase() === selectedCat.toLowerCase();
    const matchesSearch =
      searchTerm.trim() === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal">Catálogo de Artesanatos</h2>
          <p className="text-xs text-brand-muted">
            Cadastre e edite suas peças em cerâmica fria com fotos, preços e dados para frete.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft hover:shadow-soft-hover transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar Nova Peça</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar peça por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1">
          <button
            onClick={() => handleSelectCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCat === 'all'
                ? 'bg-brand-charcoal text-white'
                : 'bg-[#FAF7F2] text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            Todas ({products.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelectCategory(c.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCat === c.slug
                  ? 'bg-brand-pink text-white'
                  : 'bg-[#FAF7F2] text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-brand-border/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-brand-border/60 text-brand-muted font-semibold">
              <tr>
                <th className="py-3.5 px-6">Peça / Foto</th>
                <th className="py-3.5 px-4">Categoria</th>
                <th className="py-3.5 px-4">Preço Venda</th>
                <th className="py-3.5 px-4">Estoque</th>
                <th className="py-3.5 px-4">Dados de Frete</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted">
                    Nenhum produto cadastrado com esses filtros.
                  </td>
                </tr>
              ) : (
                filtered.map((product) => {
                  const weightG = Math.round((product.weightKg || 0.05) * 1000);
                  const dims = product.dimensions || { heightCm: 4, widthCm: 10, lengthCm: 15 };

                  return (
                    <tr key={product.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images[0]}
                            alt=""
                            className="w-12 h-12 rounded-xl object-cover bg-[#FAF7F2] border border-brand-border shrink-0"
                          />
                          <div>
                            <span className="font-bold text-brand-charcoal block line-clamp-1">{product.title}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded shadow-2xs">
                                <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                                <span>{(product.rating ?? 5.0).toFixed(1)}</span>
                                <span className="text-amber-800 font-normal">({product.reviewsCount ?? 0})</span>
                              </span>
                              <span className="text-[10px] text-brand-muted truncate max-w-[130px] font-mono">{product.slug}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#FAF7F2] text-brand-charcoal font-semibold border border-brand-border/60 capitalize">
                          {product.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <span className="font-extrabold text-brand-charcoal block">
                            R$ {(product.promotionalPrice || product.price).toFixed(2).replace('.', ',')}
                          </span>
                          {product.promotionalPrice && (
                            <span className="text-[10px] text-brand-muted line-through">
                              R$ {product.price.toFixed(2).replace('.', ',')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`font-bold ${product.stock <= 5 ? 'text-red-500' : 'text-brand-charcoal'}`}>
                          {product.stock} un.
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-brand-muted">
                        <div className="flex flex-col text-[11px]">
                          <span className="flex items-center gap-1 font-semibold text-brand-charcoal">
                            <Scale className="w-3 h-3 text-brand-pink" /> {weightG}g
                          </span>
                          <span className="flex items-center gap-1 text-[10px]">
                            <Box className="w-3 h-3 text-brand-muted" /> {dims.heightCm}x{dims.widthCm}x{dims.lengthCm} cm
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onToggleActive(product)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                            product.active !== false
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {product.active !== false ? 'Ativo na Loja' : 'Pausado'}
                        </button>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-2 rounded-xl hover:bg-brand-pink-light text-brand-charcoal hover:text-brand-pink transition-colors cursor-pointer"
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Excluir a peça "${product.title}"?`)) {
                                onDeleteProduct(product.id);
                              }
                            }}
                            className="p-2 rounded-xl hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors cursor-pointer"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
