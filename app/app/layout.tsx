'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  getCurrentSession, 
  setCurrentSession 
} from '@/lib/store';
import { UserSession } from '@/types';
import { 
  LayoutDashboard, 
  FolderKanban, 
  FileCheck, 
  Users, 
  Settings, 
  Building, 
  PlusCircle, 
  LogOut, 
  ShieldCheck, 
  Menu, 
  X, 
  FileText,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { Logo } from '@/components/Logo';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Load session from storage or default to first user
    const current = getCurrentSession();
    setSession(current);
  }, []);


  const handleLogout = () => {
    router.push('/login');
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const isSuperAdmin = session.role === 'SUPER_ADMIN';

  const agencyNavItems = [
    { label: 'Vue d\'ensemble', href: '/app/dashboard', icon: LayoutDashboard },
    { label: 'Dossiers visas', href: '/app/dossiers', icon: FolderKanban },
    { label: 'Visas prêts', href: '/app/visas', icon: FileCheck },
    { label: 'Mon Équipe', href: '/app/equipe', icon: Users },
    { label: 'Paramètres agence', href: '/app/parametres', icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Dashboard Opérateur', href: '/app/admin', icon: LayoutDashboard },
    { label: 'Gestion des Agences', href: '/app/admin/agences', icon: Building },
    { label: 'Tous les Dossiers', href: '/app/dossiers', icon: FolderKanban },
  ];

  const navItems = isSuperAdmin ? adminNavItems : agencyNavItems;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* NOINDEX NOFOLLOW for all private app routes (CDC #128) */}
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>

      {/* TOP HEADER */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link href="/app/dashboard" className="flex items-center">
              <Logo size="sm" showText={true} />
            </Link>

            {/* Active Organization Badge (Multi-tenant indicator) */}
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
              <span className="text-xs text-slate-700">Agence active :</span>
              <span className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-brand-600" />
                {session.organization_name}
              </span>
            </div>
          </div>

          {/* User & Role Switcher */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-600 text-white font-bold flex items-center justify-center text-xs">
                  {session.name.charAt(0)}
                </div>
                <div className="hidden md:block text-xs">
                  <p className="font-bold text-slate-800 leading-tight">{session.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{session.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* User Profile Dropdown */}
              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in duration-150">
                  <div className="p-3 border-b border-slate-100 space-y-1">
                    <p className="text-xs font-bold text-slate-900">{session.name}</p>
                    <p className="text-[11px] text-slate-500 font-medium">{session.organization_name}</p>
                    <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200 mt-1">
                      {session.role}
                    </span>
                  </div>
                  <div className="pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* BODY WITH SIDEBAR */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:block w-64 shrink-0 space-y-6">
          {/* Quick Action Button (CDC #134) */}
          {!isSuperAdmin && (
            <Link
              href="/app/dossiers/nouveau"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/30 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nouveau dossier visa</span>
            </Link>
          )}

          {/* Navigation links */}
          <nav className="bg-white rounded-2xl p-3 border border-slate-200 shadow-xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-bold border border-brand-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Security badge info */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Session Chiffrée</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Vos accès sont cantonnés à l&apos;organisation <strong>{session.organization_name}</strong>.
            </p>
          </div>
        </aside>

        {/* MOBILE SIDEBAR MODAL */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
              onClick={() => setSidebarOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white p-6 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-lg">Menu Navigation</span>
                  <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md text-slate-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {!isSuperAdmin && (
                  <Link
                    href="/app/dossiers/nouveau"
                    onClick={() => setSidebarOpen(false)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-brand-600 text-white font-semibold text-sm shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Nouveau dossier visa</span>
                  </Link>
                )}

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                          isActive
                            ? 'bg-brand-50 text-brand-700 font-bold'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-sm font-semibold text-rose-600 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
