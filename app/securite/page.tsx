import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  FileCheck2, 
  EyeOff, 
  KeyRound, 
  Server, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Sécurité & Protection des Données
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Une architecture pensée pour les données d&apos;identité sensibles
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              La gestion des visas implique des passeports, des pièces d&apos;identité et des itinéraires de voyage. Voici comment nous garantissons leur étanchéité.
            </p>
          </div>

          {/* Grid Security Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Isolation Multi-Tenant par RLS
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chaque requête en base de données vérifie cryptographiquement l&apos;appartenance de l&apos;utilisateur à son organisation. Une agence A ne peut mathématiquement jamais exécuter une requête sur les données de l&apos;agence B.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Stockage Privé & Liens Signés
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Les pièces d&apos;identité déposées ne sont jamais publiques. Tout téléchargement requiert un jeton d&apos;accès temporaire (URL signée expirant au bout de quelques minutes), réservé aux membres autorisés.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Zéro Fuite sur Réseaux Sociaux
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Les balises Open Graph et Twitter Cards des pages applicatives sont neutralisées. Aucun nom de voyageur, numéro de dossier ou passeport ne peut apparaître dans les aperçus de liens de messagerie.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Authentification Forte & RBAC
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Contrôle d&apos;accès basé sur les rôles (SUPER_ADMIN, VISA_AGENT, AGENCY_ADMIN, AGENCY_USER). Gestion des sessions avec protection contre les attaques par force brute et expiration automatique.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Hébergement en Union Européenne
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Nos serveurs et bases de données sont localisés au sein de centres de données conformes aux réglementations européennes, garantissant la souveraineté et le respect des normes RGPD.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Audit & Traçabilité Complète
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Chaque action (dépôt de document, extraction IA, consultation de visa, modification de statut) fait l&apos;objet d&apos;un enregistrement horodaté permettant une traçabilité totale en cas de litige.
              </p>
            </div>
          </div>

          {/* Banner */}
          <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6 border border-slate-800">
            <div>
              <h4 className="text-white font-bold text-lg">Vous avez des exigences particulières de conformité ?</h4>
              <p className="text-xs text-slate-400 mt-1">Nos équipes peuvent vous fournir notre politique de sécurité et notre registre de traitement des données.</p>
            </div>
            <Link
              href="/contact"
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-6 py-3 rounded-xl text-sm whitespace-nowrap shadow-sm"
            >
              Échanger avec notre DPO
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
