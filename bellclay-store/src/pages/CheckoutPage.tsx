import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, ArrowLeft, ArrowRight, Check, CheckCircle2,
  Truck, User, MapPin, CreditCard, QrCode, FileText,
  Copy, ExternalLink, MessageCircle, AlertCircle, ShoppingBag, Edit3
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { fetchAddressByCep } from '../services/viaCepService';
import {
  generatePixPayment,
  generateBoletoPayment,
  calculateInstallments,
  detectCardBrand,
  PixPaymentResult
} from '../services/mercadoPagoService';
import { saveOrder, trackEvent } from '../services/firebase';
import { Order, ShippingOption } from '../types';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const {
    items,
    subtotal,
    selectedShipping,
    setSelectedShipping,
    shippingOptions,
    calculateFreight,
    clearCart
  } = useCart();
  const { customerProfile, setCustomerProfile } = useAuth();

  // Steps: 1: Contato, 2: Endereço, 3: Envio, 4: Pagamento & Revisão, 5: Sucesso
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');

  // Step 1: Customer Contact Form
  const [name, setName] = useState(customerProfile.name || '');
  const [email, setEmail] = useState(customerProfile.email || '');
  const [phone, setPhone] = useState(customerProfile.phone || '');
  const [cpf, setCpf] = useState(customerProfile.cpf || '');
  const [isEditingContact, setIsEditingContact] = useState(false);

  // If customer has saved data, default to abbreviated view
  const hasSavedContact = Boolean(customerProfile.name && customerProfile.email && customerProfile.phone);

  // Step 2: Address Form
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Step 4: Credit Card Form
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  // Results & Outputs
  const [pixResult, setPixResult] = useState<PixPaymentResult | null>(null);
  const [boletoResult, setBoletoResult] = useState<any>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Timer for Pix expiration (30 mins)
  const [pixTimeRemaining, setPixTimeRemaining] = useState(1800);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  useEffect(() => {
    if (currentStep === 5 && pixResult) {
      const interval = setInterval(() => {
        setPixTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, pixResult]);

  // Handle CEP Lookup
  const handleCepChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 8);
    const formatted = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
    setCep(formatted);

    if (clean.length === 8) {
      setIsLoadingAddress(true);
      setErrorMessage(null);
      const addr = await fetchAddressByCep(clean);
      setIsLoadingAddress(false);
      if (addr && addr.uf) {
        setStreet(addr.logradouro || '');
        setNeighborhood(addr.bairro || '');
        setCity(addr.localidade || '');
        setState(addr.uf || '');
        calculateFreight(clean);
      } else {
        setErrorMessage('CEP não encontrado. Por favor verifique o número.');
      }
    }
  };

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const pixDiscount = paymentMethod === 'pix' ? subtotal * 0.05 : 0;
  const grandTotal = Math.max(0, subtotal - pixDiscount + shippingCost);
  const installmentOptions = calculateInstallments(grandTotal);

  // Step 1 Validation & Save
  const validateStep1 = () => {
    setErrorMessage(null);
    if (!name.trim()) {
      setErrorMessage('Por favor informe seu nome completo.');
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setErrorMessage('Por favor informe um e-mail válido.');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Por favor informe um telefone ou WhatsApp válido com DDD.');
      return false;
    }
    if (cpf.replace(/\D/g, '').length < 11) {
      setErrorMessage('Por favor informe seu CPF para envio do pedido.');
      return false;
    }

    // Save profile to context and local storage automatically
    setCustomerProfile((prev) => ({
      ...prev,
      name,
      email,
      phone,
      cpf
    }));

    return true;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    setErrorMessage(null);
    if (cep.replace(/\D/g, '').length !== 8) {
      setErrorMessage('Por favor informe um CEP válido com 8 dígitos.');
      return false;
    }
    if (!street.trim()) {
      setErrorMessage('Por favor informe o endereço / rua.');
      return false;
    }
    if (!number.trim()) {
      setErrorMessage('Por favor informe o número do imóvel.');
      return false;
    }
    if (!neighborhood.trim()) {
      setErrorMessage('Por favor informe o bairro.');
      return false;
    }
    if (!city.trim() || !state.trim()) {
      setErrorMessage('Por favor informe a cidade e o estado.');
      return false;
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = () => {
    setErrorMessage(null);
    if (!selectedShipping) {
      setErrorMessage('Por favor selecione uma opção de frete para continuar.');
      return false;
    }
    return true;
  };

  // Step 4: Finalize & Process Payment
  const handleFinalizeOrder = async () => {
    setErrorMessage(null);

    if (paymentMethod === 'credit_card') {
      const cleanNum = cardNumber.replace(/\D/g, '');
      if (cleanNum.length < 13) {
        setErrorMessage('Por favor informe um número de cartão de crédito válido.');
        return;
      }
      if (!cardName.trim()) {
        setErrorMessage('Por favor informe o nome impresso no cartão.');
        return;
      }
      if (!cardExpiry.includes('/') || cardExpiry.replace(/\D/g, '').length < 4) {
        setErrorMessage('Por favor informe a validade do cartão (MM/AA).');
        return;
      }
      if (cardCvv.replace(/\D/g, '').length < 3) {
        setErrorMessage('Por favor informe o código de segurança (CVV).');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const orderId = `BC-${Date.now().toString().slice(-6)}`;
      
      const newOrder: Order = {
        id: orderId,
        customer: { name, email, phone, cpf },
        address: {
          cep: cep.replace(/\D/g, ''),
          street,
          number,
          complement,
          neighborhood,
          city,
          state
        },
        items: [...items],
        shipping: selectedShipping!,
        subtotal,
        discount: pixDiscount,
        shippingCost,
        total: grandTotal,
        paymentMethod,
        paymentStatus: paymentMethod === 'credit_card' ? 'approved' : 'pending',
        orderStatus: paymentMethod === 'credit_card' ? 'paid' : 'pending',
        createdAt: new Date().toISOString()
      };

      if (paymentMethod === 'pix') {
        const pixData = generatePixPayment(orderId, grandTotal, name);
        setPixResult(pixData);
      } else if (paymentMethod === 'boleto') {
        const boletoData = generateBoletoPayment(orderId, grandTotal);
        setBoletoResult(boletoData);
      }

      // Persist in Firebase Firestore
      await saveOrder(newOrder);

      // Track metric
      await trackEvent('checkout_completed', {
        orderId,
        total: grandTotal,
        paymentMethod
      });

      // Save to local storage for "Meus Pedidos"
      try {
        const existing = JSON.parse(localStorage.getItem('bellclay_orders') || '[]');
        localStorage.setItem('bellclay_orders', JSON.stringify([newOrder, ...existing]));
      } catch {}

      setCompletedOrder(newOrder);
      setCurrentStep(5);
      clearCart();

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e95f71', '#83bc5c', '#f58091', '#4ade80']
      });

    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      setErrorMessage('Houve um erro ao processar seu pedido. Por favor tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyPixCode = () => {
    if (pixResult?.pixCopiaECola) {
      navigator.clipboard.writeText(pixResult.pixCopiaECola);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const formatPixMinutes = () => {
    const mins = Math.floor(pixTimeRemaining / 60);
    const secs = pixTimeRemaining % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Empty Cart State
  if (items.length === 0 && currentStep !== 5) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-center items-center px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-brand-pink-subtle flex items-center justify-center text-brand-pink mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="font-serif text-2xl font-bold text-brand-charcoal">Seu carrinho está vazio</h1>
        <p className="text-sm text-brand-muted max-w-sm">
          Adicione seus artesanatos favoritos em cerâmica fria antes de ir para a etapa de pagamento!
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-pink text-white font-bold text-xs shadow-pink-soft hover:shadow-soft-hover transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Clean, Proportionate Checkout Header */}
      <header className="bg-white border-b border-brand-border/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
          <Link to="/" className="flex items-center transition-transform hover:scale-105 duration-200">
            <img src="/bellclay_logo.png" alt="Bellclay" className="h-8 sm:h-9 w-auto object-contain" />
          </Link>

          <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal/80 bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-brand-border/60">
            <ShieldCheck className="w-4 h-4 text-brand-green" />
            <span>Checkout Seguro</span>
            <span className="text-[10px] text-brand-muted hidden sm:inline">• SSL 256-Bit</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full">
        
        {/* Step Indicator (Only for steps 1 to 4) */}
        {currentStep < 5 && (
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { num: 1, label: 'Contato', icon: User },
                { num: 2, label: 'Endereço', icon: MapPin },
                { num: 3, label: 'Envio', icon: Truck },
                { num: 4, label: 'Pagamento', icon: CreditCard }
              ].map((s) => {
                const Icon = s.icon;
                const isPassed = currentStep > s.num;
                const isCurrent = currentStep === s.num;
                return (
                  <div key={s.num} className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                        isPassed
                          ? 'bg-brand-green text-white shadow-xs'
                          : isCurrent
                          ? 'bg-brand-pink text-white ring-4 ring-brand-pink/20 shadow-xs'
                          : 'bg-[#F2ECE1] text-brand-muted'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold mt-1.5 ${
                        isCurrent ? 'text-brand-charcoal font-bold' : 'text-brand-muted'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
            
            {/* Progress line */}
            <div className="relative mt-3 h-1 bg-[#EBE3D5] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-pink to-brand-green"
                initial={false}
                animate={{ width: `${((currentStep - 1) / 3) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-6 max-w-2xl mx-auto p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Layout: Clean borderless form on Left, Order Summary on Right (Desktop) */}
        {currentStep < 5 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* Left Steps Column - NO card border box */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* STEP 1: Contato */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
                      1. Identificação e Contato
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                      Para envio de confirmação e declaração postal.
                    </p>
                  </div>

                  {/* If user has saved contact and is not in editing mode, show abbreviated view */}
                  {hasSavedContact && !isEditingContact ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-[#F6F2E9] flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-brand-pink/20 text-brand-pink font-bold flex items-center justify-center shrink-0">
                            {name[0]?.toUpperCase() || 'C'}
                          </div>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-brand-charcoal block truncate">
                              {name}
                            </span>
                            <span className="text-xs text-brand-muted block truncate">
                              {email} • {phone}
                            </span>
                            {cpf && (
                              <span className="text-[11px] text-brand-muted block truncate">
                                CPF: {cpf}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsEditingContact(true)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-brand-pink hover:underline shrink-0 p-1 cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Alterar</span>
                        </button>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            if (validateStep1()) setCurrentStep(2);
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-xs sm:text-sm shadow-pink-soft cursor-pointer transition-all"
                        >
                          <span>Confirmar & Ir para Endereço</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Full Editable Inputs */
                    <div className="space-y-4">
                      {hasSavedContact && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsEditingContact(false)}
                            className="text-xs font-semibold text-brand-muted hover:text-brand-charcoal"
                          >
                            Cancelar edição
                          </button>
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: Mariana Silva"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            E-mail *
                          </label>
                          <input
                            type="email"
                            placeholder="seuemail@exemplo.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            WhatsApp / Telefone *
                          </label>
                          <input
                            type="text"
                            placeholder="(00) 00000-0000"
                            value={phone}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                              const formatted = v.length > 6
                                ? `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
                                : v.length > 2
                                ? `(${v.slice(0, 2)}) ${v.slice(2)}`
                                : v;
                              setPhone(formatted);
                            }}
                            className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          CPF (exigido para envio postal) *
                        </label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={cpf}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 11);
                            const formatted = v.length > 9
                              ? `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
                              : v.length > 6
                              ? `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
                              : v.length > 3
                              ? `${v.slice(0, 3)}.${v.slice(3)}`
                              : v;
                            setCpf(formatted);
                          }}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          onClick={() => {
                            if (validateStep1()) {
                              setIsEditingContact(false);
                              setCurrentStep(2);
                            }
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-xs sm:text-sm shadow-pink-soft cursor-pointer transition-all"
                        >
                          <span>Salvar & Ir para Endereço</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* STEP 2: Endereço */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
                      2. Endereço de Entrega
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                      Informe seu CEP para preencher o endereço automaticamente.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-brand-charcoal mb-1">
                        CEP * {isLoadingAddress && <span className="text-brand-pink font-normal">(Buscando...)</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="00000-000"
                        maxLength={9}
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className="w-full sm:w-1/2 text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Rua / Avenida *
                        </label>
                        <input
                          type="text"
                          placeholder="Nome da sua rua"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Número *
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: 123"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
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
                          placeholder="Apto, Bloco, Casa fundos..."
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Bairro *
                        </label>
                        <input
                          type="text"
                          placeholder="Bairro"
                          value={neighborhood}
                          onChange={(e) => setNeighborhood(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Cidade *
                        </label>
                        <input
                          type="text"
                          placeholder="Cidade"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Estado *
                        </label>
                        <input
                          type="text"
                          placeholder="UF"
                          maxLength={2}
                          value={state}
                          onChange={(e) => setState(e.target.value.toUpperCase())}
                          className="w-full text-xs sm:text-sm px-3.5 py-3 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-brand-charcoal hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (validateStep2()) {
                          calculateFreight(cep.replace(/\D/g, ''));
                          setCurrentStep(3);
                        }
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-xs sm:text-sm shadow-pink-soft cursor-pointer transition-all"
                    >
                      <span>Escolher Opção de Frete</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Opções de Envio */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
                      3. Escolha a Opção de Envio
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                      Destino: <strong>{city} - {state}</strong> • Origem: <strong>Campo Mourão - PR</strong>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {shippingOptions.length === 0 ? (
                      <div className="p-6 text-center bg-[#FAF8F5] rounded-2xl border border-brand-border space-y-2">
                        <Truck className="w-8 h-8 text-brand-pink mx-auto" />
                        <p className="text-xs font-bold text-brand-charcoal">Calculando as opções de frete...</p>
                        <button
                          onClick={() => calculateFreight(cep.replace(/\D/g, ''))}
                          className="text-xs text-brand-pink font-semibold underline"
                        >
                          Recalcular frete
                        </button>
                      </div>
                    ) : (
                      shippingOptions.map((opt) => {
                        const isSelected = selectedShipping?.id === opt.id;
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-brand-pink bg-brand-pink-subtle/40 shadow-xs'
                                : 'border-brand-border/70 hover:border-brand-pink/40 bg-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="shipping_option"
                                checked={isSelected}
                                onChange={() => setSelectedShipping(opt)}
                                className="w-4 h-4 text-brand-pink focus:ring-brand-pink"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs sm:text-sm font-bold text-brand-charcoal">
                                    {opt.name}
                                  </span>
                                  {opt.badge && (
                                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-brand-green text-white">
                                      {opt.badge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-brand-muted block mt-0.5">
                                  {opt.company} • Entrega em cerca de {opt.deliveryDays} {opt.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-extrabold text-brand-charcoal">
                                {opt.price === 0 ? (
                                  <span className="text-brand-green font-bold">Grátis</span>
                                ) : (
                                  `R$ ${opt.price.toFixed(2).replace('.', ',')}`
                                )}
                              </span>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-brand-charcoal hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>

                    <button
                      onClick={() => {
                        if (validateStep3()) setCurrentStep(4);
                      }}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-xs sm:text-sm shadow-pink-soft cursor-pointer transition-all"
                    >
                      <span>Revisão e Pagamento</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Pagamento & Revisão */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
                      4. Forma de Pagamento
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                      Transação 100% protegida via Mercado Pago.
                    </p>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'border-brand-green bg-brand-green-subtle/50 text-brand-green shadow-xs'
                          : 'border-brand-border/60 hover:border-gray-300 bg-white text-brand-muted'
                      }`}
                    >
                      <QrCode className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold text-brand-charcoal">Pix</span>
                      <span className="text-[10px] text-brand-green font-bold">5% OFF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'credit_card'
                          ? 'border-brand-pink bg-brand-pink-subtle/50 text-brand-pink shadow-xs'
                          : 'border-brand-border/60 hover:border-gray-300 bg-white text-brand-muted'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold text-brand-charcoal">Cartão</span>
                      <span className="text-[10px] text-brand-muted">Até 12x</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('boleto')}
                      className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'boleto'
                          ? 'border-brand-pink bg-brand-pink-subtle/50 text-brand-pink shadow-xs'
                          : 'border-brand-border/60 hover:border-gray-300 bg-white text-brand-muted'
                      }`}
                    >
                      <FileText className="w-6 h-6 mb-1.5" />
                      <span className="text-xs font-bold text-brand-charcoal">Boleto</span>
                      <span className="text-[10px] text-brand-muted">1-3 dias</span>
                    </button>
                  </div>

                  {/* Pix Info Box */}
                  {paymentMethod === 'pix' && (
                    <div className="p-4 rounded-2xl bg-brand-green-subtle/40 border border-brand-green/30 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-green">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Aprovação Imediata + Desconto de 5%</span>
                      </div>
                      <p className="text-xs text-brand-charcoal/80 leading-relaxed">
                        Ao clicar em Concluir Pedido, você receberá o QR Code e o código Pix Copia e Cola para pagar no app do seu banco com validade de 30 minutos.
                      </p>
                    </div>
                  )}

                  {/* Credit Card Form */}
                  {paymentMethod === 'credit_card' && (
                    <div className="space-y-4 p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60">
                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Número do Cartão *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="0000 0000 0000 0000"
                            maxLength={19}
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                              setCardNumber(v.replace(/(\d{4})(?=\d)/g, '$1 '));
                            }}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold uppercase text-brand-muted bg-gray-100 px-2 py-0.5 rounded">
                            {detectCardBrand(cardNumber)}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Nome impresso no Cartão *
                        </label>
                        <input
                          type="text"
                          placeholder="Como está gravado no cartão"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            Validade (MM/AA) *
                          </label>
                          <input
                            type="text"
                            placeholder="MM/AA"
                            maxLength={5}
                            value={cardExpiry}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                              setCardExpiry(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v);
                            }}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-charcoal mb-1">
                            CVV *
                          </label>
                          <input
                            type="text"
                            placeholder="123"
                            maxLength={4}
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-charcoal mb-1">
                          Parcelas *
                        </label>
                        <select
                          value={installments}
                          onChange={(e) => setInstallments(Number(e.target.value))}
                          className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white"
                        >
                          {installmentOptions.map((opt) => (
                            <option key={opt.installments} value={opt.installments}>
                              {opt.text}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Boleto Info Box */}
                  {paymentMethod === 'boleto' && (
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60 space-y-2">
                      <p className="text-xs text-brand-charcoal/80 leading-relaxed">
                        Ao finalizar, você receberá a linha digitável do boleto para pagamento em qualquer banco ou lotérica com vencimento em até 3 dias úteis.
                      </p>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-brand-charcoal hover:bg-gray-100 text-xs font-bold transition-all cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Voltar</span>
                    </button>

                    <button
                      onClick={handleFinalizeOrder}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm shadow-green-soft cursor-pointer transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <span>Processando...</span>
                      ) : (
                        <>
                          <span>Concluir Pedido</span>
                          <Check className="w-4 h-4 stroke-[3]" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Order Summary Column - Soft warm background, zero card border */}
            <div className="lg:col-span-5 bg-[#F8F5EE] p-5 sm:p-7 rounded-2xl sm:rounded-3xl space-y-4">
              <h3 className="font-serif text-lg font-bold text-brand-charcoal border-b border-brand-border/60 pb-3">
                Resumo da Compra ({items.length} {items.length === 1 ? 'item' : 'itens'})
              </h3>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => {
                  const p = item.product.promotionalPrice || item.product.price;
                  return (
                    <div key={item.product.id} className="flex gap-3 items-center">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        className="w-12 h-12 rounded-xl object-cover bg-white shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-bold text-brand-charcoal truncate block">
                          {item.product.title}
                        </span>
                        <span className="text-[11px] text-brand-muted">
                          Qtd: {item.quantity} × R$ {p.toFixed(2).replace('.', ',')}
                        </span>
                        {item.customObservation && (
                          <span className="text-[10px] text-brand-muted italic block truncate">
                            Obs: {item.customObservation}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-brand-charcoal">
                        R$ {(p * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-brand-border/60 pt-3 space-y-2 text-xs">
                <div className="flex justify-between text-brand-muted">
                  <span>Subtotal</span>
                  <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                </div>

                {paymentMethod === 'pix' && pixDiscount > 0 && (
                  <div className="flex justify-between text-brand-green font-semibold">
                    <span>Desconto Pix (5%)</span>
                    <span>- R$ {pixDiscount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex justify-between text-brand-muted">
                  <span>Frete ({selectedShipping ? selectedShipping.name : 'A calcular'})</span>
                  <span>
                    {selectedShipping ? (
                      selectedShipping.price === 0 ? (
                        <strong className="text-brand-green">Grátis</strong>
                      ) : (
                        `R$ ${selectedShipping.price.toFixed(2).replace('.', ',')}`
                      )
                    ) : (
                      <span className="italic">Etapa 3</span>
                    )}
                  </span>
                </div>

                <div className="border-t border-brand-border/60 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-brand-charcoal">Total Final</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-brand-pink tracking-tight">
                      R$ {grandTotal.toFixed(2).replace('.', ',')}
                    </span>
                    {paymentMethod === 'credit_card' && (
                      <span className="text-[10px] text-brand-muted block">
                        ou até 12x no cartão
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Trust assurance */}
              <div className="pt-3 border-t border-brand-border/40 text-[11px] text-brand-muted space-y-1">
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />
                  <span>Peças modeladas à mão em cerâmica fria</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
                  <span>Garantia de entrega perfeita até sua casa</span>
                </p>
              </div>
            </div>

          </div>
        ) : (
          /* STEP 5: Sucesso / Pedido Confirmado */
          <div className="max-w-xl mx-auto py-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-green/15 text-brand-green flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-green">
                Pedido Realizado com Sucesso!
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
                Obrigado pelo seu carinho, {name.split(' ')[0]}!
              </h2>
              <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto">
                Seu pedido foi registrado com o identificador:
              </p>
              <div className="inline-block px-4 py-1.5 rounded-full bg-brand-pink-subtle text-brand-pink font-mono font-bold text-sm">
                #{completedOrder?.id}
              </div>
            </div>

            {/* Pix Output Display */}
            {paymentMethod === 'pix' && pixResult && (
              <div className="p-5 rounded-2xl bg-[#F6F2E9] space-y-4 max-w-md mx-auto text-left">
                <div className="flex items-center justify-between text-xs font-bold text-brand-charcoal">
                  <span>Pague via Pix em até {formatPixMinutes()}</span>
                  <span className="text-brand-green">R$ {grandTotal.toFixed(2).replace('.', ',')}</span>
                </div>

                <div className="flex justify-center py-2">
                  <img
                    src={pixResult.qrCodeUrl}
                    alt="QR Code Pix"
                    className="w-48 h-48 rounded-2xl border-2 border-brand-border bg-white p-2 shadow-2xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-brand-muted block">
                    Código Pix Copia e Cola:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixResult.pixCopiaECola}
                      className="flex-1 text-[11px] font-mono p-2.5 rounded-xl border border-brand-border bg-white select-all"
                    />
                    <button
                      onClick={copyPixCode}
                      className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Boleto Output */}
            {paymentMethod === 'boleto' && boletoResult && (
              <div className="p-5 rounded-2xl bg-[#F6F2E9] space-y-3 max-w-md mx-auto text-left">
                <span className="text-xs font-bold text-brand-charcoal block">
                  Linha Digitável do Boleto:
                </span>
                <div className="p-2.5 rounded-xl bg-white border border-brand-border text-xs font-mono break-all">
                  {boletoResult.digitableLine}
                </div>
                <a
                  href={boletoResult.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-charcoal text-white text-xs font-bold hover:bg-black transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Imprimir Boleto Bancário</span>
                </a>
              </div>
            )}

            {/* WhatsApp Confirmation CTA - WITHOUT phone number in button */}
            <div className="pt-2 max-w-md mx-auto space-y-3">
              <a
                href={`https://wa.me/5544991074932?text=${encodeURIComponent(
                  `Olá Bellclay! Acabei de fazer o pedido #${completedOrder?.id} no site no valor de R$ ${grandTotal.toFixed(2).replace('.', ',')} e gostaria de acompanhar a produção!`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs sm:text-sm shadow-green-soft transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Confirmar Pedido no WhatsApp</span>
              </a>

              <Link
                to="/"
                className="inline-block text-xs font-bold text-brand-charcoal hover:text-brand-pink transition-colors py-1"
              >
                Voltar à Página Inicial
              </Link>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
