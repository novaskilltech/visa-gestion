import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { CheckCircle2, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
              Offre B2B Sur-Mesure
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Tarification professionnelle sur demande
            </h1>
            <p className="text-slate-600 text-base sm:text-lg">
              Une formule adaptée au volume de visas traités chaque mois par votre agence, avec ou sans engagement de volume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Formule 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Agence Locale</span>
                <h3 className="text-2xl font-bold text-slate-900">À l&apos;Acte / Consommation</h3>
                <p className="text-xs text-slate-500">Pour les agences traitant des volumes ponctuels de visas touristiques.</p>
                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Facturation par visa traité</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Jusqu&apos;à 3 collaborateurs</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Extraction IA des passeports</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Support standard sous 24h</div>
                </div>
              </div>
              <Link
                href="/contact"
                className="w-full text-center py-3 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Demander un devis
              </Link>
            </div>

            {/* Formule 2 : Recommandée */}
            <div className="bg-white p-8 rounded-3xl border-2 border-brand-500 shadow-xl relative flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Le plus plébiscité
              </div>
              <div className="space-y-4">
                <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">Tour-Opérateur & Omra</span>
                <h3 className="text-2xl font-bold text-slate-900">Abonnement + Volume</h3>
                <p className="text-xs text-slate-500">Pour les agences de voyages régulières et spécialistes Hajj / Omra.</p>
                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tarif préférentiel par visa</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Nombre illimité de collaborateurs</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Extraction IA passeport & billet</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Téléchargement direct des e-visas</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Agent consulaire dédié</div>
                </div>
              </div>
              <Link
                href="/contact"
                className="w-full text-center py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30"
              >
                Demander une étude personnalisée
              </Link>
            </div>

            {/* Formule 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Réseau & Franchise</span>
                <h3 className="text-2xl font-bold text-slate-900">Multi-Agences / Enterprise</h3>
                <p className="text-xs text-slate-500">Pour les réseaux d&apos;agences avec plusieurs points de vente ou filiales.</p>
                <div className="pt-4 border-t border-slate-100 space-y-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-organisations sous un même contrat</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> SLA consulaire garanti</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Intégration API / Webhooks sur mesure</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Facturation mensuelle consolidée</div>
                </div>
              </div>
              <Link
                href="/contact"
                className="w-full text-center py-3 rounded-xl border border-slate-300 font-semibold text-xs text-slate-700 hover:bg-slate-50"
              >
                Contacter la direction
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
