import React from 'react';
import { Heart, Sparkles, MapPin, Truck, ShieldCheck, MessageCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="bg-[#FAF7F2] border-t border-brand-border/60 text-brand-charcoal pt-14 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
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
                <span>Envio rápido via <strong>Melhor Envio</strong> (Correios PAC, SEDEX, Mini Envios e Jadlog) com rastreio online.</span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-pink shrink-0 mt-0.5" />
                <span>Pagamento 100% blindado com a tecnologia oficial <strong>Mercado Pago</strong>.</span>
              </div>
            </div>
          </div>

          {/* Col 4: Social & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-charcoal">
              Fale com o Ateliê
            </h4>
            <div className="space-y-2">
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-brand-charcoal hover:text-brand-green transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-brand-green" />
                <span>WhatsApp de Atendimento</span>
              </a>
              <a
                href={`https://instagram.com/${settings.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-brand-charcoal hover:text-brand-pink transition-colors"
              >
                <svg className="w-4 h-4 text-brand-pink fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span>{settings.instagram}</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-muted gap-4">
          <p>© {new Date().getFullYear()} Bellclay Artesanatos. Todos os direitos reservados. Feito com amor em Campo Mourão, PR.</p>
          <div className="flex items-center gap-2">
            <span>Modelagem Artesanal em Cerâmica Fria</span>
            <Sparkles className="w-3.5 h-3.5 text-brand-pink" />
          </div>
        </div>

      </div>
    </footer>
  );
};
