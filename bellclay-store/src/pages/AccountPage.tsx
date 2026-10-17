import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Package, Mail, Lock, Phone, FileText, CheckCircle2,
  ChevronRight, AlertCircle, LogOut, ArrowRight, Truck,
  MapPin, Building, Home, Edit3, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { getCustomerOrders, subscribeToCustomerOrders, saveOrder } from '../services/firebase';
import { createInfinitePayCheckout } from '../services/infinitePayService';
import { fetchAddressByCep } from '../services/viaCepService';
import { Order, Address } from '../types';

export const AccountPage: React.FC = () => {
  const {
    customerProfile,
    setCustomerProfile,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout
  } = useAuth();
  const { settings } = useSettings();

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCpf, setRegCpf] = useState('');

  // Edit profile state: Contact
  const [name, setName] = useState(customerProfile.name || '');
  const [email, setEmail] = useState(customerProfile.email || '');
  const [phone, setPhone] = useState(customerProfile.phone || '');
  const [cpf, setCpf] = useState(customerProfile.cpf || '');

  // Edit profile state: Address / Delivery
  const [cep, setCep] = useState(customerProfile.address?.cep || '');
  const [street, setStreet] = useState(customerProfile.address?.street || '');
  const [number, setNumber] = useState(customerProfile.address?.number || '');
  const [complement, setComplement] = useState(customerProfile.address?.complement || '');
  const [neighborhood, setNeighborhood] = useState(customerProfile.address?.neighborhood || '');
  const [city, setCity] = useState(customerProfile.address?.city || '');
  const [state, setState] = useState(customerProfile.address?.state || '');
  const [isLoadingCep, setIsLoadingCep] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

  const handleConcludePayment = async (order: Order) => {
    if (order.checkoutUrl) {
      window.location.href = order.checkoutUrl;
      return;
    }

    try {
      setProcessingOrderId(order.id);
      const infinitePayHandle = settings.infinitePayTag || 'isabela-munhoz-4sb';
      const checkoutRes = await createInfinitePayCheckout({
        handle: infinitePayHandle,
        orderId: order.id,
        customer: order.customer,
        address: order.address,
        items: order.items,
        shipping: order.shipping,
        discount: order.discount || 0,
        grandTotal: order.total
      });

      if (checkoutRes.checkoutUrl) {
        await saveOrder({
          ...order,
          checkoutUrl: checkoutRes.checkoutUrl
        });
        window.location.href = checkoutRes.checkoutUrl;
      }
    } catch (err: any) {
      console.error('Erro ao gerar link de pagamento:', err);
      alert('Não foi possível conectar ao ambiente seguro da InfinitePay. Por favor, tente novamente ou entre em contato pelo WhatsApp.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const isLoggedIn = Boolean(customerProfile.email && !customerProfile.isGuest);

  // Sync profile form fields when customerProfile updates
  useEffect(() => {
    setName(customerProfile.name || '');
    setEmail(customerProfile.email || '');
    setPhone(customerProfile.phone || '');
    setCpf(customerProfile.cpf || '');

    if (customerProfile.address) {
      setCep(customerProfile.address.cep || '');
      setStreet(customerProfile.address.street || '');
      setNumber(customerProfile.address.number || '');
      setComplement(customerProfile.address.complement || '');
      setNeighborhood(customerProfile.address.neighborhood || '');
      setCity(customerProfile.address.city || '');
      setState(customerProfile.address.state || '');
    }
  }, [
    customerProfile.name,
    customerProfile.email,
    customerProfile.phone,
    customerProfile.cpf,
    customerProfile.address
  ]);

  // Auto-populate address from latest order if profile address isn't filled yet
  useEffect(() => {
    if (!customerProfile.address?.cep && orders.length > 0) {
      const pastOrder = orders.find((o) => o.address?.cep);
      if (pastOrder?.address) {
        const a = pastOrder.address;
        setCep(a.cep || '');
        setStreet(a.street || '');
        setNumber(a.number || '');
        setComplement(a.complement || '');
        setNeighborhood(a.neighborhood || '');
        setCity(a.city || '');
        setState(a.state || '');
        setCustomerProfile((prev) => ({
          ...prev,
          address: a
        }));
      }
    }
  }, [orders, customerProfile.address]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load and subscribe to customer orders from Firestore in real time
  useEffect(() => {
    const criteria = {
      uid: customerProfile.uid,
      email: customerProfile.email,
      cpf: customerProfile.cpf
    };

    getCustomerOrders(criteria).then((fetched) => {
      setOrders(fetched);
    });

    const unsubscribe = subscribeToCustomerOrders(criteria, (liveOrders) => {
      setOrders(liveOrders);
    });

    const handleStorageUpdate = () => {
      getCustomerOrders(criteria).then((fetched) => setOrders(fetched));
    };
    window.addEventListener('bellclay_order_saved', handleStorageUpdate);
    window.addEventListener('bellclay_orders_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('bellclay_order_saved', handleStorageUpdate);
      window.removeEventListener('bellclay_orders_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [customerProfile.uid, customerProfile.email, customerProfile.cpf]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsLoading(true);
    const res = await loginWithEmail(loginEmail, loginPassword);
    setIsLoading(false);
    if (!res.success && res.error) {
      setAuthError(res.error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setAuthError('Por favor preencha todos os campos obrigatórios.');
      return;
    }
    setIsLoading(true);
    const res = await registerWithEmail(regName, regEmail, regPassword, regPhone, regCpf);
    setIsLoading(false);
    if (!res.success && res.error) {
      setAuthError(res.error);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthError(null);
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (!res.success && res.error) {
      setAuthError(res.error);
    }
  };

  const handleCepChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 8);
    const formatted = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
    setCep(formatted);
    setCepError(null);

    if (clean.length === 8) {
      setIsLoadingCep(true);
      const addr = await fetchAddressByCep(clean);
      setIsLoadingCep(false);
      if (addr && addr.uf) {
        setStreet(addr.logradouro || '');
        setNeighborhood(addr.bairro || '');
        setCity(addr.localidade || '');
        setState(addr.uf || '');
      } else {
        setCepError('CEP não encontrado. Por favor, confira o número.');
      }
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCep = cep.replace(/\D/g, '');
    const updatedAddress: Address = {
      cep: cleanCep,
      street: street.trim(),
      number: number.trim(),
      complement: complement.trim(),
      neighborhood: neighborhood.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase()
    };

    setCustomerProfile({
      ...customerProfile,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      cpf: cpf.trim(),
      address: updatedAddress,
      isGuest: false
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getStatusBadge = (status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
    const effectiveStatus = status === 'pending' && paymentStatus === 'approved' ? 'paid' : status;
    switch (effectiveStatus) {
      case 'paid':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-green/15 text-brand-green border border-brand-green/20">Pago & Confirmado</span>;
      case 'production':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">Em Modelagem & Secagem</span>;
      case 'shipped':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-pink-subtle text-brand-pink border border-brand-pink/20">Enviado / A caminho</span>;
      case 'delivered':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-brand-green text-white shadow-xs">Entregue com Sucesso</span>;
      case 'cancelled':
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">Cancelado</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#F5EFE6] text-brand-muted border border-brand-border/80">Aguardando Pagamento</span>;
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* LOGGED OUT: Professional Login & Registration Screen */}
        {!isLoggedIn ? (
          <div className="max-w-md mx-auto py-6 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-1.5">
              <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
                {authMode === 'login' ? 'Entrar na Minha Conta' : 'Criar Conta Bellclay'}
              </h1>
              <p className="text-xs sm:text-sm text-brand-muted">
                {authMode === 'login'
                  ? 'Acesse para acompanhar seus pedidos e agilizar compras'
                  : 'Cadastre-se para salvar seus dados de envio e acompanhar encomendas'}
              </p>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* Social Google Login Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-brand-border bg-white hover:bg-gray-50 text-brand-charcoal text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com o Google</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-brand-border/70" />
              <span className="text-[11px] font-semibold text-brand-muted uppercase">ou com seu e-mail</span>
              <div className="flex-1 h-px bg-brand-border/70" />
            </div>

            {/* Form */}
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Sua senha secreta"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-soft transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    Nome Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="Seu nome"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    E-mail *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="seuemail@exemplo.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="(00) 00000-0000"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-charcoal mb-1">
                      CPF
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={regCpf}
                      onChange={(e) => setRegCpf(e.target.value)}
                      className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-charcoal mb-1">
                    Senha de Acesso *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-brand-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="Mínimo 6 dígitos"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-soft transition-all cursor-pointer disabled:opacity-50 active:scale-98"
                >
                  {isLoading ? 'Cadastrando...' : 'Criar Minha Conta'}
                </button>
              </form>
            )}

            {/* Toggle between Login and Register */}
            <div className="text-center pt-2">
              {authMode === 'login' ? (
                <p className="text-xs text-brand-muted">
                  Ainda não tem conta?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                    }}
                    className="font-bold text-brand-pink hover:underline cursor-pointer"
                  >
                    Cadastre-se gratuitamente
                  </button>
                </p>
              ) : (
                <p className="text-xs text-brand-muted">
                  Já possui uma conta?{' '}
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className="font-bold text-brand-pink hover:underline cursor-pointer"
                  >
                    Fazer Login
                  </button>
                </p>
              )}
            </div>

          </div>
        ) : (
          /* LOGGED IN VIEW */
          <div className="space-y-6">
            {/* Header info */}
            <div className="border-b border-brand-border/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
                  Olá, {customerProfile.name ? customerProfile.name.split(' ')[0] : 'Cliente'}
                </h1>
                <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                  {customerProfile.email}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-brand-border text-xs font-bold text-brand-charcoal hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs: Minhas Encomendas | Dados de Envio & Contato (Same style as CartDrawer) */}
            <div className="flex border-b border-brand-border/60 bg-[#FDFBF7] shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className={`flex-1 py-3 sm:py-3.5 text-center text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'orders'
                    ? 'text-brand-pink'
                    : 'text-brand-muted hover:text-brand-charcoal'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>Minhas Encomendas ({orders.length})</span>
                {activeTab === 'orders' && (
                  <motion.div
                    layoutId="accountActiveTab"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-pink"
                  />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-3 sm:py-3.5 text-center text-xs sm:text-sm font-bold transition-all relative cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'profile'
                    ? 'text-brand-pink'
                    : 'text-brand-muted hover:text-brand-charcoal'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>Dados de Envio & Contato</span>
                {customerProfile.address?.cep && (
                  <span className="w-2 h-2 rounded-full bg-brand-green"></span>
                )}
                {activeTab === 'profile' && (
                  <motion.div
                    layoutId="accountActiveTab"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-pink"
                  />
                )}
              </button>
            </div>

            {/* Tab: Minhas Encomendas - Takes full width to phone edges on mobile */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="py-16 text-center space-y-3 bg-white sm:rounded-3xl p-8 border-y sm:border border-brand-border/60 -mx-4 sm:mx-0">
                    <Package className="w-12 h-12 text-brand-muted/60 mx-auto" />
                    <h3 className="font-serif text-lg font-bold text-brand-charcoal">
                      Nenhuma encomenda recente
                    </h3>
                    <p className="text-xs text-brand-muted max-w-sm mx-auto">
                      Suas peças artesanais encomendadas aparecerão aqui com status de produção, secagem e código de rastreamento.
                    </p>
                    <Link
                      to="/"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white text-xs font-bold shadow-soft transition-all"
                    >
                      <span>Ver Catálogo de Artesanatos</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="-mx-4 sm:mx-0 space-y-3 sm:space-y-4">
                    {orders.map((order) => {
                      const effectiveStatus = order.orderStatus === 'pending' && order.paymentStatus === 'approved' ? 'paid' : order.orderStatus;
                      const isPendingPayment = effectiveStatus === 'pending';

                      return (
                        <div
                          key={order.id}
                          className="bg-white border-y sm:border sm:border-brand-border/70 sm:rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs"
                        >
                          {/* Order Header */}
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border/40 pb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs sm:text-sm font-extrabold text-brand-charcoal tracking-wide">
                                  Pedido #{order.id}
                                </span>
                              </div>
                              <span className="text-[11px] text-brand-muted block mt-0.5">
                                Realizado em {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div>{getStatusBadge(order.orderStatus, order.paymentStatus)}</div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={`${item.product.id}-${idx}`} className="flex items-center gap-3">
                                <img
                                  src={item.product.images[0]}
                                  alt={item.product.title}
                                  className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0 border border-brand-border/60"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-xs sm:text-sm font-bold text-brand-charcoal block truncate">
                                    {item.product.title}
                                  </span>
                                  <span className="text-[11px] text-brand-muted">
                                    {item.quantity}x • R$ {((item.product.promotionalPrice || item.product.price) * item.quantity).toFixed(2).replace('.', ',')}
                                  </span>
                                  {item.customObservation && (
                                    <span className="text-[11px] text-brand-pink font-semibold block truncate">
                                      Obs: "{item.customObservation}"
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pending Payment Callout */}
                          {isPendingPayment && (
                            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-brand-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
                              <div className="text-xs space-y-0.5 text-center sm:text-left">
                                <span className="font-bold text-brand-charcoal block">Aguardando confirmação do pagamento</span>
                                <span className="text-[11px] text-brand-muted block">Pague com Pix ou Cartão para iniciar a produção artesanal</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleConcludePayment(order)}
                                disabled={processingOrderId === order.id}
                                className="w-full sm:w-auto text-center px-5 py-2.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs flex items-center justify-center gap-2 disabled:opacity-60"
                              >
                                {processingOrderId === order.id ? (
                                  <>
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    <span>Conectando...</span>
                                  </>
                                ) : (
                                  <span>Concluir Pagamento</span>
                                )}
                              </button>
                            </div>
                          )}

                          {/* Address & Shipping Footer */}
                          <div className="pt-3 border-t border-brand-border/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                            <div className="space-y-0.5">
                              <span className="text-brand-muted block">
                                Envio: <strong className="text-brand-charcoal">{order.shipping?.name || 'Padrão'}</strong>
                                {order.address?.city && (
                                  <span> para {order.address.city} - {order.address.state}</span>
                                )}
                              </span>
                              {order.trackingCode && (
                                <span className="font-mono font-bold text-brand-green flex items-center gap-1.5 mt-0.5">
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Rastreio: {order.trackingCode}</span>
                                </span>
                              )}
                            </div>
                            <div className="text-right self-end sm:self-auto">
                              <span className="text-xs text-brand-muted block">Valor total</span>
                              <span className="text-base sm:text-lg font-extrabold text-brand-charcoal">
                                R$ {order.total.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Dados de Envio & Contato */}
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  
                  {/* Section 1: Contato e Identificação */}
                  <div className="bg-white border-y sm:border sm:border-brand-border/70 sm:rounded-2xl p-4 sm:p-6 -mx-4 sm:mx-0 space-y-4 shadow-2xs">
                    <div className="border-b border-brand-border/60 pb-3">
                      <h3 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                        <User className="w-4 h-4 text-brand-pink" />
                        <span>Dados de Contato</span>
                      </h3>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Utilizados para notificações de envio e confirmação de pedidos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Seu nome completo"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          E-mail *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="seuemail@exemplo.com"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          WhatsApp / Telefone *
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(00) 00000-0000"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          CPF
                        </label>
                        <input
                          type="text"
                          value={cpf}
                          onChange={(e) => setCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Endereço de Envio (Auto-Preenchido com Checkout) */}
                  <div className="bg-white border-y sm:border sm:border-brand-border/70 sm:rounded-2xl p-4 sm:p-6 -mx-4 sm:mx-0 space-y-4 shadow-2xs">
                    <div className="border-b border-brand-border/60 pb-3">
                      <h3 className="font-serif text-lg font-bold text-brand-charcoal flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-brand-green" />
                        <span>Endereço de Envio</span>
                      </h3>
                      <p className="text-xs text-brand-muted mt-0.5">
                        Endereço padrão que será preenchido automaticamente na etapa de entrega do checkout.
                      </p>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          CEP {isLoadingCep && <span className="text-brand-pink font-normal">(Buscando endereço...)</span>}
                        </label>
                        <input
                          type="text"
                          maxLength={9}
                          value={cep}
                          onChange={(e) => handleCepChange(e.target.value)}
                          placeholder="00000-000"
                          className="w-full sm:w-1/2 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                        {cepError && (
                          <p className="text-xs text-red-500 mt-1">{cepError}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            Rua / Avenida
                          </label>
                          <input
                            type="text"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            placeholder="Nome da sua rua ou avenida"
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            Número
                          </label>
                          <input
                            type="text"
                            value={number}
                            onChange={(e) => setNumber(e.target.value)}
                            placeholder="Ex: 123"
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            Complemento (opcional)
                          </label>
                          <input
                            type="text"
                            value={complement}
                            onChange={(e) => setComplement(e.target.value)}
                            placeholder="Apto, Bloco, Casa fundos..."
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            Bairro
                          </label>
                          <input
                            type="text"
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            placeholder="Bairro"
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="Cidade"
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            Estado (UF)
                          </label>
                          <input
                            type="text"
                            maxLength={2}
                            value={state}
                            onChange={(e) => setState(e.target.value.toUpperCase())}
                            placeholder="UF"
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs uppercase"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <p className="text-xs text-brand-muted">
                      Os dados de endereço preenchidos aqui serão reutilizados automaticamente no seu checkout.
                    </p>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-soft cursor-pointer flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                      {isSaved ? <CheckCircle2 className="w-4 h-4" /> : null}
                      <span>{isSaved ? 'Dados Salvos com Sucesso!' : 'Salvar Alterações'}</span>
                    </button>
                  </div>

                </form>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
