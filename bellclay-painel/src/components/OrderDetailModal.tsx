import React, { useState } from 'react';
import { X, MessageCircle, Truck, PackageCheck, CheckCircle2, Clock, MapPin, Hash } from 'lucide-react';
import { Order } from '../types';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: Order['orderStatus'], trackingCode?: string) => Promise<void>;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus
}) => {
  if (!isOpen || !order) return null;

  const [status, setStatus] = useState<Order['orderStatus']>(order.orderStatus);
  const [trackingCode, setTrackingCode] = useState(order.trackingCode || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, status, trackingCode);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const statusColors: Record<Order['orderStatus'], string> = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    paid: 'bg-blue-100 text-blue-800 border-blue-300',
    production: 'bg-purple-100 text-purple-800 border-purple-300',
    shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    delivered: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
  };

  const statusLabels: Record<Order['orderStatus'], string> = {
    pending: 'Pendente de Pagamento',
    paid: 'Pago / Confirmado',
    production: 'Em Produção Artesanal',
    shipped: 'Enviado / Rastreio Postado',
    delivered: 'Entregue com Sucesso',
    cancelled: 'Cancelado',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-border overflow-hidden z-10 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-brand-border/60 flex items-center justify-between bg-[#FDFBF7]">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-lg text-brand-charcoal">
                Pedido #{order.id}
              </h2>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusColors[order.orderStatus]}`}>
                {statusLabels[order.orderStatus]}
              </span>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">
              Realizado em {new Date(order.createdAt).toLocaleString('pt-BR')}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-brand-pink-subtle/50 text-brand-charcoal cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Customer & WhatsApp direct action */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
                Dados do Cliente
              </h3>
              <a
                href={`https://wa.me/${order.customer.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá ${order.customer.name}! Aqui é do ateliê Bellclay Artesanatos a respeito do seu pedido #${order.id}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-green text-white text-xs font-bold shadow-xs hover:bg-brand-green-hover transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-brand-muted">Nome:</span> <strong className="text-brand-charcoal">{order.customer.name}</strong>
              </div>
              <div>
                <span className="text-brand-muted">E-mail:</span> <strong className="text-brand-charcoal">{order.customer.email}</strong>
              </div>
              <div>
                <span className="text-brand-muted">Telefone:</span> <strong className="text-brand-charcoal">{order.customer.phone}</strong>
              </div>
              <div>
                <span className="text-brand-muted">CPF:</span> <strong className="text-brand-charcoal">{order.customer.cpf}</strong>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border/80 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-brand-pink" />
              <span>Endereço de Entrega</span>
            </h3>
            <p className="text-xs text-brand-charcoal leading-relaxed">
              <strong>{order.address.street}, {order.address.number}</strong>
              {order.address.complement && ` (${order.address.complement})`}<br />
              Bairro: {order.address.neighborhood} • CEP: <strong>{order.address.cep}</strong><br />
              {order.address.city} - {order.address.state}
            </p>
          </div>

          {/* Items Purchased */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
              Itens do Pedido ({order.items.length})
            </h3>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl border border-brand-border/60 bg-[#FAF7F2]">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-white shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-brand-charcoal truncate">{item.product.title}</h4>
                    <span className="text-[11px] text-brand-muted">Qtd: {item.quantity} un.</span>
                    {item.customObservation && (
                      <p className="text-[10px] text-brand-pink italic truncate">
                        Personalização: {item.customObservation}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-extrabold text-brand-charcoal">
                    R$ {((item.product.promotionalPrice || item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-brand-border/60 space-y-1 text-xs">
              <div className="flex justify-between text-brand-muted">
                <span>Subtotal:</span>
                <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              <div className="flex justify-between text-brand-muted">
                <span>Envio ({order.shipping.name}):</span>
                <span>{order.shippingCost === 0 ? 'Grátis' : `R$ ${order.shippingCost.toFixed(2).replace('.', ',')}`}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-brand-charcoal pt-1 border-t border-brand-border/40">
                <span>Total:</span>
                <span className="text-brand-pink">R$ {order.total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* Status Update & Tracking Section */}
          <div className="p-4 rounded-2xl bg-[#FFF6F7] border border-brand-pink/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-brand-pink" />
              <span>Gerenciar Status do Pedido</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Status da Produção / Entrega</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Order['orderStatus'])}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-pink/30 bg-white focus:border-brand-pink outline-hidden"
                >
                  <option value="pending">Pendente de Pagamento</option>
                  <option value="paid">Pago / Confirmado</option>
                  <option value="production">Em Produção Artesanal</option>
                  <option value="shipped">Enviado (com Rastreio)</option>
                  <option value="delivered">Entregue</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-charcoal mb-1">Código de Rastreio (Correios / Jadlog)</label>
                <input
                  type="text"
                  placeholder="Ex: NL123456789BR"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-brand-pink/30 bg-white focus:border-brand-pink outline-hidden font-mono"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-brand-border/60 flex items-center justify-end gap-3 bg-[#FDFBF7]">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-brand-border text-xs font-bold text-brand-muted hover:text-brand-charcoal transition-colors cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={isUpdating}
            className="px-6 py-2.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft transition-all cursor-pointer disabled:opacity-50"
          >
            {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </div>
    </div>
  );
};
