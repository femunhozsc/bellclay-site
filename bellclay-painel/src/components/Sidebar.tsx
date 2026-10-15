import React from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Sliders,
  Settings,
  LogOut,
  ExternalLink,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { adminUser, logout } = useAdminAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard & Métricas', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'products', label: 'Produtos & Frete', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Pedidos & Vendas', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'customizer', label: 'Personalizar Site', icon: <Sliders className="w-5 h-5" /> },
    { id: 'settings', label: 'Configurações & APIs', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-white border-r border-brand-border/70 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-brand-border/60 flex items-center gap-3">
          <img
            src="/bellclay_logo.png"
            alt="Bellclay Logo"
            className="h-10 w-auto object-contain"
          />
          <div>
            <span className="font-bold text-sm text-brand-charcoal block">Bellclay Painel</span>
            <span className="text-[11px] text-brand-muted block">Gestão & E-commerce</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-brand-pink text-white shadow-pink-soft'
                    : 'text-brand-charcoal hover:bg-[#FAF7F2] hover:text-brand-pink'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-brand-muted'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Footer & External Link */}
      <div className="p-4 border-t border-brand-border/60 space-y-3">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#FAF7F2] text-brand-charcoal text-xs font-semibold hover:bg-brand-pink-light hover:text-brand-pink transition-all"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
            <span>Abrir Loja</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="flex items-center justify-between pt-2">
          <div className="truncate pr-2">
            <span className="text-xs font-bold text-brand-charcoal block truncate">
              {adminUser?.name || 'Administradora'}
            </span>
            <span className="text-[10px] text-brand-muted block truncate">
              {adminUser?.email || 'admin@bellclay.com'}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl hover:bg-red-50 text-brand-muted hover:text-red-500 transition-colors cursor-pointer"
            title="Sair do painel"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
