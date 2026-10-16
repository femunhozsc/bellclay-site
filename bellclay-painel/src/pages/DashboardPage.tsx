import React from 'react';
import { DollarSign, ShoppingBag, Eye, TrendingUp, AlertTriangle, Package, Heart } from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ChartWidget } from '../components/ChartWidget';
import { MetricsSummary, Order, Product } from '../types';

interface DashboardPageProps {
  metrics: MetricsSummary;
  orders: Order[];
  products: Product[];
  onSelectOrder: (order: Order) => void;
  onNavigateToProducts: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  metrics,
  orders,
  products,
  onSelectOrder,
  onNavigateToProducts
}) => {
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Welcome & KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Faturamento Total"
          value={`R$ ${metrics.totalRevenue.toFixed(2).replace('.', ',')}`}
          change="+18.4%"
          isPositive={true}
          icon={<DollarSign className="w-5 h-5 text-brand-green" />}
          subtitle="Vendas pagas & confirmadas"
        />
        <MetricCard
          title="Pedidos Realizados"
          value={metrics.totalOrders}
          change="+12%"
          isPositive={true}
          icon={<ShoppingBag className="w-5 h-5 text-brand-pink" />}
          subtitle={`Ticket Médio: R$ ${metrics.averageTicket.toFixed(2).replace('.', ',')}`}
        />
        <MetricCard
          title="Itens no Carrinho"
          value={metrics.addToCartClicks}
          change="+26%"
          isPositive={true}
          icon={<Heart className="w-5 h-5 text-brand-pink fill-brand-pink/30" />}
          subtitle="Interesse alto dos visitantes"
        />
        <MetricCard
          title="Visitas na Loja"
          value={metrics.uniqueVisitors}
          change="+31%"
          isPositive={true}
          icon={<Eye className="w-5 h-5 text-indigo-500" />}
          subtitle={`Conversão: ${metrics.conversionRate.toFixed(1)}%`}
        />
      </div>

      {/* Chart & Conversion Funnel */}
      <ChartWidget metrics={metrics} />

      {/* Two columns: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Orders Column */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-brand-charcoal">Pedidos Recentes</h3>
              <p className="text-xs text-brand-muted">Acompanhe novos pedidos e envie com rastreio</p>
            </div>
            <span className="text-xs font-semibold text-brand-pink">{orders.length} pedidos totais</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-brand-border/60 text-brand-muted font-semibold">
                  <th className="pb-3">Pedido</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Envio</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border/40">
                {orders.slice(0, 5).map((order) => {
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
