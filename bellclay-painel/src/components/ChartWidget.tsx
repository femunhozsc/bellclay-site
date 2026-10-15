import React from 'react';
import { Eye, ShoppingBag, CreditCard, CheckCircle2, TrendingUp } from 'lucide-react';
import { MetricsSummary } from '../types';

interface ChartWidgetProps {
  metrics: MetricsSummary;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ metrics }) => {
  // 7-day data simulation based on real metrics
  const days = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  const visitorsTrend = [180, 220, 260, 310, 290, 380, 420];
  const salesTrend = [12, 18, 15, 24, 28, 35, 42];

  const maxVal = Math.max(...visitorsTrend);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* 7-Day Performance Chart */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-sm text-brand-charcoal">Evolução de Tráfego & Vendas</h3>
            <p className="text-xs text-brand-muted">Últimos 7 dias da loja online</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-brand-charcoal">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-pink"></span> Visitas
            </span>
            <span className="flex items-center gap-1.5 text-brand-charcoal">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-green"></span> Pedidos
            </span>
          </div>
        </div>

        {/* Bar & Trend Visualization */}
        <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 px-2">
          {days.map((day, idx) => {
            const visitorH = Math.round((visitorsTrend[idx] / maxVal) * 100);
            const salesH = Math.round((salesTrend[idx] / 50) * 100);

            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                <div className="w-full flex items-end justify-center gap-1 h-36">
                  {/* Visitor bar */}
                  <div
                    style={{ height: `${visitorH}%` }}
                    className="w-1/2 bg-brand-pink/20 group-hover:bg-brand-pink transition-all rounded-t-lg relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-charcoal text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                      {visitorsTrend[idx]}
                    </div>
                  </div>
                  {/* Sales bar */}
                  <div
                    style={{ height: `${salesH}%` }}
                    className="w-1/2 bg-brand-green/30 group-hover:bg-brand-green transition-all rounded-t-lg relative"
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 bg-brand-green text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                      {salesTrend[idx]}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-brand-muted">{day}</span>
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-muted">
          <span>Pico semanal: <strong>Domingo (420 visitas / 42 pedidos)</strong></span>
          <span className="text-brand-green font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> +24% vs semana anterior
          </span>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-brand-charcoal">Funil de Conversão do E-commerce</h3>
          <p className="text-xs text-brand-muted">Trajetória dos clientes até o pagamento</p>
        </div>

        <div className="space-y-4 py-4">
          {/* Step 1: Views */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-charcoal">
                <Eye className="w-3.5 h-3.5 text-brand-muted" /> Visitas no Site
              </span>
              <span className="font-bold">{metrics.uniqueVisitors}</span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div className="bg-brand-muted h-full rounded-full w-full"></div>
            </div>
          </div>

          {/* Step 2: Added to Cart */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-charcoal">
                <ShoppingBag className="w-3.5 h-3.5 text-brand-pink" /> Adicionados ao Carrinho
              </span>
              <span className="font-bold">{metrics.addToCartClicks} ({((metrics.addToCartClicks / (metrics.uniqueVisitors || 1)) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (metrics.addToCartClicks / (metrics.uniqueVisitors || 1)) * 100)}%` }}
                className="bg-brand-pink h-full rounded-full"
              ></div>
            </div>
          </div>

          {/* Step 3: Checkout starts */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-charcoal">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Checkouts Iniciados
              </span>
              <span className="font-bold">{metrics.checkoutStarts} ({((metrics.checkoutStarts / (metrics.addToCartClicks || 1)) * 100).toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (metrics.checkoutStarts / (metrics.uniqueVisitors || 1)) * 100)}%` }}
                className="bg-amber-400 h-full rounded-full"
              ></div>
            </div>
          </div>

          {/* Step 4: Completed Orders */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-charcoal">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Compras Concluídas
              </span>
              <span className="font-extrabold text-brand-green">{metrics.totalOrders} ({metrics.conversionRate.toFixed(1)}%)</span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, metrics.conversionRate * 8)}%` }}
                className="bg-brand-green h-full rounded-full"
              ></div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-brand-green-subtle/50 rounded-2xl text-[11px] text-brand-charcoal border border-brand-green/20">
          <strong>Taxa de Conversão Geral: {metrics.conversionRate.toFixed(2)}%</strong> (ótimo desempenho para e-commerce artesanal).
        </div>
      </div>

    </div>
  );
};
