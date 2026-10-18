import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Truck, ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { WhatsAppIcon, InstagramIcon, TikTokIcon } from './SocialIcons';

// Guarda se o rodapé já foi animado uma vez para nunca mais sumir ao rolar a página
let hasAnimatedFooter = false;

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#FAF7F2] border-t border-brand-border/60 text-brand-charcoal pt-14 pb-8 transition-colors overflow-hidden">
      <motion.div
        initial={hasAnimatedFooter ? false : { opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.12 }}
        onViewportEnter={() => { hasAnimatedFooter = true; }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12"
      >
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Brand & Origin */}
          <div className="md:col-span-1 space-y-4">
            <img
              src="/bellclay_logo.png"
              alt="Bellclay Artesanatos"
              className="h-16 w-auto object-contain"
            />
            <p className="text-xs text-brand-muted leading-relaxed">
              Arte em cerâmica fria modelada à mão com carinho, paciência e acabamento vítreo durável. Peças exclusivas para colecionar e presentear.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-charcoal">
              <MapPin className="w-4 h-4 text-brand-pink shrink-0" />
              <span>Campo Mourão - PR (CEP {settings.originCep})</span>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Categorias
            </h4>
            <ul className="space-y-2 text-xs text-brand-muted">
              {settings.categories.map((c) => (
                <li key={c.id}>
                  <a href="#produtos" className="hover:text-brand-pink transition-colors">
                    {c.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Shipping & Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Envios & Segurança
            </h4>
            <div className="space-y-2.5 text-xs text-brand-muted">
              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                <span>Envio protegido com rastreamento online até o seu endereço (Correios e parceiros).</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                <span>Pagamento 100% seguro com criptografia de ponta a ponta (Pix e Cartão de Crédito).</span>
              </div>
            </div>
          </div>

          {/* Col 4: Social & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Fale com o Ateliê
            </h4>
            <div className="space-y-2">
              {(() => {
                const rawPhone = (settings.whatsapp || '5544991074932').replace(/\D/g, '');
                const ddd = rawPhone.length >= 12 ? rawPhone.slice(2, 4) : rawPhone.slice(0, 2);
                const num = rawPhone.length >= 12 ? rawPhone.slice(4) : rawPhone.slice(2);
                const formatted = num.length === 9
                  ? `(${ddd}) ${num.slice(0, 5)}-${num.slice(5)}`
                  : num.length === 8
                    ? `(${ddd}) ${num.slice(0, 4)}-${num.slice(4)}`
                    : rawPhone;

                return (
                  <a
                    href={`https://wa.me/${rawPhone}?text=${encodeURIComponent('Olá Bellclay! Estive no site e adorei os artesanatos em cerâmica fria. Gostaria de tirar uma dúvida sobre uma peça!')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-brand-charcoal hover:text-[#25D366] transition-colors group"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                    <span>WhatsApp: {formatted}</span>
                  </a>
                );
              })()}

              <a
                href={`https://instagram.com/${(settings.instagram || '@bellclayart').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-brand-charcoal hover:text-brand-pink transition-colors group"
              >
                <InstagramIcon className="w-4 h-4 text-brand-pink shrink-0" />
                <span>{settings.instagram || '@bellclayart'}</span>
              </a>

              <a
                href={`https://www.tiktok.com/@${(settings.tiktok || '@bellclayart').replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-brand-charcoal hover:text-black transition-colors group"
              >
                <TikTokIcon className="w-4 h-4 text-brand-charcoal group-hover:text-black shrink-0" />
                <span>{settings.tiktok || '@bellclayart'}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>© {new Date().getFullYear()} Bellclay Artesanatos. Todos os direitos reservados. Feito com amor em Campo Mourão, PR.</p>
          <div className="flex items-center gap-2">
            <span>Modelagem Artesanal em Cerâmica Fria</span>
            <Heart className="w-3.5 h-3.5 text-brand-pink fill-brand-pink" />
          </div>
        </div>

      </motion.div>
    </footer>
  );
};
