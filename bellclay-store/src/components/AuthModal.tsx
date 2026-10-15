import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, LogOut, Package, CheckCircle2, Sparkles, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Order } from '../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    customerProfile,
    setCustomerProfile,
    loginWithGoogle,
    logout
  } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (isAuthModalOpen) {
      try {
        const saved = localStorage.getItem('bellclay_orders');
        if (saved) {
          setOrders(JSON.parse(saved));
        }
      } catch {}
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setIsAuthModalOpen(false)}
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border/80 overflow-hidden z-10 p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-brand-pink" />
            <h3 className="font-serif text-lg font-bold text-brand-charcoal">
              {customerProfile.name && !customerProfile.isGuest ? 'Minha Conta' : 'Identificação do Cliente'}
            </h3>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1.5 rounded-full hover:bg-brand-pink-subtle/50 text-brand-charcoal transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {customerProfile.name && !customerProfile.isGuest ? (
          /* Logged In View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60">
              <p className="text-xs text-brand-muted">Conectado como:</p>
              <h4 className="font-bold text-sm text-brand-charcoal">{customerProfile.name}</h4>
              <p className="text-xs text-brand-muted">{customerProfile.email}</p>
            </div>

            {/* My Orders */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-muted flex items-center gap-1.5">
                <Package className="w-4 h-4 text-brand-green" />
                <span>Meus Pedidos Recentes ({orders.length})</span>
              </h4>

              {orders.length === 0 ? (
                <p className="text-xs text-brand-muted italic py-3 text-center bg-[#FAF7F2] rounded-xl">
                  Nenhum pedido realizado neste dispositivo ainda.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-2.5 rounded-xl border border-brand-border/80 bg-white text-xs flex justify-between items-center">
                      <div>
                        <span className="font-bold text-brand-charcoal">#{ord.id}</span>
                        <span className="text-[11px] text-brand-muted block">{ord.items.length} itens • {ord.orderStatus}</span>
                      </div>
                      <span className="font-extrabold text-brand-pink">R$ {ord.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={logout}
              className="w-full py-2.5 rounded-full border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da Conta</span>
            </button>
          </div>
        ) : (
          /* Login / Guest Info View */
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-pink-light/60 border border-brand-pink/20 text-xs text-brand-charcoal space-y-1">
              <span className="font-bold flex items-center gap-1 text-brand-pink">
                <Sparkles className="w-3.5 h-3.5" /> Compra Livre de Burocracia
              </span>
              <p className="text-brand-muted">
                A criação de conta <strong>não é obrigatória</strong> para comprar na Bellclay! Você pode finalizar sua compra direto no carrinho coletando apenas os dados de entrega.
              </p>
            </div>

            <div className="space-y-2">
              <button
                onClick={loginWithGoogle}
                className="w-full py-3 px-4 rounded-full border border-brand-border bg-white hover:bg-gray-50 text-xs font-bold text-brand-charcoal flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-4 h-4"
                />
                <span>Entrar com Google</span>
              </button>

              <button
                onClick={() => {
                  setCustomerProfile({
                    name: 'Cliente Visitante',
                    email: 'visitante@bellclay.com',
                    phone: '',
                    cpf: '',
                    isGuest: false
                  });
                  setIsAuthModalOpen(false);
                }}
                className="w-full py-3 px-4 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft transition-all cursor-pointer"
              >
                Conectar com E-mail
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
