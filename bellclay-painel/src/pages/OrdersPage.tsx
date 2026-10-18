import React, { useState } from 'react';
import { Search, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Order } from '../types';

interface OrdersPageProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({ orders, onSelectOrder }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getOrderObservations = (order: Order) => {
    if (!order) return [];
    const list: string[] = [];
    if (order.notes?.trim()) {
      list.push(`Geral: ${order.notes.trim()}`);
    }
    if (order.customer?.notes?.trim() && order.customer.notes !== order.notes) {
      list.push(`Cliente: ${order.customer.notes.trim()}`);
    }
    if (Array.isArray(order.items)) {
      order.items.forEach((item) => {
        if (item?.customObservation?.trim()) {
          list.push(`${item.product?.title || 'Peça'}: ${item.customObservation.trim()}`);
        }
      });
    }
    return list;
  };

  const filtered = (orders || []).filter(o => {
    if (!o) return false;
    const matchesStatus = statusFilter === 'all' || o.orderStatus === statusFilter;
    const term = searchTerm.toLowerCase();
    const orderId = (o.id || '').toLowerCase();
    const customerName = (o.customer?.name || '').toLowerCase();
    const city = (o.address?.city || '').toLowerCase();
    const notes = (o.notes || '').toLowerCase();
    const customerNotes = (o.customer?.notes || '').toLowerCase();
    const hasItemObs = Array.isArray(o.items) && o.items.some(it => it?.customObservation?.toLowerCase().includes(term));

    const matchesSearch =
      searchTerm.trim() === '' ||
      orderId.includes(term) ||
      customerName.includes(term) ||
      city.includes(term) ||
      notes.includes(term) ||
      customerNotes.includes(term) ||
      hasItemObs;

    return matchesStatus && matchesSearch;
  });

  const statusBadges: Record<Order['orderStatus'], { label: string; color: string }> = {
    pending: { label: 'Pendente', color: 'bg-amber-100 text-amber-800' },
    paid: { label: '✓ Pago', color: 'bg-emerald-100 text-emerald-800 border border-emerald-300' },
    production: { label: 'Em Produção', color: 'bg-purple-100 text-purple-800' },
    shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800' },
    delivered: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  };

  const paymentLabels: Record<string, string> = {
    pix: 'PIX',
    credit_card: 'CARTÃO',
    infinitepay: 'INFINITEPAY',
    boleto: 'BOLETO'
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal">Gestão de Pedidos & Vendas</h2>
          <p className="text-xs text-brand-muted">
            Monitore pagamentos em tempo real via InfinitePay, endereços de entrega, etapas de produção e rastreio.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-brand-border/70 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            placeholder="Buscar por ID, cliente ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-10 pr-4 py-2 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendentes' },
            { id: 'paid', label: 'Pagos' },
            { id: 'production', label: 'Em Produção' },
            { id: 'shipped', label: 'Enviados' },
            { id: 'delivered', label: 'Entregues' }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-brand-charcoal text-white'
                  : 'bg-[#FAF7F2] text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-brand-border/70 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF8F5] border-b border-brand-border/60 text-brand-muted font-semibold">
              <tr>
                <th className="py-3.5 px-6">ID / Data</th>
                <th className="py-3.5 px-4">Cliente</th>
                <th className="py-3.5 px-4">Endereço / Frete</th>
                <th className="py-3.5 px-4">Pagamento</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-6 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-brand-muted">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const badge = (order.orderStatus && statusBadges[order.orderStatus]) || { label: order.orderStatus || 'Pendente', color: 'bg-gray-100 text-gray-700' };
                  const obsList = getOrderObservations(order);
                  const isPaid = order.paymentStatus === 'approved' || order.orderStatus === 'paid' || order.orderStatus === 'production' || order.orderStatus === 'shipped' || order.orderStatus === 'delivered';
                  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '-';
                  const totalFormatted = (Number(order.total) || 0).toFixed(2).replace('.', ',');
                  const itemsCount = Array.isArray(order.items) ? order.items.length : 0;
                  const customerName = order.customer?.name || 'Cliente sem nome';
                  const customerPhone = order.customer?.phone || '-';
                  const city = order.address?.city || 'Local não informado';
                  const state = order.address?.state ? ` - ${order.address.state}` : '';
                  const street = order.address?.street || '-';
                  const number = order.address?.number || '';
                  const shippingName = order.shipping?.name || 'Envio Padrão';
                  const paymentMethod = (order.paymentMethod && paymentLabels[order.paymentMethod]) || order.paymentMethod || 'PIX';

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <span className="font-bold text-brand-charcoal block">#{order.id}</span>
                        <span className="text-[10px] text-brand-muted">
                          {orderDate}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-charcoal block">{customerName}</span>
                        <span className="text-[10px] text-brand-muted block">{customerPhone}</span>
                        {obsList.length > 0 && (
                          <div
                            onClick={() => onSelectOrder(order)}
                            className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/90 text-[10px] font-semibold max-w-[220px] truncate cursor-pointer hover:bg-amber-100 transition-colors shadow-2xs"
                            title={`Observações: \n${obsList.join('\n')}`}
                          >
                            <MessageSquare className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate">Obs: {obsList[0]}</span>
                            {obsList.length > 1 && (
                              <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded-full font-bold shrink-0">
                                +{obsList.length - 1}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-brand-charcoal block">
                          {city}{state}
                        </span>
                        <span className="text-[10px] text-brand-muted block truncate max-w-[180px]" title={`${street}, ${number} - ${order.address?.neighborhood || ''} (CEP ${order.address?.cep || ''})`}>
                          {street}, {number}
                        </span>
                        <span className="text-[10px] text-brand-pink font-semibold">{shippingName}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase font-bold text-[11px] text-brand-charcoal block">
                          {paymentMethod}
                        </span>
                        <span className="text-[10px] text-brand-green font-semibold flex items-center gap-1">
                          {isPaid && <CheckCircle2 className="w-3 h-3" />}
                          <span>InfinitePay</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-brand-charcoal block">
                          R$ {totalFormatted}
                        </span>
                        <span className="text-[10px] text-brand-muted">{itemsCount} {itemsCount === 1 ? 'item' : 'itens'}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badge.color}`}>
                          {badge.label}
                        </span>
                        {order.trackingCode && (
                          <span className="block text-[9px] text-brand-muted font-mono mt-0.5">
                            {order.trackingCode}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => onSelectOrder(order)}
                          className="px-3.5 py-1.5 rounded-full bg-brand-pink-light text-brand-pink hover:bg-brand-pink hover:text-white font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Detalhes
                        </button>
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
