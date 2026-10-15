import React, { useState, useEffect } from 'react';
import { Settings, ShieldCheck, Truck, MapPin, CheckCircle2, Key } from 'lucide-react';
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
  
  // API credentials
  const [mercadoPagoPublicKey, setMercadoPagoPublicKey] = useState(settings.mercadoPagoPublicKey || '');
  const [mercadoPagoAccessToken, setMercadoPagoAccessToken] = useState(settings.mercadoPagoAccessToken || '');
  const [melhorEnvioToken, setMelhorEnvioToken] = useState(settings.melhorEnvioToken || '');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(String(settings.freeShippingThreshold || 149));

  useEffect(() => {
    if (settings.freeShippingThreshold) {
      setFreeShippingThreshold(String(settings.freeShippingThreshold));
    }
    if (settings.tiktok) setTiktok(settings.tiktok);
    if (settings.instagram) setInstagram(settings.instagram);
    if (settings.whatsapp) setWhatsapp(settings.whatsapp);
  }, [settings.freeShippingThreshold, settings.tiktok, settings.instagram, settings.whatsapp]);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const parsedThreshold = parseFloat(freeShippingThreshold);
      const updated: SiteSettings = {
        ...settings,
        originCep: originCep.replace(/\D/g, ''),
        city,
        state,
        whatsapp: whatsapp.replace(/\D/g, ''),
        instagram,
        tiktok,
        mercadoPagoPublicKey,
        mercadoPagoAccessToken,
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
            Configure seu CEP de envio padrão (Campo Mourão), chaves do Mercado Pago e token do Melhor Envio.
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

        {/* Mercado Pago API */}
        <div className="bg-white p-6 rounded-3xl border border-brand-border/70 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-brand-border/60">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <div>
              <h3 className="font-bold text-sm text-brand-charcoal">
                Mercado Pago (Pix, Cartão & Boleto)
              </h3>
              <p className="text-xs text-brand-muted">
                Suas credenciais para receber pagamentos diretamente na sua conta Mercado Pago.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                Public Key (Chave Pública)
              </label>
              <input
                type="text"
                placeholder="APP_USR-xxxxxx..."
                value={mercadoPagoPublicKey}
                onChange={(e) => setMercadoPagoPublicKey(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-charcoal mb-1">
                Access Token (Chave Privada)
              </label>
              <input
                type="password"
                placeholder="APP_USR-xxxxxx..."
                value={mercadoPagoAccessToken}
                onChange={(e) => setMercadoPagoAccessToken(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink font-mono"
              />
            </div>
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
