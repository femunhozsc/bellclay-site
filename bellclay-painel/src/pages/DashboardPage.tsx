import React, { useState, useMemo } from 'react';
import {
  DollarSign, ShoppingBag, Eye, AlertTriangle, Heart,
  Calendar, Filter
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ChartWidget } from '../components/ChartWidget';
import { Order, Product, AnalyticsEvent, DateFilterType } from '../types';
import { computeMetrics } from '../services/firebase';

interface DashboardPageProps {
  orders: Order[];
  events: AnalyticsEvent[];
  products: Product[];
  onSelectOrder: (order: Order) => void;
  onNavigateToProducts: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  orders,
  events,
  products,
  onSelectOrder,
  onNavigateToProducts
}) => {
  const [selectedFilter, setSelectedFilter] = useState<DateFilterType>('7d');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const currentMetrics = useMemo(() => {
    return computeMetrics(orders, events, selectedFilter, customStart, customEnd);
  }, [orders, events, selectedFilter, customStart, customEnd]);

  const lowStockProducts = products.filter(p => p.stock <= 5);

  // Filter orders according to selected date range
  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'all') return orders;
    const now = new Date();
    let start: Date;
    let end: Date = new Date();

    if (selectedFilter === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (selectedFilter === '7d') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    } else if (selectedFilter === '30d') {
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
    } else if (selectedFilter === 'custom' && customStart) {
      start = new Date(customStart + 'T00:00:00');
      end = customEnd ? new Date(customEnd + 'T23:59:59.999') : new Date(customStart + 'T23:59:59.999');
    } else {
      return orders;
    }

    return orders.filter(o => {
      if (!o.createdAt) return false;
      const t = new Date(o.createdAt).getTime();
      return t >= start.getTime() && t <= end.getTime();
    });
  }, [orders, selectedFilter, customStart, customEnd]);

  const displayedOrders = filteredOrders.length > 0 ? filteredOrders : orders;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      
      {/* Subtle Date Filter Header */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/70 backdrop-blur-xs p-3 sm:py-2.5 sm:px-4 rounded-2xl border border-brand-border/60 shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-brand-charcoal">
            <Calendar className="w-4 h-4 text-brand-pink shrink-0" />
            <span className="font-bold">Filtrar período:</span>
            <span className="text-brand-muted font-normal hidden md:inline">
              • {currentMetrics.filterLabel || 'Últimos 7 dias'}
            </span>
          </div>

          {/* Pill buttons */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => { setSelectedFilter('today'); setIsCustomOpen(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'today'
                  ? 'bg-brand-pink text-white shadow-2xs'
                  : 'text-brand-muted hover:text-brand-charcoal hover:bg-black/5'
              }`}
            >
              Hoje
            </button>

            <button
              type="button"
              onClick={() => { setSelectedFilter('7d'); setIsCustomOpen(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === '7d'
                  ? 'bg-brand-pink text-white shadow-2xs'
                  : 'text-brand-muted hover:text-brand-charcoal hover:bg-black/5'
              }`}
            >
              Últimos 7 dias
            </button>

            <button
              type="button"
              onClick={() => { setSelectedFilter('30d'); setIsCustomOpen(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === '30d'
                  ? 'bg-brand-pink text-white shadow-2xs'
                  : 'text-brand-muted hover:text-brand-charcoal hover:bg-black/5'
              }`}
            >
              Último mês
            </button>

            <button
              type="button"
              onClick={() => { setSelectedFilter('all'); setIsCustomOpen(false); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'all'
                  ? 'bg-brand-pink text-white shadow-2xs'
                  : 'text-brand-muted hover:text-brand-charcoal hover:bg-black/5'
              }`}
            >
              Todo o histórico
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedFilter('custom');
                setIsCustomOpen(prev => !prev);
                if (!customStart) {
                  const now = new Date();
                  const past = new Date(now);
                  past.setDate(past.getDate() - 7);
                  setCustomStart(past.toISOString().split('T')[0]);
                  setCustomEnd(now.toISOString().split('T')[0]);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedFilter === 'custom'
                  ? 'bg-brand-pink text-white shadow-2xs'
                  : 'text-brand-muted hover:text-brand-charcoal hover:bg-black/5'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Data específica</span>
            </button>
          </div>
        </div>

        {/* Custom Date Picker Drawer */}
        {selectedFilter === 'custom' && isCustomOpen && (
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-white border border-brand-border/70 shadow-2xs text-xs animate-in fade-in duration-200">
            <span className="font-bold text-brand-charcoal">Definir data ou intervalo:</span>
            
            <div className="flex items-center gap-2">
              <label className="text-brand-muted font-medium">De:</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-brand-border bg-[#FAF7F2] text-brand-charcoal font-semibold text-xs outline-none focus:border-brand-pink"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-brand-muted font-medium">Até:</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-brand-border bg-[#FAF7F2] text-brand-charcoal font-semibold text-xs outline-none focus:border-brand-pink"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                const now = new Date().toISOString().split('T')[0];
                setCustomStart(now);
                setCustomEnd(now);
              }}
              className="px-2.5 py-1 rounded-lg text-brand-pink hover:bg-brand-pink/10 font-bold transition-colors cursor-pointer ml-auto"
            >
              Apenas hoje
            </button>
          </div>
        )}
      </div>

      {/* KPI row with Real Data & Real % changes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Faturamento Total"
          value={`R$ ${currentMetrics.totalRevenue.toFixed(2).replace('.', ',')}`}
          change={currentMetrics.revenueChange}
          isPositive={currentMetrics.isRevenuePositive}
          icon={<DollarSign className="w-5 h-5 text-brand-green" />}
          subtitle={`Vendas pagas • ${currentMetrics.comparisonLabel || 'no período'}`}
        />
        <MetricCard
          title="Pedidos Realizados"
          value={currentMetrics.totalOrders}
          change={currentMetrics.ordersChange}
          isPositive={currentMetrics.isOrdersPositive}
          icon={<ShoppingBag className="w-5 h-5 text-brand-pink" />}
          subtitle={`Ticket Médio: R$ ${currentMetrics.averageTicket.toFixed(2).replace('.', ',')}`}
        />
        <MetricCard
          title="Itens no Carrinho"
          value={currentMetrics.addToCartClicks}
          change={currentMetrics.cartChange}
          isPositive={currentMetrics.isCartPositive}
          icon={<Heart className="w-5 h-5 text-brand-pink fill-brand-pink/30" />}
          subtitle="Adições registradas no período"
        />
        <MetricCard
          title="Visitas na Loja"
          value={currentMetrics.uniqueVisitors}
          change={currentMetrics.visitorsChange}
          isPositive={currentMetrics.isVisitorsPositive}
          icon={<Eye className="w-5 h-5 text-indigo-500" />}
          subtitle={`Conversão: ${currentMetrics.conversionRate.toFixed(1)}%`}
        />
      </div>

      {/* Chart & Conversion Funnel */}
      <ChartWidget metrics={currentMetrics} />

      {/* Two columns: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Column */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-brand-charcoal">Pedidos Recentes</h3>
              <p className="text-xs text-brand-muted">
                {filteredOrders.length > 0
                  ? `Exibindo pedidos do período (${currentMetrics.filterLabel || 'selecionado'})`
                  : 'Nenhum pedido no período selecionado (exibindo mais recentes)'}
              </p>
            </div>
            <span className="text-xs font-semibold text-brand-pink">
              {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido no período' : 'pedidos no período'} ({orders.length} total)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-muted font-semibold">
                  <th className="pb-3">Pedido</th>
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Envio</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {displayedOrders.slice(0, 5).map((order) => {
                  const statusMap: Record<Order['orderStatus'], { label: string; color: string }> = {
                    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-700' },
                    paid: { label: 'Pago', color: 'bg-blue-100 text-blue-700' },
                    production: { label: 'Em Produção', color: 'bg-purple-100 text-purple-700' },
                    shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-700' },
                    delivered: { label: 'Entregue', color: 'bg-green-100 text-green-700' },
                    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
                  };
                  const st = statusMap[order.orderStatus] || { label: order.orderStatus, color: 'bg-gray-100 text-gray-700' };
                  return (
                  <tr key={order.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 font-bold text-brand-charcoal">#{order.id}</td>
                    <td className="py-3 text-brand-muted">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3 text-brand-charcoal">
                      <span className="font-semibold block">{order.customer.name}</span>
                      <span className="text-[10px] text-brand-muted">{order.address.city} - {order.address.state}</span>
                    </td>
                    <td className="py-3 text-brand-muted">
                      {order.shipping.name}
                    </td>
                    <td className="py-3 font-extrabold text-brand-charcoal">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${st.color}`}>
                        {st.label}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-3 py-1.5 rounded-full bg-brand-pink-light text-brand-pink hover:bg-brand-pink hover:text-white font-bold transition-all cursor-pointer shadow-xs"
                      >
                        Gerenciar
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-brand-charcoal">Alerta de Estoque</h3>
            </div>
            <p className="text-xs text-brand-muted">Peças modeladas com poucas unidades disponíveis</p>

            <div className="space-y-2.5 pt-2">
              {lowStockProducts.length === 0 ? (
                <p className="text-xs text-brand-green font-semibold py-4 text-center">
                  Estoque saudável em todas as peças!
                </p>
              ) : (
                lowStockProducts.slice(0, 4).map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-[#FAF7F2] border border-brand-border/60">
                    <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-white shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-brand-charcoal truncate">{p.title}</h4>
                      <span className="text-[10px] text-red-500 font-bold block">
                        Restam apenas {p.stock} unidades!
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={onNavigateToProducts}
            className="w-full mt-4 py-2.5 rounded-full border border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Ver Todo o Estoque
          </button>
        </div>

      </div>

    </div>
  );
};
