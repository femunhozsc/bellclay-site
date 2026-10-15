import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Package, MapPin, Phone, Mail, CheckCircle2,
  Clock, ArrowLeft, MessageCircle, LogOut, ChevronRight,
  ShieldCheck, Truck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export const AccountPage: React.FC = () => {
  const { customerProfile, setCustomerProfile, logout } = useAuth();

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
        setOrders(JSON.parse(savedOrders));
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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Pago / Confirmado</span>;
      case 'production':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Em Modelagem & Secagem</span>;
      case 'shipped':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Enviado / A caminho</span>;
      case 'delivered':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Entregue</span>;
      case 'cancelled':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">Cancelado</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">Aguardando Pagamento</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-16">
      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex items-center gap-1.5 text-xs text-brand-muted">
          <Link to="/" className="hover:text-brand-pink transition-colors">
            Início
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-brand-border" />
          <span className="text-brand-charcoal font-semibold">Minha Conta & Pedidos</span>
        </nav>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Title & Guest Friendly Note */}
        <div className="bg-white rounded-3xl border border-brand-border/60 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-pink-subtle text-brand-pink mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Espaço do Cliente</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
              {customerProfile.name ? `Olá, ${customerProfile.name}!` : 'Identificação do Cliente'}
            </h1>
            <p className="text-xs sm:text-sm text-brand-muted mt-1 max-w-xl">
              Aqui você confere o andamento dos seus pedidos em cerâmica fria e mantém seus dados para entregas futuras.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-brand-border/60 text-xs text-brand-charcoal max-w-xs">
            <span className="font-bold text-brand-green block mb-0.5">Sem burocracia:</span>
            A criação de conta não é obrigatória para comprar na Bellclay. Você sempre pode pedir como visitante!
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Profile Form */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-brand-border/60 p-6 shadow-xs space-y-5">
            <div className="border-b border-brand-border/60 pb-3">
              <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                Meus Dados de Contato
              </h2>
              <p className="text-[11px] text-brand-muted">
                Usados para preencher automaticamente o checkout e calcular envios.
              </p>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-brand-charcoal mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-charcoal mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-charcoal mb-1">
                  WhatsApp / Celular
                </label>
                <input
                  type="text"
                  placeholder="(00) 00000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-charcoal mb-1">
                  CPF (para envio postal)
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-hidden bg-[#FAF7F2]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-xs shadow-pink-soft transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                  <span>{isSaved ? 'Dados Salvos!' : 'Salvar Alterações'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Orders History */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-brand-border/60 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
              <div>
                <h2 className="font-serif text-lg font-bold text-brand-charcoal">
                  Meus Pedidos ({orders.length})
                </h2>
                <p className="text-[11px] text-brand-muted">
                  Acompanhe a modelagem, secagem e envio das suas peças.
                </p>
              </div>

              <Package className="w-5 h-5 text-brand-green" />
            </div>

            {orders.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-brand-border space-y-3">
                <Package className="w-10 h-10 text-brand-muted mx-auto" />
                <h3 className="font-serif text-base font-bold text-brand-charcoal">
                  Nenhum pedido encontrado ainda
                </h3>
                <p className="text-xs text-brand-muted max-w-sm mx-auto">
                  Quando você fizer um pedido no site, ele aparecerá aqui com todos os detalhes e código de rastreio!
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-brand-pink text-white text-xs font-bold shadow-pink-soft hover:shadow-soft-hover transition-all"
                >
                  <span>Conhecer Catálogo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/70 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/50 pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-brand-charcoal">
                          Pedido #{order.id}
                        </span>
                        <span className="text-[10px] text-brand-muted block">
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
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-2.5">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.title}
                            className="w-9 h-9 rounded-lg object-cover bg-white"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-brand-charcoal block truncate">
                              {item.product.title}
                            </span>
                            <span className="text-[10px] text-brand-muted">
                              {item.quantity}x • R$ {((item.product.promotionalPrice || item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery & Tracking */}
                    <div className="pt-2 border-t border-brand-border/40 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-brand-muted block">
                          Envio: {order.shipping?.name}
                        </span>
                        {order.trackingCode && (
                          <span className="font-mono text-[11px] font-bold text-brand-green">
                            Rastreio: {order.trackingCode}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-brand-muted block">Total</span>
                        <span className="text-sm font-extrabold text-brand-charcoal">
                          R$ {order.total.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    {/* Direct WhatsApp Follow-up */}
                    <div className="pt-1 flex justify-end">
                      <a
                        href={`https://wa.me/5544991074932?text=${encodeURIComponent(
                          `Olá Bellclay! Gostaria de informações sobre o andamento do meu pedido #${order.id} feito no site!`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-brand-green hover:underline"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Falar com o ateliê sobre este pedido</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
};
