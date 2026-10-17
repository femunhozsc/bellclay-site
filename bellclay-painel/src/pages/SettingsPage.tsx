import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, CheckCircle2, Key, CreditCard, Percent, Tag, Plus, Trash2, Edit3, X, AlertCircle } from 'lucide-react';
import { SiteSettings, Coupon } from '../types';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from '../components/SocialIcons';

interface SettingsPageProps {
  settings: SiteSettings;
  onSaveSettings: (settings: SiteSettings) => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onSaveSettings }) => {
  const [originCep, setOriginCep] = useState(settings.originCep || '87302060');
  const [city, setCity] = useState(settings.city || 'Campo Mourão');
  const [state, setState] = useState(settings.state || 'PR');
  const [whatsapp, setWhatsapp] = useState(settings.whatsapp || '5544991074932');
  const [instagram, setInstagram] = useState(settings.instagram || '@bellclayart');
  const [tiktok, setTiktok] = useState(settings.tiktok || '@bellclayart');

  // InfinitePay & Payment Rules
  const [infinitePayTag, setInfinitePayTag] = useState(
    (settings.infinitePayTag || 'isabela-munhoz-4sb').replace(/^[$@]+/, '')
  );
  const [maxInstallmentsNoInterest, setMaxInstallmentsNoInterest] = useState(
    String(settings.maxInstallmentsNoInterest ?? 3)
  );
  const [pixDiscountPercent, setPixDiscountPercent] = useState(
    String(settings.pixDiscountPercent ?? 0)
  );

  // Coupons Management
  const [coupons, setCoupons] = useState<Coupon[]>(settings.coupons || []);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponType, setCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [couponValue, setCouponValue] = useState('');
  const [couponMinOrder, setCouponMinOrder] = useState('');
  const [couponMaxDiscount, setCouponMaxDiscount] = useState('');
  const [couponActive, setCouponActive] = useState(true);
  const [couponFormError, setCouponFormError] = useState<string | null>(null);

  // Shipping API
  const [melhorEnvioToken, setMelhorEnvioToken] = useState(settings.melhorEnvioToken || '');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(settings.freeShippingThreshold || 149));

  useEffect(() => {
    if (settings.freeShippingThreshold) {
      setFreeShippingThreshold(String(settings.freeShippingThreshold));
    }
    if (settings.tiktok) setTiktok(settings.tiktok);
    if (settings.instagram) setInstagram(settings.instagram);
    if (settings.whatsapp) setWhatsapp(settings.whatsapp);
    if (settings.infinitePayTag) {
      setInfinitePayTag(settings.infinitePayTag.replace(/^[$@]+/, ''));
    }
    if (settings.maxInstallmentsNoInterest !== undefined) {
      setMaxInstallmentsNoInterest(String(settings.maxInstallmentsNoInterest));
    }
    if (settings.pixDiscountPercent !== undefined) {
      setPixDiscountPercent(String(settings.pixDiscountPercent));
    }
    if (settings.coupons) {
      setCoupons(settings.coupons);
    }
  }, [
    settings.freeShippingThreshold,
    settings.tiktok,
    settings.instagram,
    settings.whatsapp,
    settings.infinitePayTag,
    settings.maxInstallmentsNoInterest,
    settings.pixDiscountPercent,
    settings.coupons
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Coupon Handlers
  const handleOpenAddCoupon = () => {
    setEditingCouponId(null);
    setCouponCode('');
    setCouponType('percentage');
    setCouponValue('');
    setCouponMinOrder('');
    setCouponMaxDiscount('');
    setCouponActive(true);
    setCouponFormError(null);
    setIsCouponModalOpen(true);
  };

  const handleOpenEditCoupon = (c: Coupon) => {
    setEditingCouponId(c.id);
    setCouponCode(c.code);
    setCouponType(c.type);
    setCouponValue(String(c.value));
    setCouponMinOrder(c.minOrderValue ? String(c.minOrderValue) : '');
    setCouponMaxDiscount(c.maxDiscountAmount ? String(c.maxDiscountAmount) : '');
    setCouponActive(c.active);
    setCouponFormError(null);
    setIsCouponModalOpen(true);
  };

  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFormError(null);

    const cleanCode = couponCode.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      setCouponFormError('Informe o código do cupom.');
      return;
    }

    const val = parseFloat(couponValue.replace(',', '.'));
    if (isNaN(val) || val <= 0) {
      setCouponFormError('Informe um valor de desconto válido maior que zero.');
      return;
    }

    if (couponType === 'percentage' && val > 100) {
      setCouponFormError('A porcentagem de desconto não pode ultrapassar 100%.');
      return;
    }

    const minOrder = parseFloat(couponMinOrder.replace(',', '.'));
    const maxDiscount = parseFloat(couponMaxDiscount.replace(',', '.'));

    const newCoupon: Coupon = {
      id: editingCouponId || `cupom-${Date.now()}`,
      code: cleanCode,
      type: couponType,
      value: val,
      minOrderValue: !isNaN(minOrder) && minOrder > 0 ? minOrder : undefined,
      maxDiscountAmount: !isNaN(maxDiscount) && maxDiscount > 0 ? maxDiscount : undefined,
      active: couponActive,
      usageCount: editingCouponId ? (coupons.find(c => c.id === editingCouponId)?.usageCount || 0) : 0,
      createdAt: editingCouponId ? (coupons.find(c => c.id === editingCouponId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    let updatedCoupons: Coupon[];
    if (editingCouponId) {
      updatedCoupons = coupons.map(c => c.id === editingCouponId ? newCoupon : c);
    } else {
      if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
        setCouponFormError(`Já existe um cupom cadastrado com o código "${cleanCode}".`);
        return;
      }
      updatedCoupons = [newCoupon, ...coupons];
    }

    setCoupons(updatedCoupons);
    setIsCouponModalOpen(false);

    // Auto-save coupons to backend
    onSaveSettings({
      ...settings,
      coupons: updatedCoupons
    }).catch(console.error);
  };

  const handleDeleteCoupon = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este cupom de desconto?')) {
      const updatedCoupons = coupons.filter(c => c.id !== id);
      setCoupons(updatedCoupons);
      onSaveSettings({
        ...settings,
        coupons: updatedCoupons
      }).catch(console.error);
    }
  };

  const handleToggleCouponActive = (id: string) => {
    const updatedCoupons = coupons.map(c => c.id === id ? { ...c, active: !c.active } : c);
    setCoupons(updatedCoupons);
    onSaveSettings({
      ...settings,
      coupons: updatedCoupons
    }).catch(console.error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedThreshold = parseFloat(freeShippingThreshold);
      const parsedInstallments = Math.min(12, Math.max(1, parseInt(maxInstallmentsNoInterest, 10) || 3));
      const parsedPixDiscount = Math.min(50, Math.max(0, parseFloat(pixDiscountPercent) || 0));
      const cleanTag = (infinitePayTag || 'isabela-munhoz-4sb').trim().replace(/^[$@]+/, '');

      const updated: SiteSettings = {
        ...settings,
        originCep: originCep.replace(/\D/g, ''),
        city,
        state,
        whatsapp: whatsapp.replace(/\D/g, ''),
        instagram,
        tiktok,
        infinitePayTag: cleanTag,
        maxInstallmentsNoInterest: parsedInstallments,
        pixDiscountPercent: parsedPixDiscount,
        melhorEnvioToken,
        freeShippingThreshold: !isNaN(parsedThreshold) && parsedThreshold > 0 ? parsedThreshold : 149,
        coupons
      };
      await onSaveSettings(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-brand-charcoal">Configurações & Integrações</h2>
          <p className="text-xs text-brand-muted">
            Configure seu CEP de envio padrão (Campo Mourão), Checkout InfinitePay (parcelas e Pix) e token do Melhor Envio.
          </p>
        </div>

        {saveSuccess && (
          <div className="px-4 py-2 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-200 flex items-center gap-1.5 shadow-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configurações salvas!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* InfinitePay Checkout & Regras de Parcelamento / Pix */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border/60">
            <ShieldCheck className="w-5 h-5 text-brand-green" />
            <div>
              <h3 className="font-bold text-sm text-brand-charcoal">
                InfinitePay — Checkout Integrado (Pix Taxa Zero & Cartão)
              </h3>
              <p className="text-xs text-brand-muted">
                Configure sua InfiniteTag e como as parcelas sem juros e o desconto de Pix são exibidos na loja.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                Sua InfiniteTag (sem o $) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-green">
                  $
                </span>
                <input
                  type="text"
                  required
                  placeholder="isabela-munhoz-4sb"
                  value={infinitePayTag}
                  onChange={(e) => setInfinitePayTag(e.target.value.replace(/^[$@]+/, ''))}
                  className="w-full text-xs pl-7 pr-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-mono font-bold"
                />
              </div>
              <span className="text-[10px] text-brand-muted mt-1 block">
                Conta ativa: <strong>${infinitePayTag || 'isabela-munhoz-4sb'}</strong>
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-brand-charcoal mb-1">
                <CreditCard className="w-3.5 h-3.5 text-brand-pink" />
                <span>Parcelas Sem Juros Exibidas</span>
              </label>
              <select
                value={maxInstallmentsNoInterest}
                onChange={(e) => setMaxInstallmentsNoInterest(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-semibold"
              >
                <option value="1">1x (Apenas à vista / Juros comprador)</option>
                <option value="2">Até 2x sem juros</option>
                <option value="3">Até 3x sem juros</option>
                <option value="4">Até 4x sem juros</option>
                <option value="5">Até 5x sem juros</option>
                <option value="6">Até 6x sem juros</option>
                <option value="10">Até 10x sem juros</option>
                <option value="12">Até 12x sem juros</option>
              </select>
              <span className="text-[10px] text-brand-muted mt-1 block">
                Mostrado nos produtos e checkout (configure igual no app InfinitePay).
              </span>
            </div>

            <div>
              <label className="flex items-center gap-1 text-xs font-bold text-brand-charcoal mb-1">
                <Percent className="w-3.5 h-3.5 text-brand-green" />
                <span>Desconto no Pix (%)</span>
              </label>
              <input
                type="number"
                min="0"
                max="50"
                step="1"
                value={pixDiscountPercent}
                onChange={(e) => setPixDiscountPercent(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-bold"
              />
              <span className="text-[10px] text-brand-muted mt-1 block">
                Use <strong>0</strong> para cobrar o valor cheio no link da InfinitePay.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-brand-border/60 text-[11px] text-brand-muted leading-relaxed">
            💡 <strong>Dica:</strong> Como na tela da InfinitePay o cliente pode escolher pagar por Pix ou Cartão no mesmo link, deixar o Desconto no Pix em <strong>0%</strong> garante que o valor cheio seja sempre cobrado independentemente de o cliente escolher Pix ou Cartão lá na tela da InfinitePay.
          </div>
        </div>

        {/* Programação de Cupons de Desconto */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-brand-border/60 gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-pink" />
              <div>
                <h3 className="font-bold text-sm text-brand-charcoal">
                  Programação de Cupons de Desconto
                </h3>
                <p className="text-xs text-brand-muted">
                  Crie cupons em % ou valor fixo (R$), com regra de valor mínimo de pedido e teto máximo de desconto.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenAddCoupon}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-brand-pink text-white text-xs font-bold hover:bg-brand-pink-hover shadow-pink-soft transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Cupom</span>
            </button>
          </div>

          {/* Lista de Cupons */}
          {coupons.length === 0 ? (
            <div className="text-center py-8 bg-[#FAF8F5] rounded-2xl p-4 space-y-2 border border-dashed border-brand-border">
              <Tag className="w-8 h-8 text-brand-muted/40 mx-auto" />
              <p className="text-xs font-bold text-brand-charcoal">Nenhum cupom cadastrado ainda</p>
              <p className="text-[11px] text-brand-muted max-w-sm mx-auto">
                Clique em "Novo Cupom" acima para criar sua primeira promoção de desconto para seus clientes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    c.active
                      ? 'bg-gradient-to-r from-brand-pink-light/40 via-white to-brand-green-light/40 border-brand-border/70 shadow-2xs'
                      : 'bg-gray-50/70 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-brand-charcoal px-2.5 py-0.5 rounded-lg bg-white border border-brand-border/80 tracking-wider">
                          {c.code}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            c.active
                              ? 'bg-brand-green/20 text-brand-green'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {c.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-brand-pink pt-0.5">
                        {c.type === 'percentage' ? (
                          <span>Desconto de {c.value}%</span>
                        ) : (
                          <span>Desconto de R$ {c.value.toFixed(2).replace('.', ',')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleToggleCouponActive(c.id)}
                        title={c.active ? 'Desativar cupom' : 'Ativar cupom'}
                        className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                          c.active ? 'text-brand-green hover:bg-brand-green/10' : 'text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {c.active ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCoupon(c)}
                        title="Editar cupom"
                        className="p-1.5 rounded-lg text-brand-charcoal hover:bg-brand-pink-light hover:text-brand-pink transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCoupon(c.id)}
                        title="Excluir cupom"
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2.5 border-t border-brand-border/50 text-[11px] text-brand-muted space-y-0.5">
                    <p>
                      • Pedido mínimo:{' '}
                      <strong className="text-brand-charcoal">
                        {c.minOrderValue && c.minOrderValue > 0
                          ? `R$ ${c.minOrderValue.toFixed(2).replace('.', ',')}`
                          : 'Sem valor mínimo'}
                      </strong>
                    </p>
                    <p>
                      • Teto máx. desconto:{' '}
                      <strong className="text-brand-charcoal">
                        {c.maxDiscountAmount && c.maxDiscountAmount > 0
                          ? `R$ ${c.maxDiscountAmount.toFixed(2).replace('.', ',')}`
                          : 'Sem teto máximo'}
                      </strong>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Origin CEP & Logistics */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border/60">
            <Truck className="w-5 h-5 text-brand-green" />
            <h3 className="font-bold text-sm text-brand-charcoal">
              Origem dos Envios & Logística
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                CEP de Origem (Saída das Encomendas) *
              </label>
              <input
                type="text"
                required
                maxLength={9}
                value={originCep}
                onChange={(e) => setOriginCep(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-mono font-bold"
              />
              <span className="text-[10px] text-brand-muted mt-1 block">
                Padrão: 87302-060 (Campo Mourão - PR)
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">Cidade do Ateliê</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                Frete Grátis a partir de (R$)
              </label>
              <input
                type="number"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
              <span className="text-[10px] text-brand-muted mt-1 block">
                Valor do pedido mínimo para ativar o frete grátis (aplicável ao PR ou envios até R$ 15)
              </span>
            </div>
          </div>
        </div>

        {/* Shipping API - Melhor Envio */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border/60">
            <Key className="w-5 h-5 text-brand-pink" />
            <div>
              <h3 className="font-bold text-sm text-brand-charcoal">
                API de Envios (Melhor Envio / SuperFrete)
              </h3>
              <p className="text-xs text-brand-muted">
                A Melhor Envio é a plataforma de fretes com maior desconto do Brasil (até 80% nos Correios e Jadlog).
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">
              Token de Acesso Melhor Envio
            </label>
            <input
              type="password"
              placeholder="Cole seu Bearer Token do painel da Melhor Envio"
              value={melhorEnvioToken}
              onChange={(e) => setMelhorEnvioToken(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-mono"
            />
            <span className="text-[10px] text-brand-muted mt-1.5 block">
              💡 O site já conta com cálculo regional instantâneo integrado (Mini Envios, PAC, Sedex e Jadlog a partir de Campo Mourão PR), e ao colar o token acima conecta diretamente à sua conta oficial.
            </span>
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border/60">
            <WhatsAppIcon className="w-5 h-5 text-[#25D366]" />
            <h3 className="font-bold text-sm text-brand-charcoal">
              Redes Sociais & Contato
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal mb-1">
                <WhatsAppIcon className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp de Atendimento</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Ex: 5544991074932"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal mb-1">
                <InstagramIcon className="w-3.5 h-3.5 text-brand-pink" />
                <span>Instagram (@)</span>
              </label>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@bellclayart"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-bold text-brand-charcoal mb-1">
                <TikTokIcon className="w-3.5 h-3.5 text-brand-charcoal" />
                <span>TikTok (@)</span>
              </label>
              <input
                type="text"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="@bellclayart"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft hover:shadow-soft-hover transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Salvando...' : 'Salvar Todas as Configurações'}
          </button>
        </div>

      </form>

      {/* Modal de Criação / Edição de Cupom */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-pink" />
                <h3 className="font-bold text-base text-brand-charcoal">
                  {editingCouponId ? 'Editar Cupom' : 'Criar Novo Cupom'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCouponModalOpen(false)}
                className="text-brand-muted hover:text-brand-charcoal p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              {couponFormError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{couponFormError}</span>
                </div>
              )}

              <div>
                <label className="block font-bold text-brand-charcoal mb-1">
                  Código do Cupom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: PROMO10, BEMVINDO..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full text-xs font-mono font-bold tracking-wider px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink uppercase"
                />
                <span className="text-[10px] text-brand-muted mt-1 block">
                  O código que o cliente digitará no checkout (sem espaços).
                </span>
              </div>

              <div>
                <label className="block font-bold text-brand-charcoal mb-1.5">
                  Tipo de Desconto *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCouponType('percentage')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      couponType === 'percentage'
                        ? 'bg-brand-pink text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-brand-charcoal hover:bg-gray-100 border border-brand-border/70'
                    }`}
                  >
                    <span>Porcentagem (%)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCouponType('fixed')}
                    className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      couponType === 'fixed'
                        ? 'bg-brand-pink text-white shadow-xs'
                        : 'bg-[#FAF7F2] text-brand-charcoal hover:bg-gray-100 border border-brand-border/70'
                    }`}
                  >
                    <span>Valor Fixo (R$)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-brand-charcoal mb-1">
                  {couponType === 'percentage' ? 'Porcentagem de Desconto (%) *' : 'Valor do Desconto (R$) *'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={couponType === 'percentage' ? '100' : '99999'}
                  required
                  placeholder={couponType === 'percentage' ? 'Ex: 10 para 10%' : 'Ex: 15.00 para R$ 15'}
                  value={couponValue}
                  onChange={(e) => setCouponValue(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-bold text-brand-charcoal mb-1">
                    Valor Mínimo do Pedido (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 50.00 (ou 0)"
                    value={couponMinOrder}
                    onChange={(e) => setCouponMinOrder(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
                  />
                  <span className="text-[10px] text-brand-muted mt-1 block">
                    Subtotal mín. para aceitar o cupom
                  </span>
                </div>

                <div>
                  <label className="block font-bold text-brand-charcoal mb-1">
                    Teto Máx. de Desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 30.00 (ou 0)"
                    value={couponMaxDiscount}
                    onChange={(e) => setCouponMaxDiscount(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
                  />
                  <span className="text-[10px] text-brand-muted mt-1 block">
                    Desconto máx. permitido
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-brand-border/60">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-brand-charcoal">
                  <input
                    type="checkbox"
                    checked={couponActive}
                    onChange={(e) => setCouponActive(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-pink focus:ring-brand-pink"
                  />
                  <span>Cupom ativo para uso</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-brand-charcoal hover:bg-gray-100 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-pink hover:bg-brand-pink-hover text-white font-bold shadow-xs cursor-pointer"
                >
                  Salvar Cupom
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
