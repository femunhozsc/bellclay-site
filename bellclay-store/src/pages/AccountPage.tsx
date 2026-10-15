import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User, Package, MapPin, Phone, Mail, CheckCircle2,
  ChevronRight, MessageCircle, ExternalLink, ShieldCheck, Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export const AccountPage: React.FC = () => {
  const { customerProfile, setCustomerProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('profile');
  const [name, setName] = useState(customerProfile.name || '');
  const [email, setEmail] = useState(customerProfile.email || '');
  const [phone, setPhone] = useState(customerProfile.phone || '');
  const [cpf, setCpf] = useState(customerProfile.cpf || '');
  const [isSaved, setIsSaved] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const savedOrders = localStorage.getItem('bellclay_orders');
      if (savedOrders) {
        const parsed = JSON.parse(savedOrders);
        setOrders(parsed);
        if (parsed.length > 0) {
          setActiveTab('orders');
        }
      }
    } catch {}
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomerProfile({
      ...customerProfile,
      name,
      email,
      phone,
      cpf,
      isGuest: false
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    switch (status) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Pago & Confirmado</span>;
      case 'production':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Em Modelagem & Secagem</span>;
      case 'shipped':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Enviado / A caminho</span>;
      case 'delivered':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">Entregue com Sucesso</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">Cancelado</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">Aguardando Pagamento</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-brand-muted">
          <Link to="/" className="hover:text-brand-pink transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <span className="text-brand-charcoal font-semibold">Espaço do Cliente</span>
        </nav>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Sleek Minimalist Page Header (Zero heavy card boxes) */}
        <div className="border-b border-brand-border/60 pb-6 pt-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-pink">
            Ateliê Bellclay Artesanatos
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold text-brand-charcoal tracking-tight mt-1">
            {customerProfile.name ? `Olá, ${customerProfile.name.split(' ')[0]}` : 'Minha Conta'}
          </h1>
          <p className="text-sm sm:text-base text-brand-muted mt-1 max-w-xl">
            Acompanhe a produção das suas peças artesanais e gerencie seus dados para envios com rapidez e segurança.
          </p>

          {/* Clean Segmented Tab Switcher */}
          <div className="flex gap-2 sm:gap-4 mt-6">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-white hover:bg-[#F6F1E8] text-brand-muted border border-brand-border/80'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Meus Dados de Contato</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-brand-charcoal text-white shadow-sm'
                  : 'bg-white hover:bg-[#F6F1E8] text-brand-muted border border-brand-border/80'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Meus Pedidos ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl py-2 space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-charcoal">
                Informações para Entrega & Notificações
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted">
                Preencha uma vez para não precisar redigitar no checkout das suas próximas compras.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-brand-charcoal mb-1.5">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-brand-border/80 focus:border-brand-pink outline-none bg-white shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-brand-charcoal mb-1.5">
                    E-mail
                  </label>
                  <input
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-sm px-4 py-3 rounded-xl border border-brand-border/80 focus:border-brand-pink outline-none bg-white shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-brand-charcoal mb-1.5">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(00) 00000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-sm px-4 py-3 rounded-xl border border-brand-border/80 focus:border-brand-pink outline-none bg-white shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-bold text-brand-charcoal mb-1.5">
                  CPF (necessário para declaração de conteúdo dos Correios/transportadora)
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full text-sm px-4 py-3 rounded-xl border border-brand-border/80 focus:border-brand-pink outline-none bg-white shadow-2xs"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-extrabold text-sm shadow-pink-soft transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4 stroke-[2.5]" /> : null}
                  <span>{isSaved ? 'Dados Salvos com Sucesso!' : 'Salvar Meus Dados'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 2: Orders History */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-brand-charcoal">
                Histórico de Encomendas
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted">
                Acompanhe o status e rastreamento de cada peça artesanal criada para você.
              </p>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Package className="w-12 h-12 text-brand-muted/60 mx-auto" />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-charcoal">
                  Nenhuma encomenda encontrada
                </h3>
                <p className="text-xs sm:text-sm text-brand-muted max-w-sm mx-auto">
                  Assim que você concluir um pedido no site, ele aparecerá aqui com atualizações de modelagem e envio!
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-pink text-white text-xs sm:text-sm font-bold shadow-pink-soft hover:shadow-soft-hover transition-all"
                >
                  <span>Explorar Catálogo</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border/70 space-y-4 shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/40 pb-3">
                      <div>
                        <span className="text-sm font-extrabold text-brand-charcoal">
                          Pedido #{order.id}
                        </span>
                        <span className="text-xs text-brand-muted block mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      <div>{getStatusBadge(order.orderStatus)}</div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2.5">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs sm:text-sm font-bold text-brand-charcoal block truncate">
                              {item.product.title}
                            </span>
                            <span className="text-xs text-brand-muted">
                              {item.quantity} unidade(s) • R$ {((item.product.promotionalPrice || item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Tracking & Total */}
                    <div className="pt-3 border-t border-brand-border/40 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-brand-muted block">
                          Envio: <strong className="text-brand-charcoal">{order.shipping?.name}</strong>
                        </span>
                        {order.trackingCode && (
                          <span className="font-mono font-bold text-brand-green block mt-0.5">
                            Código de Rastreio: {order.trackingCode}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-brand-muted block">Valor Total</span>
                        <span className="text-base sm:text-lg font-black text-brand-charcoal">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Direct WhatsApp Follow-up */}
                    <div className="pt-2 flex justify-end">
                      <a
                        href={`https://wa.me/5544991074932?text=${encodeURIComponent(
                          `Olá Bellclay! Gostaria de acompanhar a produção do meu pedido #${order.id} feito no site!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-green hover:underline"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Falar com o ateliê sobre este pedido no WhatsApp</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
