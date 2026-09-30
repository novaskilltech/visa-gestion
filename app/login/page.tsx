'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AVAILABLE_DEMO_USERS, setCurrentSession } from '@/lib/store';
import { Lock, ArrowRight, ShieldCheck, FileText, CheckCircle2, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDemoUser, setSelectedDemoUser] = useState(AVAILABLE_DEMO_USERS[0].user_id);

  const handleStandardLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Look for matching user or fallback to demo user
    const found = AVAILABLE_DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    const userToLogin = found || AVAILABLE_DEMO_USERS[0];
    
    setCurrentSession(userToLogin);
    setTimeout(() => {
      router.push('/app/dashboard');
    }, 400);
  };

  const handleQuickDemoLogin = (userId: string) => {
    const user = AVAILABLE_DEMO_USERS.find(u => u.user_id === userId);
    if (user) {
      setCurrentSession(user);
      router.push('/app/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white mx-auto shadow-md">
              <FileText className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Espace Agence Sécurisé
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Connectez-vous pour gérer et suivre vos dossiers de visas
            </p>
          </div>

          {/* Quick Demo Role Switcher (Pre-filled for zero-friction testing) */}
          <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-5 space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-brand-600" />
                Accès Démo Immédiat (Multi-Tenant)
              </span>
              <span className="text-[10px] bg-brand-200 text-brand-800 font-bold px-2 py-0.5 rounded">
                1 Clic
              </span>
            </div>
            <p className="text-xs text-brand-800 leading-relaxed">
              Sélectionnez un profil pour tester l&apos;application et l&apos;isolation multi-agences en direct :
            </p>
            <div className="space-y-1.5 pt-1">
              {AVAILABLE_DEMO_USERS.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => handleQuickDemoLogin(user.user_id)}
                  type="button"
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-brand-100/60 border border-slate-200 hover:border-brand-300 transition-all flex items-center justify-between group shadow-2xs"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-brand-700">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {user.role} • <span className="font-medium text-slate-700">{user.organization_name}</span>
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          {/* Regular Login Form */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
                ou avec vos identifiants
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email professionnel
                </label>
                <input
                  type="email"
                  required
                  placeholder="karim@atlas-voyages.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
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

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600" />
                  <span>Se souvenir de moi</span>
                </label>
                <a href="#forgot" className="text-brand-600 hover:text-brand-700 font-medium">
                  Mot de passe oublié ?
                </a>
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

            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Vous n&apos;avez pas encore d&apos;espace agence ?{' '}
                <Link href="/contact" className="text-brand-600 font-semibold hover:underline">
                  Demander une démo
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
