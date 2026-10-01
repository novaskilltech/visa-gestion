'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { authenticate, AVAILABLE_ACCOUNTS } from '@/lib/store';
import { Lock, ArrowRight, ShieldCheck, FileText, CheckCircle2, UserCheck, AlertCircle, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('omrayanair');
  const [password, setPassword] = useState('Khouribga111*');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = authenticate(identifier, password);
    if (result.success && result.session) {
      setTimeout(() => {
        if (result.session?.role === 'SUPER_ADMIN') {
          router.push('/app/admin');
        } else {
          router.push('/app/dashboard');
        }
      }, 300);
    } else {
      setError(result.error || 'Identifiant ou mot de passe invalide.');
      setLoading(false);
    }
  };

  const handleSelectAccount = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white mx-auto shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Connexion Visa Gestion
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Accédez à votre espace agence ou à la console prestataire
            </p>
          </div>

          {/* Quick-fill selector for the two accounts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2.5">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-brand-600" />
              Sélectionnez votre compte configuré :
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectAccount('omrayanair', 'Khouribga111*')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  identifier === 'omrayanair'
                    ? 'border-brand-500 bg-brand-50/70 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Omrayanair</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 font-bold">Agence</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Espace Agence de voyage</p>
              </button>

              <button
                type="button"
                onClick={() => handleSelectAccount('France Elite', 'omrayanair')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  identifier === 'France Elite'
                    ? 'border-purple-500 bg-purple-50/70 shadow-2xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">France Elite</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">Prestataire</span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Console de traitement</p>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <div className="bg-white p-7 sm:p-8 rounded-2xl shadow-xl border border-slate-200 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identifiant ou Nom du compte
                </label>
                <input
                  type="text"
                  required
                  placeholder="omrayanair ou France Elite"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{loading ? 'Connexion en cours...' : 'Se connecter'}</span>
              </button>
            </form>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Session chiffrée
              </span>
              <span>Chiffrement TLS 1.3</span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
