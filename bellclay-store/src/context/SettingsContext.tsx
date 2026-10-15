import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings, Product } from '../types';
import { getSiteSettings, getProducts } from '../services/firebase';
import { DEFAULT_SETTINGS, DEFAULT_PRODUCTS } from '../data/defaultData';

interface SettingsContextType {
  settings: SiteSettings;
  products: Product[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  filteredProducts: Product[];
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [fetchedSettings, fetchedProducts] = await Promise.all([
        getSiteSettings(),
        getProducts()
      ]);
      setSettings(fetchedSettings);
      setProducts(fetchedProducts);
    } catch (err) {
      console.warn('Usando dados padrão:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Listen to local storage changes or window events for real-time preview sync
    const handleStorageChange = () => {
      refreshData();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bellclay_settings_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bellclay_settings_updated', handleStorageChange);
    };
  }, []);

  const filteredProducts = products.filter(product => {
    const normalize = (str: string) =>
      (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();

    const cleanQuery = normalize(searchQuery);

    if (cleanQuery) {
      // When searching, match across title, description, category, and tags
      const matchesTitle = normalize(product.title).includes(cleanQuery);
      const matchesDesc = normalize(product.description).includes(cleanQuery);
      const matchesCategory = normalize(product.category).includes(cleanQuery);
      const matchesTags = product.tags?.some(tag => normalize(tag).includes(cleanQuery));

      return matchesTitle || matchesDesc || matchesCategory || matchesTags;
    }

    // When not searching, filter by category
    if (selectedCategory === 'all') return true;

    const activeCat = settings.categories.find(
      c => normalize(c.slug) === normalize(selectedCategory) || normalize(c.name) === normalize(selectedCategory)
    );

    const targetSlug = activeCat ? normalize(activeCat.slug) : normalize(selectedCategory);
    const targetName = activeCat ? normalize(activeCat.name) : normalize(selectedCategory);
    const prodCat = normalize(product.category);

    return prodCat === targetSlug || prodCat === targetName || (activeCat && prodCat.includes(targetSlug));
  });

  return (
    <SettingsContext.Provider
      value={{
        settings,
        products,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        selectedProduct,
        setSelectedProduct,
        filteredProducts,
        isLoading,
        refreshData
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
