'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, ArrowRight, Menu, X, FileText } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { label: 'Fonctionnalités', href: '/fonctionnalites' },
    { label: 'Sécurité & RGPD', href: '/securite' },
    { label: 'Tarification', href: '/tarifs' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Visa Gestion
                <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 font-semibold tracking-wide">
                  B2B
                </span>
              </span>
              <p className="text-xs text-slate-700">Hub sécurisé pour agences</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-brand-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 px-4 py-2.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 px-5 py-2.5 rounded-lg shadow-sm shadow-brand-600/30 hover:shadow-brand-600/40 transition-all"
            >
              <span>Demander une démo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block text-base font-medium text-slate-700 py-2"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-semibold text-slate-700 py-2.5 rounded-lg border border-slate-200"
            >
              Se connecter
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center text-sm font-semibold text-white bg-brand-600 py-2.5 rounded-lg shadow-sm"
            >
              Demander une démo
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
