import React, { useState } from 'react';
import { Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../context/AdminAuthContext';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await login(email, password);
    if (!res.success && res.error) {
      setError(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF0F2] via-[#FDFBF7] to-[#F1F8EC] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-brand-border/80 p-8 space-y-6">
        
        {/* Logo & Header */}
        <div className="text-center space-y-3">
          <img
            src="/bellclay_logo.png"
            alt="Bellclay Logo"
            className="h-16 w-auto object-contain mx-auto"
          />
          <div>
            <h1 className="font-serif text-2xl font-bold text-brand-charcoal">
              Bellclay Painel
            </h1>
            <p className="text-xs text-brand-muted mt-1">
              Acesso exclusivo para gestão do ateliê & e-commerce
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">E-mail do Administrador</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-brand-charcoal mb-1">Senha de Acesso</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl border border-brand-border bg-[#FAF7F2] outline-hidden focus:border-brand-pink"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-full bg-brand-pink hover:bg-brand-pink-hover text-white text-xs font-bold shadow-pink-soft hover:shadow-soft-hover transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isLoading ? 'Entrando...' : 'Entrar no Painel'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center text-[11px] text-brand-muted">
          Ateliê Bellclay • Campo Mourão - PR
        </div>

      </div>
    </div>
  );
};
