import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon,
  subtitle
}) => {
  return (
    <div className="bg-white p-5 rounded-3xl border border-brand-border/70 shadow-xs hover:shadow-soft transition-all duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-brand-muted">{title}</span>
        <div className="p-2.5 rounded-2xl bg-[#FAF7F2] text-brand-pink shadow-inner">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-extrabold text-brand-charcoal">{value}</span>
        {change && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
            isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {change}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-[11px] text-brand-muted mt-2 border-t border-brand-border/40 pt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
};
