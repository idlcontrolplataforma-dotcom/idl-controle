import React, { useState } from 'react';
import { Mail, Lock, AlertCircle, Key } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  adminPassword?: string;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, adminPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Hardcoded credentials check using state/prop password
    if (email.trim() === 'admin@idl.com' && password === (adminPassword || 'admin')) {
      onLoginSuccess();
    } else {
      setError('Credenciais inválidas. Verifique seu e-mail e senha.');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070913] text-slate-100 p-4 font-sans select-none relative overflow-hidden">
      {/* Premium ambient glow background design */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#0e1322]/85 border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-md relative z-10">
        
        {/* Branding header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-500/20 mb-4 animate-pulse">
            <Key className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-widest text-white uppercase bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
            IDL CONTROL
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">Controle e Gerenciamento de Produção VSL</p>
        </div>

        {/* Error notification alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3 text-rose-400 text-xs font-semibold animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form fields */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email input field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
              E-mail corporativo
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500/50 focus:bg-slate-950 text-slate-200 placeholder-slate-650 rounded-xl text-sm focus:outline-none transition-all duration-200"
                placeholder="exemplo@idl.com"
              />
            </div>
          </div>

          {/* Password input field */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
              Senha de acesso
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-violet-400 transition-colors">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 focus:border-violet-500/50 focus:bg-slate-950 text-slate-200 placeholder-slate-650 rounded-xl text-sm focus:outline-none transition-all duration-200"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit action button */}
          <button
            type="submit"
            className="w-full py-2.5 mt-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-sm font-bold shadow-md shadow-violet-500/10 hover:shadow-lg hover:shadow-violet-500/20 active:scale-[0.985] transition-all duration-200"
          >
            Entrar no IDL CONTROL
          </button>
        </form>

        {/* Footer help note */}
        <div className="mt-8 text-center text-[10px] text-slate-600 font-semibold tracking-wide">
          Acesso restrito a administradores autorizados.
        </div>
      </div>
    </div>
  );
};
