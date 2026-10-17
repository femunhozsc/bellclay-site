import React, { useState, useEffect } from 'react';
import { useAdminAuth } from './context/AdminAuthContext';
import { LoginPage } from './pages/LoginPage';
import { Sidebar } from './components/Sidebar';
import { AdminHeader } from './components/AdminHeader';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomizerPage } from './pages/CustomizerPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProductFormModal } from './components/ProductFormModal';
import { OrderDetailModal } from './components/OrderDetailModal';
import { BannerModal } from './components/BannerModal';
import { CategoryModal } from './components/CategoryModal';
import { EventModal } from './components/EventModal';
import {
  fetchPanelProducts,
  savePanelProduct,
  deletePanelProduct,
  fetchPanelSettings,
  savePanelSettings,
  savePanelEvent,
  deletePanelEvent,
  fetchPanelOrders,
  subscribeToPanelOrders,
  updateOrderStatus,
  fetchAnalyticsEvents,
  fetchMetrics,
  DEFAULT_PANEL_SETTINGS,
  DEFAULT_PANEL_PRODUCTS
} from './services/firebase';
import { Product, SiteSettings, Order, MetricsSummary, BannerSlide, CategoryItem, BellclayEvent, AnalyticsEvent } from './types';

export const App: React.FC = () => {
  const { isAuthenticated } = useAdminAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [products, setProducts] = useState<Product[]>(DEFAULT_PANEL_PRODUCTS);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_PANEL_SETTINGS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  // Modal states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<BellclayEvent | null>(null);

  const loadData = async () => {
    try {
      const [fetchedProducts, fetchedSettings, fetchedOrders, fetchedEvents] = await Promise.all([
        fetchPanelProducts(),
        fetchPanelSettings(),
        fetchPanelOrders(),
        fetchAnalyticsEvents()
      ]);
      setProducts(fetchedProducts);
      setSettings(fetchedSettings);
      setOrders(fetchedOrders);
      setAnalyticsEvents(fetchedEvents);
    } catch (err) {
      console.warn('Erro ao carregar dados do painel:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();

      // Subscribe to real-time order updates from Firestore
      const unsubOrders = subscribeToPanelOrders(async (liveOrders) => {
        setOrders(liveOrders);
        const updatedEvents = await fetchAnalyticsEvents();
        setAnalyticsEvents(updatedEvents);
      });

      const handleUpdate = () => loadData();
      window.addEventListener('bellclay_order_saved', handleUpdate);
      window.addEventListener('bellclay_products_updated', handleUpdate);
      window.addEventListener('bellclay_settings_updated', handleUpdate);
      window.addEventListener('bellclay_events_updated', handleUpdate);
      window.addEventListener('bellclay_orders_updated', handleUpdate);
      window.addEventListener('storage', handleUpdate);

      return () => {
        unsubOrders();
        window.removeEventListener('bellclay_order_saved', handleUpdate);
        window.removeEventListener('bellclay_products_updated', handleUpdate);
        window.removeEventListener('bellclay_settings_updated', handleUpdate);
        window.removeEventListener('bellclay_events_updated', handleUpdate);
        window.removeEventListener('bellclay_orders_updated', handleUpdate);
        window.removeEventListener('storage', handleUpdate);
      };
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Handlers for products
  const handleSaveProduct = async (product: Product) => {
    await savePanelProduct(product);
    await loadData();
  };

  const handleDeleteProduct = async (productId: string) => {
    await deletePanelProduct(productId);
    await loadData();
  };

  const handleToggleProductActive = async (product: Product) => {
    const updated = { ...product, active: product.active === false ? true : false };
    await savePanelProduct(updated);
    await loadData();
  };

  // Handlers for settings & banners
  const handleSaveSettings = async (newSettings: SiteSettings) => {
    await savePanelSettings(newSettings);
    setSettings(newSettings);
  };

  const handleSaveBanner = async (banner: BannerSlide) => {
    const existingIndex = settings.banners.findIndex(b => b.id === banner.id);
    let updatedBanners: BannerSlide[];
    if (existingIndex >= 0) {
      updatedBanners = [...settings.banners];
      updatedBanners[existingIndex] = banner;
    } else {
      updatedBanners = [...settings.banners, banner];
    }
    const updated = { ...settings, banners: updatedBanners };
    await handleSaveSettings(updated);
  };

  const handleDeleteBanner = async (bannerId: string) => {
    const updatedBanners = settings.banners.filter(b => b.id !== bannerId);
    const updated = { ...settings, banners: updatedBanners };
    await handleSaveSettings(updated);
  };

  // Handlers for categories
  const handleSaveCategory = async (category: CategoryItem) => {
    const existingIndex = settings.categories.findIndex(c => c.id === category.id);
    let updatedCats: CategoryItem[];
    if (existingIndex >= 0) {
      updatedCats = [...settings.categories];
      updatedCats[existingIndex] = category;
    } else {
      updatedCats = [...settings.categories, category];
    }
    const updated = { ...settings, categories: updatedCats };
    await handleSaveSettings(updated);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const updatedCats = settings.categories.filter(c => c.id !== categoryId);
    const updated = { ...settings, categories: updatedCats };
    await handleSaveSettings(updated);
  };

  // Handlers for events
  const handleSaveEvent = async (event: BellclayEvent) => {
    await savePanelEvent(event);
    await loadData();
  };

  const handleDeleteEvent = async (eventId: string) => {
    await deletePanelEvent(eventId);
    await loadData();
  };

  // Handlers for orders
  const handleUpdateOrderStatus = async (
    orderId: string,
    status: Order['orderStatus'],
    trackingCode?: string
  ) => {
    await updateOrderStatus(orderId, status, trackingCode);
    await loadData();
  };

  const pageTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Visão Geral & Métricas', subtitle: 'Acompanhe vendas, visitas, conversão e carrinho do site' },
    products: { title: 'Gestão de Produtos & Frete', subtitle: 'Cadastre peças com fotos, preços, peso e dimensões para o Melhor Envio' },
    orders: { title: 'Pedidos & Vendas', subtitle: 'Fulfillment de pedidos, códigos de rastreio e contato direto com clientes' },
    customizer: { title: 'Personalização do Site', subtitle: 'Modifique banners, títulos de boas-vindas e categorias em tempo real' },
    settings: { title: 'Configurações & Integrações', subtitle: 'Configure CEP de origem (Campo Mourão), InfinitePay e Melhor Envio' }
  };

  const currentInfo = pageTitles[currentTab] || pageTitles.dashboard;

  return (
    <div className="min-h-screen flex bg-[#F8F6F2] text-brand-charcoal font-sans">
      {/* Sidebar Navigation */}
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content View */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <AdminHeader title={currentInfo.title} subtitle={currentInfo.subtitle} />

        <main className="flex-1 pb-16">
          {currentTab === 'dashboard' && (
            <DashboardPage
              orders={orders}
              events={analyticsEvents}
              products={products}
              onSelectOrder={(ord) => {
                setSelectedOrder(ord);
                setIsOrderDetailOpen(true);
              }}
              onNavigateToProducts={() => setCurrentTab('products')}
            />
          )}

          {currentTab === 'products' && (
            <ProductsPage
              products={products}
              categories={settings.categories}
              onOpenCreateModal={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              onEditProduct={(prod) => {
                setEditingProduct(prod);
                setIsProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onToggleActive={handleToggleProductActive}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersPage
              orders={orders}
              onSelectOrder={(ord) => {
                setSelectedOrder(ord);
                setIsOrderDetailOpen(true);
              }}
            />
          )}

          {currentTab === 'customizer' && (
            <CustomizerPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
              onOpenBannerModal={(banner) => {
                setEditingBanner(banner || null);
                setIsBannerModalOpen(true);
              }}
              onOpenCategoryModal={(cat) => {
                setEditingCategory(cat || null);
                setIsCategoryModalOpen(true);
              }}
              onOpenEventModal={(event) => {
                setEditingEvent(event || null);
                setIsEventModalOpen(true);
              }}
              onDeleteBanner={handleDeleteBanner}
              onDeleteCategory={handleDeleteCategory}
              onDeleteEvent={handleDeleteEvent}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <ProductFormModal
        product={editingProduct}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        categories={settings.categories}
      />

      <OrderDetailModal
        order={selectedOrder}
        isOpen={isOrderDetailOpen}
        onClose={() => setIsOrderDetailOpen(false)}
        onUpdateStatus={handleUpdateOrderStatus}
      />

      <BannerModal
        banner={editingBanner}
        isOpen={isBannerModalOpen}
        onClose={() => setIsBannerModalOpen(false)}
        onSave={handleSaveBanner}
      />

      <CategoryModal
        category={editingCategory}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSave={handleSaveCategory}
      />

      <EventModal
        event={editingEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onSave={handleSaveEvent}
      />
    </div>
  );
};
