import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  X, Check, ShieldCheck, ArrowRight, Truck, QrCode, CreditCard,
  FileText, Copy, ExternalLink, MessageCircle, AlertCircle, Sparkles, CheckCircle2
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
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

  // Form states
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card' | 'boleto'>('pix');

  // Customer info
  const [name, setName] = useState(customerProfile.name || '');
  const [email, setEmail] = useState(customerProfile.email || '');
  const [phone, setPhone] = useState(customerProfile.phone || '');
  const [cpf, setCpf] = useState(customerProfile.cpf || '');

  // Address info
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Credit Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState(1);

  // Generated payment outputs
  const [pixResult, setPixResult] = useState<PixPaymentResult | null>(null);
  const [boletoResult, setBoletoResult] = useState<any>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // CEP Auto-complete
  const handleCepChange = async (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 8);
    const formatted = clean.length > 5 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
    setCep(formatted);

    if (clean.length === 8) {
      setIsLoadingAddress(true);
      const addr = await fetchAddressByCep(clean);
      setIsLoadingAddress(false);
      if (addr) {
        setStreet(addr.logradouro || '');
        setNeighborhood(addr.bairro || '');
        setCity(addr.localidade || '');
        setState(addr.uf || '');
        calculateFreight(clean);
      }
    }
  };

  const shippingCost = selectedShipping ? selectedShipping.price : 0;
  const grandTotal = subtotal + shippingCost;
  const installmentOptions = calculateInstallments(grandTotal);

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setFormError('Por favor informe seu nome completo.');
      return false;
    }
    if (!email.includes('@')) {
      setFormError('Por favor informe um e-mail válido.');
      return false;
    }
    if (phone.replace(/\D/g, '').length < 10) {
      setFormError('Por favor informe um WhatsApp válido.');
      return false;
    }
    if (cpf.replace(/\D/g, '').length < 11) {
      setFormError('Por favor informe o CPF para emissão e envio.');
      return false;
    }
    if (cep.replace(/\D/g, '').length !== 8 || !street.trim() || !number.trim() || !city.trim()) {
      setFormError('Por favor preencha todos os dados de entrega.');
      return false;
    }
    if (!selectedShipping) {
      setFormError('Por favor escolha uma opção de frete.');
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleGoToPayment = () => {
    if (!validateForm()) return;

    // Save profile locally
    setCustomerProfile(prev => ({
      ...prev,
      name,
      email,
      phone,
      cpf
    }));

    trackEvent('begin_checkout', { subtotal, grandTotal, itemsCount: items.length });

    // Generate Payment previews
    const orderId = `BELL-${Date.now().toString().slice(-6)}`;
    const pix = generatePixPayment(orderId, grandTotal, name);
    const boleto = generateBoletoPayment(orderId, grandTotal);
    setPixResult(pix);
    setBoletoResult(boleto);

    setStep('payment');
  };

  const handleFinishOrder = async (confirmedStatus: 'paid' | 'pending' = 'pending') => {
    setIsProcessing(true);

    const orderId = `BC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newOrder: Order = {
      id: orderId,
      customer: {
        name,
        email,
        phone,
        cpf
      },
      address: {
        cep,
        street,
        number,
        complement,
        neighborhood,
        city,
        state
      },
      items: [...items],
      shipping: selectedShipping || {
        id: 'default',
        name: 'Entrega Padrão',
        company: 'Correios',
        price: shippingCost,
        deliveryDays: 5
      },
      subtotal,
      discount: 0,
      shippingCost,
      total: grandTotal,
      paymentMethod,
      paymentStatus: confirmedStatus === 'paid' ? 'approved' : 'pending',
      orderStatus: confirmedStatus === 'paid' ? 'paid' : 'pending',
      createdAt: new Date().toISOString()
    };

    await saveOrder(newOrder);
    setCompletedOrder(newOrder);
    clearCart();

    trackEvent('purchase', {
      orderId: newOrder.id,
      total: newOrder.total,
      paymentMethod: newOrder.paymentMethod
    });

    setIsProcessing(false);
    setStep('success');

    // Confetti explosion
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {}
  };

  const copyPixCode = () => {
    if (pixResult?.pixCopiaECola) {
      navigator.clipboard.writeText(pixResult.pixCopiaECola);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-brand-charcoal/40 backdrop-blur-md transition-opacity"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-brand-border/80 overflow-hidden z-10 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-brand-border/60 flex items-center justify-between bg-[#FDFBF7]">
          <div>
            <h2 className="font-serif text-xl font-bold text-brand-charcoal flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-green" />
              <span>Checkout Seguro Bellclay</span>
            </h2>
            <p className="text-xs text-brand-muted">
              Ambiente protegido com Mercado Pago & Envio Rastreado
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-brand-pink-subtle/50 text-brand-charcoal transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* STEP 1: FORM */}
          {step === 'form' && (
            <div className="space-y-6">
              {/* Section 1: Customer Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3">
                  1. Seus Dados de Contato
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      placeholder="Ex: Amanda Silva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">E-mail *</label>
                    <input
                      type="email"
                      placeholder="amanda@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">WhatsApp / Telefone *</label>
                    <input
                      type="tel"
                      placeholder="(44) 99999-8888"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">CPF (para envio e NF) *</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Delivery Address */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center justify-between">
                  <span>2. Endereço de Entrega</span>
                  {isLoadingAddress && <span className="text-[11px] text-brand-pink normal-case font-normal">Buscando CEP...</span>}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">CEP *</label>
                    <input
                      type="text"
                      maxLength={9}
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => handleCepChange(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">Rua / Logradouro *</label>
                    <input
                      type="text"
                      placeholder="Rua das Flores"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">Número *</label>
                    <input
                      type="text"
                      placeholder="123"
                      value={number}
                      onChange={(e) => setNumber(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">Complemento</label>
                    <input
                      type="text"
                      placeholder="Apto 102, Bloco B"
                      value={complement}
                      onChange={(e) => setComplement(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">Bairro *</label>
                    <input
                      type="text"
                      placeholder="Centro"
                      value={neighborhood}
                      onChange={(e) => setNeighborhood(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">Cidade *</label>
                    <input
                      type="text"
                      placeholder="Campo Mourão"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-brand-charcoal mb-1">Estado (UF) *</label>
                    <input
                      type="text"
                      placeholder="PR"
                      maxLength={2}
                      value={state}
                      onChange={(e) => setState(e.target.value.toUpperCase())}
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Shipping Option selection */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-brand-pink" />
                  <span>3. Opções de Envio Disponíveis</span>
                </h3>
                {shippingOptions.length === 0 ? (
                  <p className="text-xs text-brand-muted italic bg-[#FAF7F2] p-3 rounded-xl border border-brand-border">
                    Informe o seu CEP acima para visualizar as cotações de envio.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {shippingOptions.map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                          selectedShipping?.id === opt.id
                            ? 'border-brand-pink bg-brand-pink-light/50 shadow-xs'
                            : 'border-brand-border bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="checkout_shipping"
                            checked={selectedShipping?.id === opt.id}
                            onChange={() => setSelectedShipping(opt)}
                            className="text-brand-pink focus:ring-brand-pink"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-brand-charcoal">{opt.name}</span>
                              {opt.badge && (
                                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                                  opt.badge === 'Grátis' ? 'bg-brand-green text-white' : 'bg-brand-pink text-white'
                                }`}>
                                  {opt.badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-brand-muted">
                              Chega em cerca de {opt.deliveryDays} {opt.deliveryDays === 1 ? 'dia útil' : 'dias úteis'}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-brand-charcoal">
                          {opt.price === 0 ? <span className="text-brand-green font-extrabold">Grátis</span> : `R$ ${opt.price.toFixed(2).replace('.', ',')}`}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Order preview & Next button */}
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-brand-border/60 flex items-center justify-between">
                <div>
                  <span className="text-xs text-brand-muted block">Total com envio:</span>
                  <span className="text-lg font-extrabold text-brand-pink">
                    R$ {grandTotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                <button
                  onClick={handleGoToPayment}
                  className="px-6 py-3 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white font-bold text-xs shadow-pink-soft hover:shadow-soft-hover transition-all duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <span>Ir para Pagamento</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT WITH MERCADO PAGO */}
          {step === 'payment' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-2 border-b border-brand-border/60">
                <button
                  onClick={() => setStep('form')}
                  className="text-xs text-brand-muted hover:text-brand-charcoal underline cursor-pointer"
                >
                  ← Voltar para dados de entrega
                </button>
                <span className="text-xs font-bold text-brand-charcoal">
                  Total: <strong className="text-brand-pink font-extrabold">R$ {grandTotal.toFixed(2).replace('.', ',')}</strong>
                </span>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'pix'
                      ? 'border-brand-pink bg-brand-pink-light text-brand-pink font-bold shadow-xs'
                      : 'border-brand-border bg-white text-brand-muted hover:border-brand-pink/30'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs">PIX Instantâneo</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'credit_card'
                      ? 'border-brand-pink bg-brand-pink-light text-brand-pink font-bold shadow-xs'
                      : 'border-brand-border bg-white text-brand-muted hover:border-brand-pink/30'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs">Cartão de Crédito</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('boleto')}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'boleto'
                      ? 'border-brand-pink bg-brand-pink-light text-brand-pink font-bold shadow-xs'
                      : 'border-brand-border bg-white text-brand-muted hover:border-brand-pink/30'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-xs">Boleto Bancário</span>
                </button>
              </div>

              {/* PIX TAB */}
              {paymentMethod === 'pix' && pixResult && (
                <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-brand-border/60 text-center space-y-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-brand-green font-bold bg-brand-green-subtle px-3 py-1 rounded-full mb-3">
                      Aprovação Imediata via Mercado Pago
                    </span>
                    <div className="p-3 bg-white rounded-2xl shadow-md border border-brand-border">
                      <img
                        src={pixResult.qrCodeUrl}
                        alt="QR Code Pix"
                        className="w-44 h-44 object-contain"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                      Código Pix Copia e Cola:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={pixResult.pixCopiaECola}
                        className="flex-1 text-[11px] px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-muted font-mono"
                      />
                      <button
                        onClick={copyPixCode}
                        className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{isCopied ? 'Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-brand-muted max-w-sm mx-auto">
                    Abra o app do seu banco, escolha <strong>Pix &gt; Pagar com QR Code ou Copia e Cola</strong> e confirme o pagamento.
                  </p>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={() => handleFinishOrder('paid')}
                      disabled={isProcessing}
                      className="px-6 py-3 rounded-full bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold shadow-green-soft hover:shadow-soft-hover transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isProcessing ? 'Verificando...' : 'Confirmar / Simular Pagamento Aprovado'}</span>
                    </button>
                    <button
                      onClick={() => handleFinishOrder('pending')}
                      disabled={isProcessing}
                      className="px-5 py-3 rounded-full bg-white hover:bg-gray-50 text-brand-charcoal text-xs font-semibold border border-brand-border transition-all cursor-pointer"
                    >
                      Finalizar Pedido (Pagar Depois)
                    </button>
                  </div>
                </div>
              )}

              {/* CREDIT CARD TAB */}
              {paymentMethod === 'credit_card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-brand-charcoal mb-1 flex items-center justify-between">
                        <span>Número do Cartão *</span>
                        <span className="text-[10px] text-brand-pink uppercase font-bold">
                          {detectCardBrand(cardNumber)}
                        </span>
                      </label>
                      <input
                        type="text"
                        maxLength={19}
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-brand-charcoal mb-1">Nome no Cartão (como impresso) *</label>
                      <input
                        type="text"
                        placeholder="AMANDA SILVA"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-charcoal mb-1">Validade (MM/AA) *</label>
                      <input
                        type="text"
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-brand-charcoal mb-1">CVV / Código de Segurança *</label>
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-brand-charcoal mb-1">Parcelamento *</label>
                      <select
                        value={installments}
                        onChange={(e) => setInstallments(Number(e.target.value))}
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink focus:ring-1 focus:ring-brand-pink outline-hidden bg-[#FAF7F2]"
                      >
                        {installmentOptions.map((opt) => (
                          <option key={opt.installments} value={opt.installments}>
                            {opt.text}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFinishOrder('paid')}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold shadow-green-soft hover:shadow-soft-hover transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{isProcessing ? 'Processando com Mercado Pago...' : `Pagar R$ ${grandTotal.toFixed(2).replace('.', ',')}`}</span>
                  </button>
                </div>
              )}

              {/* BOLETO TAB */}
              {paymentMethod === 'boleto' && boletoResult && (
                <div className="p-5 rounded-3xl bg-[#FAF8F5] border border-brand-border/60 space-y-4">
                  <div className="text-center">
                    <span className="text-xs text-brand-charcoal font-bold">
                      Vencimento em {boletoResult.dueDate}
                    </span>
                    <p className="text-[11px] text-brand-muted mt-1">
                      O boleto pode levar de 1 a 2 dias úteis para compensar.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-brand-charcoal mb-1">
                      Linha Digitável:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={boletoResult.digitableLine}
                        className="flex-1 text-[11px] px-3 py-2 rounded-xl bg-white border border-brand-border text-brand-muted font-mono"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(boletoResult.digitableLine);
                          setIsCopied(true);
                          setTimeout(() => setIsCopied(false), 2000);
                        }}
                        className="px-4 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                      >
                        {isCopied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFinishOrder('pending')}
                    disabled={isProcessing}
                    className="w-full py-3.5 rounded-full bg-brand-charcoal hover:bg-black text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Finalizar Pedido com Boleto</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SUCCESS CELEBRATION */}
          {step === 'success' && completedOrder && (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 rounded-full bg-brand-green-subtle text-brand-green flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-pink bg-brand-pink-light px-3 py-1 rounded-full">
                  Pedido Realizado com Sucesso!
                </span>
                <h3 className="font-serif text-2xl font-bold text-brand-charcoal mt-2">
                  Obrigado, {completedOrder.customer.name.split(' ')[0]}!
                </h3>
                <p className="text-xs text-brand-muted mt-1 max-w-md mx-auto">
                  Seu pedido <strong className="text-brand-charcoal">#{completedOrder.id}</strong> foi registrado. Enviaremos atualizações no seu e-mail e WhatsApp.
                </p>
              </div>

              {/* Order Summary Box */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-brand-border/60 text-left text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Envio escolhido:</span>
                  <span className="font-bold text-brand-charcoal">{completedOrder.shipping.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Destino:</span>
                  <span className="font-bold text-brand-charcoal">{completedOrder.address.city} - {completedOrder.address.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-muted">Pagamento:</span>
                  <span className="font-bold uppercase text-brand-charcoal">{completedOrder.paymentMethod} ({completedOrder.paymentStatus})</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-brand-border/60 text-sm font-extrabold">
                  <span>Total:</span>
                  <span className="text-brand-pink">R$ {completedOrder.total.toFixed(2).replace('.', ',')}</span>
                </div>
              </div>

              {/* WhatsApp direct talk */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/5544999998888?text=${encodeURIComponent(`Olá Bellclay! Acabei de fazer o pedido #${completedOrder.id} no site no valor de R$ ${completedOrder.total.toFixed(2)} e gostaria de acompanhar!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-brand-green hover:bg-brand-green-hover text-white text-xs font-bold shadow-green-soft flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Falar com o Ateliê no WhatsApp</span>
                </a>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-gray-100 text-brand-charcoal text-xs font-bold border border-brand-border transition-all cursor-pointer"
                >
                  Continuar Comprando
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
