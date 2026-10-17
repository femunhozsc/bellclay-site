import React from 'react';
import { Eye, ShoppingBag, CreditCard, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { MetricsSummary } from '../types';

interface ChartWidgetProps {
  metrics: MetricsSummary;
}

export const ChartWidget: React.FC<ChartWidgetProps> = ({ metrics }) => {
  const points = metrics.chartData || [];

  const maxVisitors = Math.max(...points.map(p => p.visitors), 1);
  const maxOrders = Math.max(...points.map(p => p.orders), 1);

  const hasAnyActivity = points.some(p => p.visitors > 0 || p.orders > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Dynamic Performance Chart */}
      <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-brand-charcoal">Evolução de Tráfego & Vendas</h3>
            <p className="text-xs text-brand-muted">
              {metrics.filterLabel ? `Período: ${metrics.filterLabel}` : 'Dados da loja online'}
            </p>
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
        <div className="h-48 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-1 sm:px-2">
          {!hasAnyActivity ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
              <p className="text-xs text-brand-muted font-medium">
                Nenhum tráfego ou pedido registrado neste período.
              </p>
              <span className="text-[11px] text-brand-muted/70 mt-1">
                Altere o filtro de período acima para analisar outros intervalos.
              </span>
            </div>
          ) : (
            points.map((pt, idx) => {
              const visitorH = pt.visitors > 0 ? Math.max(8, Math.round((pt.visitors / maxVisitors) * 100)) : 3;
              const salesH = pt.orders > 0 ? Math.max(8, Math.round((pt.orders / maxOrders) * 100)) : 3;

              return (
                <div key={`${pt.label}-${idx}`} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    {/* Visitor bar */}
                    <div
                      style={{ height: `${visitorH}%` }}
                      className={`w-1/2 transition-all rounded-t-lg relative ${
                        pt.visitors > 0 ? 'bg-brand-pink/25 group-hover:bg-brand-pink' : 'bg-gray-100'
                      }`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-charcoal text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {pt.visitors} {pt.visitors === 1 ? 'visita' : 'visitas'}
                        {pt.fullDate ? ` • ${pt.fullDate}` : ''}
                      </div>
                    </div>

                    {/* Sales bar */}
                    <div
                      style={{ height: `${salesH}%` }}
                      className={`w-1/2 transition-all rounded-t-lg relative ${
                        pt.orders > 0 ? 'bg-brand-green/35 group-hover:bg-brand-green' : 'bg-gray-100'
                      }`}
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-brand-green text-white text-[10px] font-bold px-2 py-0.5 rounded shadow whitespace-nowrap pointer-events-none transition-opacity z-10">
                        {pt.orders} {pt.orders === 1 ? 'pedido' : 'pedidos'}
                        {pt.revenue > 0 ? ` (R$ ${pt.revenue.toFixed(2).replace('.', ',')})` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-brand-muted truncate max-w-full">
                    {pt.label}
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-brand-muted">
          <span>{metrics.peakLabel || 'Pico do período: Aguardando dados'}</span>
          {metrics.ordersChange && (
            <span className={`font-bold flex items-center gap-1 ${metrics.isOrdersPositive ? 'text-brand-green' : 'text-red-500'}`}>
              {metrics.isOrdersPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {metrics.ordersChange} em pedidos {metrics.comparisonLabel || ''}
            </span>
          )}
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-brand-charcoal">Funil de Conversão do E-commerce</h3>
          <p className="text-xs text-brand-muted">Trajetória dos clientes até o pagamento ({metrics.filterLabel || 'período'})</p>
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
              <span className="font-bold">
                {metrics.addToCartClicks} ({((metrics.addToCartClicks / (metrics.uniqueVisitors || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (metrics.addToCartClicks / (metrics.uniqueVisitors || 1)) * 100)}%` }}
                className="bg-brand-pink h-full rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>

          {/* Step 3: Checkout starts */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-charcoal">
                <CreditCard className="w-3.5 h-3.5 text-amber-500" /> Checkouts Iniciados
              </span>
              <span className="font-bold">
                {metrics.checkoutStarts} ({((metrics.checkoutStarts / (metrics.uniqueVisitors || 1)) * 100).toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, (metrics.checkoutStarts / (metrics.uniqueVisitors || 1)) * 100)}%` }}
                className="bg-amber-400 h-full rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>

          {/* Step 4: Completed Orders */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-brand-charcoal">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" /> Compras Concluídas
              </span>
              <span className="font-extrabold text-brand-green">
                {metrics.totalOrders} ({metrics.conversionRate.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-[#FAF7F2] h-2.5 rounded-full overflow-hidden">
              <div
                style={{ width: `${Math.min(100, Math.max(metrics.conversionRate > 0 ? 5 : 0, metrics.conversionRate * 5))}%` }}
                className="bg-brand-green h-full rounded-full transition-all duration-300"
              ></div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-brand-green-subtle/50 rounded-2xl text-[11px] text-brand-charcoal border border-brand-green/20">
          <strong>Taxa de Conversão no Período: {metrics.conversionRate.toFixed(1)}%</strong>
          {metrics.uniqueVisitors > 0
            ? ` (${metrics.totalOrders} ${metrics.totalOrders === 1 ? 'venda realizada' : 'vendas realizadas'} para ${metrics.uniqueVisitors} ${metrics.uniqueVisitors === 1 ? 'visitante' : 'visitantes'})`
            : ' (Aguardando primeiras visitas no período selecionado)'}
        </div>
      </div>

    </div>
  );
};
