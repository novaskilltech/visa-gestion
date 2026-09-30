import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { 
  Bot, 
  Layers, 
  ShieldCheck, 
  FileCheck, 
  Users, 
  Clock, 
  Sparkles, 
  ArrowRight,
  Database,
  Search,
  CheckCircle2
} from 'lucide-react';

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Fonctionnalités B2B
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Tout ce dont votre agence a besoin pour piloter ses visas
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Une infrastructure complète conçue pour éliminer les erreurs manuelles, accélérer les dépôts et offrir une transparence totale à vos équipes.
            </p>
          </div>

          {/* Feature 1 : IA Extraction */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Extraction & Contrôle IA des Passeports
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Dès que vous importez un passeport, le moteur d&apos;analyse optique et de traitement intelligent extrait automatiquement les données MRZ et visuelles : Nom, Prénom, Numéro, Nationalité, Dates de naissance et d&apos;expiration.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Détection automatique des dates d&apos;expiration trop courtes (&lt; 6 mois)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Validation des zones de lecture automatique (bande MRZ)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Champs 100% modifiables et vérifiables avant envoi consulaire</span>
                </li>
              </ul>
            </div>
            <div className="bg-slate-900 rounded-2xl p-6 text-white space-y-4 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
                <span>ANALYSE IA EN DIRECT</span>
                <span className="text-emerald-400">STATUS: 200 OK</span>
              </div>
              <div className="space-y-2 text-slate-300">
                <p>&gt; Lecture du document : passeport_scan_2026.pdf</p>
                <p className="text-brand-400">&gt; Détection de passeport biométrique OACI 9303</p>
                <p>&gt; Extraction MRZ : P&lt;FRAPREVOST&lt;&lt;SARAH&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
                <p className="text-emerald-400">&gt; Score de confiance IA : 99.4%</p>
                <div className="p-3 bg-slate-800 rounded-lg text-[11px] text-slate-300">
                  Voyageur : Sarah Martin | Nat : FRA | Validité : Conforme
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 : Multi-tenant et Rôles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-sm">
            <div className="order-2 lg:order-1 bg-slate-100 rounded-2xl p-8 space-y-4 border border-slate-200">
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                      AA
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Directeur d&apos;Agence (AGENCY_ADMIN)</p>
                      <p className="text-[11px] text-slate-500">Gestion de l&apos;équipe, des dossiers et facturation</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded">Actif</span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                      AU
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-900">Conseiller Voyage (AGENCY_USER)</p>
                      <p className="text-[11px] text-slate-500">Dépôt de dossiers et suivi des voyageurs</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">Actif</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Collaboration Multi-utilisateurs par Agence
              </h2>
              <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                Chaque agence cliente dispose d&apos;un espace dédié où plusieurs collaborateurs peuvent travailler en simultané sans jamais empiéter sur les dossiers des autres agences.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Rôles spécifiques (Administrateur Agence et Collaborateurs)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Isolation stricte garantie au niveau de la base de données (PostgreSQL RLS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Gestion des invitations d&apos;utilisateurs en quelques clics</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Box */}
          <div className="bg-gradient-to-r from-brand-900 to-indigo-900 text-white rounded-3xl p-10 sm:p-14 text-center space-y-6 shadow-xl">
            <h3 className="text-3xl font-bold">Prêt à moderniser la gestion de vos visas ?</h3>
            <p className="text-brand-200 max-w-xl mx-auto text-sm sm:text-base">
              Rejoignez les agences de voyages qui ont déjà abandonné WhatsApp pour Visa Gestion.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl shadow-md transition-all"
              >
                Demander une démonstration
              </Link>
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-xl border border-white/20 transition-all"
              >
                Accéder à l&apos;espace agence
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
