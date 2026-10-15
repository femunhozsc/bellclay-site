import React from 'react';
import { Bell, MapPin } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  const { adminUser } = useAdminAuth();

  return (
    <header className="bg-white border-b border-brand-border/60 px-8 py-5 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h1 className="text-xl font-bold text-brand-charcoal">{title}</h1>
        {subtitle && <p className="text-xs text-brand-muted mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Origin info pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-green-subtle text-brand-green text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5" />
          <span>Origem: 87302-060 (Campo Mourão - PR)</span>
        </div>

        {/* Profile indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-brand-border">
          <div className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {adminUser?.name?.[0] || 'B'}
          </div>
          <span className="hidden md:inline text-xs font-bold text-brand-charcoal">
            {adminUser?.name || 'Admin'}
          </span>
        </div>
      </div>
    </header>
  );
};
