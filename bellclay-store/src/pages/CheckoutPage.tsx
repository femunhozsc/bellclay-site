import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, ArrowLeft, ArrowRight, Check, CheckCircle2,
  Truck, User, MapPin, CreditCard, QrCode,
  ExternalLink, AlertCircle, ShoppingBag, Edit3,
  Lock, Eye, EyeOff, UserCheck, Clock, RefreshCw, Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { WhatsAppIcon } from '../components/SocialIcons';
import { fetchAddressByCep } from '../services/viaCepService';
import {
  createInfinitePayCheckout,
  checkInfinitePayPayment
} from '../services/infinitePayService';
import {
  saveOrder,
  getOrderById,
  confirmOrderPayment,
  subscribeToOrder,
  trackEvent
} from '../services/firebase';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
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
  const { customerProfile, setCustomerProfile, registerWithEmail } = useAuth();

  // Check if returning from InfinitePay redirect_url
  const returnedOrderNsu = searchParams.get('order_nsu') || searchParams.get('orderId');
  const returnedTransactionNsu = searchParams.get('transaction_nsu') || undefined;
  const returnedSlug = searchParams.get('slug') || undefined;
  const returnedCaptureMethod = searchParams.get('capture_method') || undefined;
  const returnedReceiptUrl = searchParams.get('receipt_url') || undefined;

  // Steps: 1: Contato, 2: Endereço, 3: Envio, 4: Pagamento & Revisão, 5: Sucesso / Confirmação
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(
    returnedOrderNsu ? 5 : 1
  );
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');

  // Step 1: Customer Contact Form
  const [name, setName] = useState(customerProfile.name || '');
  const [email, setEmail] = useState(customerProfile.email || '');
  const [phone, setPhone] = useState(customerProfile.phone || '');
  const [cpf, setCpf] = useState(customerProfile.cpf || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAccountCreated, setIsAccountCreated] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isEditingContact, setIsEditingContact] = useState(false);

  // If customer is already logged in with saved data, default to abbreviated view
  const hasSavedContact = Boolean(
    !customerProfile.isGuest &&
      customerProfile.name &&
      customerProfile.email &&
      customerProfile.phone
  );

  // Step 2: Address Form
  const [cep, setCep] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Results & Outputs
  const [orderNotes, setOrderNotes] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Configurable Pix discount and Installments from Admin Panel
  const pixDiscountPercent = Number(settings.pixDiscountPercent ?? 0);
  const maxInstallmentsNoInterest = Math.max(1, Number(settings.maxInstallmentsNoInterest ?? 3));
  const infinitePayHandle = (settings.infinitePayTag || 'isabela-munhoz-4sb')
    .trim()
    .replace(/^[$@]+/, '');
  const whatsappNumber = (settings.whatsapp || '5544991074932').replace(/\D/g, '') || '5544991074932';
  const whatsappHelpMessage = encodeURIComponent(
    'Olá Bellclay! Estou no checkout e gostaria de tirar uma dúvida sobre o meu pedido.'
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Sync profile details if customer logs in or profile changes
  useEffect(() => {
    if (customerProfile.name && !name) setName(customerProfile.name);
    if (customerProfile.email && !email) setEmail(customerProfile.email);
    if (customerProfile.phone && !phone) setPhone(customerProfile.phone);
    if (customerProfile.cpf && !cpf) setCpf(customerProfile.cpf);
  }, [customerProfile]);

  // Handle Return from InfinitePay Redirect URL
  useEffect(() => {
    if (!returnedOrderNsu) return;

    let unsubscribeOrder: (() => void) | null = null;

    const handleReturnFromInfinitePay = async () => {
      setCurrentStep(5);
      setIsVerifyingPayment(true);
      clearCart();

      try {
        // 1. Load existing order from Firestore or localStorage
        let existingOrder = await getOrderById(returnedOrderNsu);

        // 2. Check if URL has payment confirmation parameters from InfinitePay
        const hasPaymentParams = Boolean(
          returnedTransactionNsu || returnedReceiptUrl || returnedCaptureMethod
        );

        // Verify with backend /api/payment-check as well
        const verifyRes = await checkInfinitePayPayment({
          handle: infinitePayHandle,
          orderNsu: returnedOrderNsu,
          transactionNsu: returnedTransactionNsu,
          slug: returnedSlug,
          captureMethod: returnedCaptureMethod,
          receiptUrl: returnedReceiptUrl
        });

        if (hasPaymentParams || verifyRes.paid) {
          const updatedOrder = await confirmOrderPayment(returnedOrderNsu, {
            captureMethod: returnedCaptureMethod,
            receiptUrl: returnedReceiptUrl,
            transactionNsu: returnedTransactionNsu,
            slug: returnedSlug
          });

          if (updatedOrder) {
            existingOrder = updatedOrder;
          } else if (existingOrder) {
            existingOrder = {
              ...existingOrder,
              paymentStatus: 'approved',
              orderStatus: 'paid',
              paymentMethod:
                returnedCaptureMethod === 'pix'
                  ? 'pix'
                  : returnedCaptureMethod === 'credit_card'
                  ? 'credit_card'
                  : existingOrder.paymentMethod,
              receiptUrl: returnedReceiptUrl || existingOrder.receiptUrl,
              transactionNsu: returnedTransactionNsu || existingOrder.transactionNsu,
              infinitePaySlug: returnedSlug || existingOrder.infinitePaySlug
            };
          }

          // Confetti celebration on confirmed payment
          confetti({
            particleCount: 90,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#e95f71', '#83bc5c', '#f58091', '#4ade80']
          });
        }

        if (existingOrder) {
          setCompletedOrder(existingOrder);
          if (existingOrder.customer?.name) setName(existingOrder.customer.name);
        }

        // Subscribe to real-time updates in case webhook arrives moments later
        unsubscribeOrder = subscribeToOrder(returnedOrderNsu, (liveOrder) => {
          setCompletedOrder((prev) => {
            const wasPaid = prev?.orderStatus === 'paid' || prev?.paymentStatus === 'approved';
            const isNowPaid = liveOrder.orderStatus === 'paid' || liveOrder.paymentStatus === 'approved';
            if (!wasPaid && isNowPaid) {
              confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.6 },
                colors: ['#e95f71', '#83bc5c', '#f58091', '#4ade80']
              });
            }
            return liveOrder;
          });
        });
      } catch (err) {
        console.error('Erro ao verificar retorno do pedido:', err);
      } finally {
        setIsVerifyingPayment(false);
      }
    };

    handleReturnFromInfinitePay();

    return () => {
      if (unsubscribeOrder) unsubscribeOrder();
    };
  }, [returnedOrderNsu, returnedTransactionNsu, returnedSlug, returnedCaptureMethod, returnedReceiptUrl]);

  // Auto-create account upon reaching Step 4 (Payment stage) and keep user connected
  useEffect(() => {
    const handleAutoRegister = async () => {
      if (
        currentStep === 4 &&
        customerProfile.isGuest &&
        password.length >= 6 &&
        !isAccountCreated &&
        !isCreatingAccount
      ) {
        setIsCreatingAccount(true);
        try {
          const res = await registerWithEmail(name, email, password, phone, cpf);
          if (res.success) {
            setIsAccountCreated(true);
          } else if (res.error) {
            console.warn('Auto-registro no checkout:', res.error);
          }
        } catch (e) {
          console.warn('Erro ao auto-criar conta:', e);
        } finally {
          setIsCreatingAccount(false);
        }
      }
    };
    handleAutoRegister();
  }, [currentStep, customerProfile.isGuest, password, name, email, phone, cpf, isAccountCreated, isCreatingAccount, registerWithEmail]);

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
  const pixDiscount =
    paymentMethod === 'pix' && pixDiscountPercent > 0
      ? subtotal * (pixDiscountPercent / 100)
      : 0;
  const grandTotal = Math.max(0, subtotal - pixDiscount + shippingCost);

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
    if (customerProfile.isGuest) {
      if (!password || password.length < 6) {
        setErrorMessage('Por favor, crie uma senha de no mínimo 6 caracteres para sua conta.');
        return false;
      }
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

  // Step 4: Finalize Order & Redirect to InfinitePay Checkout
  const handleFinalizeOrder = async () => {
    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Ensure account is registered/connected if pending
      if (customerProfile.isGuest && password.length >= 6 && !isAccountCreated) {
        try {
          const regRes = await registerWithEmail(name, email, password, phone, cpf);
          if (regRes.success) {
            setIsAccountCreated(true);
          }
        } catch (e) {
          console.warn('Fallback registro no fechamento:', e);
        }
      }

      const orderId = `BC-${Date.now().toString().slice(-6)}`;
      const trimmedNotes = orderNotes.trim();

      const customerData = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        cpf: cpf.trim(),
        ...(trimmedNotes ? { notes: trimmedNotes } : {})
      };

      const addressData = {
        cep: cep.replace(/\D/g, ''),
        street: street.trim(),
        number: number.trim(),
        ...(complement.trim() ? { complement: complement.trim() } : {}),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim().toUpperCase()
      };

      const newOrder: Order = {
        id: orderId,
        customer: customerData,
        address: addressData,
        items: [...items],
        shipping: selectedShipping!,
        subtotal,
        discount: pixDiscount,
        shippingCost,
        total: grandTotal,
        paymentMethod,
        paymentStatus: 'pending',
        orderStatus: 'pending',
        ...(trimmedNotes ? { notes: trimmedNotes } : {}),
        createdAt: new Date().toISOString()
      };

      // 1. Persist order in Firebase Firestore & LocalStorage BEFORE redirecting
      await saveOrder(newOrder);

      // 2. Generate InfinitePay Checkout Link via Serverless API
      const checkoutRes = await createInfinitePayCheckout({
        handle: infinitePayHandle,
        orderId,
        customer: customerData,
        address: addressData,
        items,
        shipping: selectedShipping!,
        discount: pixDiscount,
        grandTotal
      });

      // 3. Save checkoutUrl on the order so customer or admin can access it
      const orderWithUrl: Order = {
        ...newOrder,
        checkoutUrl: checkoutRes.checkoutUrl
      };
      await saveOrder(orderWithUrl);

      // 4. Track checkout event
      await trackEvent('checkout_completed', {
        orderId,
        total: grandTotal,
        paymentMethod,
        gateway: 'infinitepay'
      });

      setCompletedOrder(orderWithUrl);

      // 5. Redirect customer to official InfinitePay Checkout page
      window.location.href = checkoutRes.checkoutUrl;
    } catch (err: any) {
      console.error('Erro ao finalizar pedido:', err);
      setErrorMessage(
        err?.message || 'Houve um erro ao iniciar o pagamento seguro. Por favor, tente novamente.'
      );
      setIsProcessing(false);
    }
  };

  // Manual re-check on Step 5 if still pending
  const handleManualPaymentCheck = async () => {
    if (!completedOrder) return;
    setIsVerifyingPayment(true);
    try {
      const freshOrder = await getOrderById(completedOrder.id);
      if (freshOrder && (freshOrder.orderStatus === 'paid' || freshOrder.paymentStatus === 'approved')) {
        setCompletedOrder(freshOrder);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e95f71', '#83bc5c', '#f58091', '#4ade80']
        });
        return;
      }

      const verifyRes = await checkInfinitePayPayment({
        handle: infinitePayHandle,
        orderNsu: completedOrder.id,
        transactionNsu: completedOrder.transactionNsu || returnedTransactionNsu,
        slug: completedOrder.infinitePaySlug || returnedSlug
      });

      if (verifyRes.paid) {
        const updated = await confirmOrderPayment(completedOrder.id, {
          captureMethod: returnedCaptureMethod,
          receiptUrl: returnedReceiptUrl,
          transactionNsu: returnedTransactionNsu,
          slug: returnedSlug
        });
        if (updated) setCompletedOrder(updated);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#e95f71', '#83bc5c', '#f58091', '#4ade80']
        });
      }
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Empty Cart State (only when not on Step 5 confirmation screen)
  if (items.length === 0 && currentStep !== 5 && !returnedOrderNsu) {
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
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-xs shadow-soft transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo</span>
        </Link>
      </div>
    );
  }

  const isOrderPaid =
    completedOrder?.paymentStatus === 'approved' || completedOrder?.orderStatus === 'paid';

  const displayTotal = completedOrder ? completedOrder.total : grandTotal;
  const displayCustomerName = completedOrder?.customer?.name || name || 'Cliente';

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Premium Topbar - Identical height, presence, spacing and tokens to Homepage Header */}
      <header className="sticky top-0 z-40 w-full bg-[#FDFBF7]/95 backdrop-blur-md border-b border-brand-border/60 transition-all duration-300 shadow-2xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3.5 sm:py-4.5 gap-2 sm:gap-4 min-h-[80px] sm:min-h-[92px]">
            {/* Left: LOGO ONLY with comfortable margin matching Homepage */}
            <div className="flex items-center shrink-0 pl-1.5 sm:pl-3">
              <Link
                to="/"
                className="flex items-center transition-transform hover:scale-105 active:scale-95 duration-200"
                aria-label="Bellclay Artesanatos - Voltar ao início"
              >
                <img
                  src="/bellclay_logo.png"
                  alt="Bellclay Artesanatos"
                  className="h-12 sm:h-16 w-auto max-h-[60px] object-contain"
                />
              </Link>
            </div>

            {/* Right: Security & Support */}
            <div className="flex items-center gap-2 sm:gap-3 pr-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal/90 bg-white/80 backdrop-blur-xs px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full border border-brand-border/70 shadow-2xs">
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                <span className="font-bold">Ambiente Seguro</span>
                <span className="text-[11px] text-brand-muted hidden sm:inline">• Criptografia SSL</span>
              </div>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappHelpMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-brand-green-subtle text-brand-green hover:bg-brand-green hover:text-white transition-all duration-200 cursor-pointer shadow-xs"
                title="Dúvidas no checkout? Fale conosco no WhatsApp"
              >
                <WhatsAppIcon className="w-4 h-4 shrink-0 fill-current" />
                <span className="hidden sm:inline">Ajuda</span>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full">
        
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
                            <div className="flex items-center gap-1.5 text-[11px] text-brand-green font-semibold mt-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Conta conectada</span>
                            </div>
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
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-soft cursor-pointer transition-all active:scale-95"
                        >
                          <span>Confirmar & Ir para Endereço</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Full Editable Inputs */
                    <div className="space-y-4">
                      {!customerProfile.isGuest && (
                        <div className="p-3.5 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center gap-3 text-xs text-brand-charcoal">
                          <div className="w-7 h-7 rounded-full bg-brand-green/20 text-brand-green flex items-center justify-center shrink-0">
                            <UserCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold">Você já está conectado como {customerProfile.name || name}</p>
                            <p className="text-[11px] text-brand-muted">{customerProfile.email || email} • Este pedido será vinculado à sua conta.</p>
                          </div>
                        </div>
                      )}

                      {hasSavedContact && !customerProfile.isGuest && (
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => setIsEditingContact(false)}
                            className="text-xs font-semibold text-brand-muted hover:text-brand-charcoal cursor-pointer"
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

                      {customerProfile.isGuest && (
                        <div className="p-4 rounded-2xl bg-[#F6F2E9]/70 border border-brand-border/60 space-y-2">
                          <label className="block text-xs font-bold text-brand-charcoal flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <Lock className="w-3.5 h-3.5 text-brand-pink" />
                              Senha para conta *
                            </span>
                            <span className="text-[11px] font-normal text-brand-muted">Mínimo 6 caracteres</span>
                          </label>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Crie uma senha para acessar sua conta..."
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full text-xs sm:text-sm px-3.5 py-3 pr-10 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-white shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                              tabIndex={-1}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          <p className="text-[11px] text-brand-muted flex items-center gap-1.5 leading-relaxed">
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-green shrink-0" />
                            <span>Para você acompanhar a produção artesanal e a entrega do seu pedido com comodidade.</span>
                          </p>
                        </div>
                      )}

                      <div className="pt-3 flex justify-end">
                        <button
                          onClick={() => {
                            if (validateStep1()) {
                              setIsEditingContact(false);
                              setCurrentStep(2);
                            }
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-soft cursor-pointer transition-all active:scale-95"
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
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-soft cursor-pointer transition-all active:scale-95"
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
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-brand-pink to-brand-green hover:opacity-95 text-white font-bold text-xs sm:text-sm shadow-soft cursor-pointer transition-all active:scale-95"
                    >
                      <span>Revisão e Pagamento</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Pagamento Seguro & Revisão */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
                      4. Pagamento Seguro
                    </h2>
                    <p className="text-xs sm:text-sm text-brand-muted mt-0.5">
                      Escolha como deseja concluir sua compra. Transação 100% criptografada.
                    </p>
                  </div>

                  {/* Account Connection Status Note */}
                  {(!customerProfile.isGuest || isAccountCreated) ? (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-brand-border/70 text-xs text-brand-charcoal shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                      <span>Pedido vinculado à sua conta (<strong className="font-semibold">{customerProfile.email || email}</strong>)</span>
                    </div>
                  ) : null}

                  {/* Address Summary Check before Paying */}
                  <div className="p-4 rounded-2xl bg-white border border-brand-border/70 flex items-start justify-between gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                      <div className="text-xs space-y-0.5">
                        <span className="font-bold text-brand-charcoal block">
                          Endereço de Entrega:
                        </span>
                        <p className="text-brand-muted">
                          {street}, {number} {complement ? `(${complement})` : ''} — {neighborhood}
                        </p>
                        <p className="text-brand-muted">
                          {city} - {state} • CEP: {cep} • Envio: <strong>{selectedShipping?.name}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-bold text-brand-pink hover:underline shrink-0 cursor-pointer p-1"
                    >
                      Alterar
                    </button>
                  </div>

                  {/* Payment Method Preference Selector */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`flex flex-col items-center justify-center p-4.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'pix'
                          ? 'border-brand-green bg-brand-green-subtle/50 text-brand-green shadow-xs'
                          : 'border-brand-border/70 hover:border-brand-pink/40 bg-white text-brand-muted'
                      }`}
                    >
                      <QrCode className="w-6 h-6 mb-1.5" />
                      <span className="text-xs sm:text-sm font-bold text-brand-charcoal">Pix Instantâneo</span>
                      <span className="text-[10px] text-brand-green font-bold mt-0.5">
                        {pixDiscountPercent > 0 ? `${pixDiscountPercent}% de desconto` : 'Aprovação imediata'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`flex flex-col items-center justify-center p-4.5 rounded-2xl border-2 transition-all cursor-pointer ${
                        paymentMethod === 'credit_card'
                          ? 'border-brand-pink bg-brand-pink-subtle/50 text-brand-pink shadow-xs'
                          : 'border-brand-border/70 hover:border-brand-pink/40 bg-white text-brand-muted'
                      }`}
                    >
                      <CreditCard className="w-6 h-6 mb-1.5" />
                      <span className="text-xs sm:text-sm font-bold text-brand-charcoal">Cartão de Crédito</span>
                      <span className="text-[10px] text-brand-muted mt-0.5">
                        {maxInstallmentsNoInterest > 1
                          ? `Até ${maxInstallmentsNoInterest}x sem juros`
                          : 'Em até 12x'}
                      </span>
                    </button>
                  </div>

                  {/* Security Assurance Notice */}
                  <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-white border border-brand-border/70 text-xs text-brand-muted shadow-2xs">
                    <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                    <span>Ambiente protegido com criptografia de ponta a ponta. Seus dados nunca são armazenados.</span>
                  </div>

                  {/* Observação Geral do Pedido / Recado para a Artesã */}
                  <div className="p-4 rounded-2xl bg-white border border-brand-border/70 space-y-1.5 shadow-2xs">
                    <label className="block text-xs font-bold text-brand-charcoal flex items-center justify-between">
                      <span>Alguma observação para seu pedido? (opcional)</span>
                      <span className="text-[10px] text-brand-muted font-normal">Ex: embalagem de presente, instruções</span>
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Deixe aqui algum recado especial para a artesã Bellclay..."
                      className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border focus:border-brand-pink outline-none bg-[#FAF8F5] focus:bg-white transition-all shadow-2xs"
                    />
                  </div>

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
                      className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-bold text-sm shadow-green-soft cursor-pointer transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Conectando ambiente seguro...</span>
                        </>
                      ) : (
                        <>
                          <span>Ir para o Pagamento Seguro</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Right Order Summary Column - Sticky on desktop with refined porcelain styling */}
            <div className="lg:col-span-5 bg-[#FAF7F2] p-5 sm:p-7 rounded-2xl sm:rounded-3xl border border-brand-border/70 space-y-4 lg:sticky lg:top-28 shadow-2xs">
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
                        className="w-12 h-12 rounded-xl object-cover bg-white shrink-0 shadow-2xs"
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
                    <span>Desconto Pix ({pixDiscountPercent}%)</span>
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
                    <span className="text-[10px] text-brand-muted block">
                      {maxInstallmentsNoInterest > 1
                        ? `em até ${maxInstallmentsNoInterest}x de R$ ${(grandTotal / maxInstallmentsNoInterest).toFixed(2).replace('.', ',')} sem juros`
                        : 'no Pix ou Cartão em até 12x'}
                    </span>
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
          /* STEP 5: Tela de Confirmação de Pagamento & Resumo do Pedido */
          <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-6 text-center">
            {isVerifyingPayment ? (
              <div className="py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-brand-pink/15 text-brand-pink flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8 animate-spin" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-brand-charcoal">
                  Confirmando seu pagamento com segurança...
                </h2>
                <p className="text-xs sm:text-sm text-brand-muted">
                  Aguarde um instante enquanto atualizamos o status do seu pedido.
                </p>
              </div>
            ) : (
              <>
                <div
                  className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                    isOrderPaid
                      ? 'bg-brand-green/15 text-brand-green'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {isOrderPaid ? (
                    <Check className="w-8 h-8 stroke-[3]" />
                  ) : (
                    <Clock className="w-8 h-8" />
                  )}
                </div>

                <div className="space-y-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${
                      isOrderPaid ? 'text-brand-green' : 'text-amber-700'
                    }`}
                  >
                    {isOrderPaid
                      ? 'Pagamento Confirmado & Pedido Aprovado!'
                      : 'Pedido Registrado • Aguardando Confirmação de Pagamento'}
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-brand-charcoal">
                    Obrigado pelo seu carinho, {displayCustomerName.split(' ')[0]}!
                  </h2>
                  <p className="text-xs sm:text-sm text-brand-muted max-w-md mx-auto">
                    Seu pedido foi registrado no ateliê com o código:
                  </p>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-brand-pink-subtle text-brand-pink font-mono font-bold text-sm">
                    #{completedOrder?.id || returnedOrderNsu}
                  </div>
                </div>

                {/* Order & Delivery Summary Card */}
                {completedOrder && (
                  <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-brand-border/70 space-y-4 max-w-md mx-auto text-left text-xs shadow-2xs">
                    <div className="flex items-center justify-between border-b border-brand-border/60 pb-3">
                      <span className="font-bold text-brand-charcoal">Status do Pagamento:</span>
                      {isOrderPaid ? (
                        <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800 font-bold text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Pagamento Confirmado</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                          Aguardando Pagamento
                        </span>
                      )}
                    </div>

                    {/* Address recorded */}
                    {completedOrder.address && (
                      <div className="space-y-1">
                        <span className="font-bold text-brand-charcoal flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-pink" />
                          <span>Endereço de Entrega Anotado:</span>
                        </span>
                        <p className="text-brand-muted leading-relaxed pl-5">
                          {completedOrder.address.street}, {completedOrder.address.number}
                          {completedOrder.address.complement ? ` (${completedOrder.address.complement})` : ''}
                          <br />
                          {completedOrder.address.neighborhood} • {completedOrder.address.city} - {completedOrder.address.state}
                          <br />
                          CEP: {completedOrder.address.cep} • Frete: <strong>{completedOrder.shipping?.name}</strong>
                        </p>
                      </div>
                    )}

                    <div className="border-t border-brand-border/60 pt-3 flex items-center justify-between">
                      <span className="font-bold text-brand-charcoal">Valor Total:</span>
                      <span className="text-base font-extrabold text-brand-pink">
                        R$ {displayTotal.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Receipt Link if provided */}
                    {(completedOrder.receiptUrl || returnedReceiptUrl) && (
                      <a
                        href={completedOrder.receiptUrl || returnedReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-brand-border text-brand-charcoal hover:border-brand-pink font-bold transition-all shadow-2xs"
                      >
                        <ExternalLink className="w-4 h-4 text-brand-pink" />
                        <span>Visualizar Comprovante do Pedido</span>
                      </a>
                    )}

                    {/* Action buttons if payment is still pending */}
                    {!isOrderPaid && (
                      <div className="space-y-2 pt-2">
                        {completedOrder.checkoutUrl && (
                          <a
                            href={completedOrder.checkoutUrl}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-pink hover:bg-brand-pink-hover text-white font-bold transition-all shadow-xs"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Concluir Pagamento Seguro</span>
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleManualPaymentCheck}
                          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white border border-brand-border text-brand-charcoal hover:bg-gray-50 font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Já paguei! Atualizar status</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* WhatsApp Confirmation CTA */}
                <div className="pt-2 max-w-md mx-auto space-y-3">
                  <a
                    href={`https://wa.me/${(settings.whatsapp || '5544991074932').replace(/\D/g, '') || '5544991074932'}?text=${encodeURIComponent(
                      `Olá Bellclay! Acabei de fazer o pedido #${completedOrder?.id || returnedOrderNsu} no site (${
                        isOrderPaid ? 'Pagamento Aprovado' : 'Aguardando confirmação'
                      }) no valor de R$ ${displayTotal.toFixed(2).replace('.', ',')} e gostaria de acompanhar a produção!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-brand-green hover:bg-brand-green-hover text-white font-bold text-xs sm:text-sm shadow-green-soft transition-all"
                  >
                    <WhatsAppIcon className="w-5 h-5 fill-white text-white shrink-0" />
                    <span>Acompanhar Pedido pelo WhatsApp</span>
                  </a>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <Link
                      to="/minha-conta"
                      className="text-xs font-bold text-brand-pink hover:underline py-1"
                    >
                      Ver em Meus Pedidos
                    </Link>
                    <span className="text-brand-border">•</span>
                    <Link
                      to="/"
                      className="text-xs font-bold text-brand-charcoal hover:text-brand-pink transition-colors py-1"
                    >
                      Voltar à Página Inicial
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

      </main>
    </div>
  );
};
