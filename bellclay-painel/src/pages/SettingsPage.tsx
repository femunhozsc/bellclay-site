import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, CheckCircle2, Key, CreditCard, Percent } from 'lucide-react';
import { SiteSettings } from '../types';
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
  }, [
    settings.freeShippingThreshold,
    settings.tiktok,
    settings.instagram,
    settings.whatsapp,
    settings.infinitePayTag,
    settings.maxInstallmentsNoInterest,
    settings.pixDiscountPercent
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        freeShippingThreshold: !isNaN(parsedThreshold) && parsedThreshold > 0 ? parsedThreshold : 149
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
    </div>
  );
};
