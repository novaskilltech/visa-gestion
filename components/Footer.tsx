import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';
import { Logo } from '@/components/Logo';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Col 1 : Branding */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="md" variant="dark" />
            <p className="text-sm text-slate-400 leading-relaxed">
              La plateforme SaaS B2B dédiée aux agences de voyages et professionnels du tourisme pour centraliser, traiter et suivre les formalités de visas.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium pt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Isolation multi-tenant & Données chiffrées</span>
            </div>
          </div>

          {/* Col 2 : Produit */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Plateforme
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/fonctionnalites" className="hover:text-white transition-colors">
                  Extraction IA des passeports
                </Link>
              </li>
              <li>
                <Link href="/fonctionnalites" className="hover:text-white transition-colors">
                  Suivi des dossiers en direct
                </Link>
              </li>
              <li>
                <Link href="/fonctionnalites" className="hover:text-white transition-colors">
                  Délivrance sécurisée des visas
                </Link>
              </li>
              <li>
                <Link href="/securite" className="hover:text-white transition-colors">
                  Architecture & Sécurité RLS
                </Link>
              </li>
              <li>
                <Link href="/tarifs" className="hover:text-white transition-colors">
                  Tarification agences
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 : Agences partenaires */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Solutions Métier
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Agences de voyages</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Professionnels Hajj & Omra</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Tour-opérateurs & Réceptifs</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-400" />
                <span>Gestionnaires d'affaires</span>
              </li>
            </ul>
          </div>

          {/* Col 4 : Sécurité & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Accès & Conformité
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Espace Agence Connectée
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Demande d'accès / Démo
                </Link>
              </li>
              <li className="text-xs text-slate-400 pt-3">
                Hébergement certifié en Union Européenne. Chiffrement AES-256 et politiques de rétention RGPD strictes.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Visa Gestion SAS. Tous droits réservés.</p>
          <div className="flex items-center gap-6">
            <span>Conformité RGPD</span>
            <span>Isolation RLS stricte</span>
            <span>Zéro donnée voyageur sur les réseaux sociaux</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
