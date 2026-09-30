import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeroVisual } from '@/components/HeroVisual';
import { DemoForm } from '@/components/DemoForm';
import { 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  FolderLock, 
  Bot, 
  Layers, 
  Clock, 
  Search, 
  FileCheck, 
  Users, 
  Eye, 
  Check, 
  Building2 
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION (CDC #115) */}
        <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden gradient-mesh border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-brand-600" />
              <span>Plateforme SaaS B2B dédiée aux professionnels du voyage</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
              La gestion des visas, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-600 via-brand-500 to-indigo-600 bg-clip-text text-transparent">
                enfin centralisée.
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Envoyez les documents de vos voyageurs, suivez chaque dossier et récupérez les visas depuis une seule interface sécurisée.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="#demo-form"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-white bg-brand-600 hover:bg-brand-700 px-8 py-3.5 rounded-xl shadow-lg shadow-brand-600/30 hover:shadow-brand-600/40 transition-all hover:-translate-y-0.5"
              >
                <span>Demander une démo</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-base font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-8 py-3.5 rounded-xl shadow-sm transition-all"
              >
                <span>Se connecter</span>
              </Link>
            </div>

            {/* Target badges */}
            <div className="pt-4 flex flex-wrap justify-center items-center gap-6 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Agences de voyages
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Professionnels Hajj & Omra
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Tour-opérateurs
              </span>
            </div>

            {/* Visual Mock Showcase (CDC #115 & #130) */}
            <div className="pt-10">
              <HeroVisual />
            </div>
          </div>
        </section>

        {/* 2. SECTION PROBLÈME : WhatsApp vs Visa Gestion (CDC #117) */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Le constat terrain
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Vos demandes de visas ne devraient pas être gérées dans WhatsApp.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Fini les fils de discussion interminables, les pièces d&apos;identité dispersées et les statuts incertains la veille d&apos;un départ.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Le chaos actuel */}
              <div className="p-8 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                    <XCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Sans Visa Gestion (Le chaos)</h3>
                    <p className="text-xs text-rose-700">WhatsApp, emails dispersés, dossiers Drive & Excel</p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Documents perdus</strong> : Photos de passeports illisibles ou tronquées compressées par les messageries.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Messages introuvables</strong> : Des dizaines de conversations simultanées où les pièces se perdent.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Fichiers mélangés</strong> : Risque d&apos;associer le visa d&apos;un client au passeport d&apos;un autre voyageur.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Informations ressaisies</strong> : Erreurs manuelles sur les noms, dates de naissance ou numéros de passeport.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                    <span><strong>Dossiers difficiles à suivre</strong> : Impossible de savoir en un coup d&apos;œil ce qui est prêt, bloqué ou en cours.</span>
                  </li>
                </ul>
              </div>

              {/* La solution Visa Gestion */}
              <div className="p-8 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Avec Visa Gestion (La sérénité)</h3>
                    <p className="text-xs text-emerald-700">Interface SaaS unifiée, chiffrée et multi-utilisateurs</p>
                  </div>
                </div>

                <ul className="space-y-4 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Centralisation intégrale</strong> : Chaque agence dispose de son espace clos avec l&apos;ensemble de ses dossiers.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Extraction IA automatique</strong> : Détection instantanée des données passeport et billet sans saisie fastidieuse.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Visibilité temps réel</strong> : Statuts clairs (À vérifier ➔ Prêt ➔ En traitement ➔ Visa prêt).</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Téléchargement instantané</strong> : Visas officiels au format PDF disponibles pour toute votre équipe 24/7.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Conformité RGPD garantie</strong> : Aucune donnée voyageur exposée ou stockée sur des serveurs non autorisés.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SECTION FONCTIONNEMENT (5 ÉTAPES) (CDC #118) */}
        <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Workflow Simplifié
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Comment fonctionne Visa Gestion ?
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Un cycle fluide pensé pour les conseillers voyages et leurs spécialistes visas.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {[
                {
                  step: '01',
                  title: 'Créez le dossier',
                  desc: 'Renseignez la destination, les dates de voyage et le type de séjour en 10 secondes.',
                  icon: Layers,
                },
                {
                  step: '02',
                  title: 'Importez les documents',
                  desc: 'Glissez-déposez le passeport et les réservations de vols de vos voyageurs.',
                  icon: FolderLock,
                },
                {
                  step: '03',
                  title: 'Extraction IA',
                  desc: 'Notre moteur IA analyse les documents et pré-remplit les informations d identité.',
                  icon: Bot,
                },
                {
                  step: '04',
                  title: 'Traitement consulaire',
                  desc: 'Votre société spécialisée prend le relais et soumet les demandes officielles.',
                  icon: Clock,
                },
                {
                  step: '05',
                  title: 'Récupérez le visa',
                  desc: 'Téléchargez les e-visas ou suivez la livraison directement sur votre tableau de bord.',
                  icon: FileCheck,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-2xl font-black text-brand-600 font-mono">
                          {item.step}
                        </span>
                        <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mb-2">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. SECTION EXTRACTION IA (CDC #119) */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Technologie d&apos;Extraction Intelligente
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                L&apos;IA au service de la précision consulaire
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Dites adieu aux fautes de frappe sur les noms composés ou numéros de passeports.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* Passeport Flow */}
              <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-6 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-mono text-brand-400 uppercase tracking-wider">
                    Module 1 : Passeport Scanner
                  </span>
                  <span className="text-xs bg-brand-900 text-brand-300 px-2.5 py-1 rounded-full border border-brand-700">
                    MRZ + Visuel
                  </span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-lg text-slate-300">
                    <span className="text-slate-500 block mb-1">Entrée : Fichier PDF / JPG / PNG</span>
                    passeport_voyageur_scan.pdf
                  </div>
                  <div className="text-center text-brand-400">↓ Moteur Visa Gestion AI ↓</div>
                  <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-700 space-y-1.5 text-slate-200">
                    <div className="flex justify-between"><span className="text-slate-400">Nom :</span> <span className="font-bold text-white">BENALI</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Prénom :</span> <span className="font-bold text-white">Ahmed</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Passeport N° :</span> <span className="font-bold text-white">21CD98765</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Nationalité :</span> <span className="font-bold text-white">Française</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Date Naissance :</span> <span className="font-bold text-white">03/11/1982</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Expiration :</span> <span className="font-bold text-white">22/08/2029</span></div>
                  </div>
                </div>
              </div>

              {/* Billet Flow */}
              <div className="bg-slate-900 text-white rounded-2xl p-8 space-y-6 shadow-xl border border-slate-800">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">
                    Module 2 : Billet d&apos;Avion & PNR
                  </span>
                  <span className="text-xs bg-indigo-900 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-700">
                    GDS & E-Tickets
                  </span>
                </div>
                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-lg text-slate-300">
                    <span className="text-slate-500 block mb-1">Entrée : Confirmation vol / PNR</span>
                    billet_saudia_aller_retour.pdf
                  </div>
                  <div className="text-center text-indigo-400">↓ Moteur Visa Gestion AI ↓</div>
                  <div className="p-4 bg-slate-800/90 rounded-lg border border-slate-700 space-y-1.5 text-slate-200">
                    <div className="flex justify-between"><span className="text-slate-400">Numéro PNR :</span> <span className="font-bold text-white">SV8942</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Compagnie :</span> <span className="font-bold text-white">Saudia Airlines</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Vols :</span> <span className="font-bold text-white">SV142 (Aller) / SV143 (Retour)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Itinéraire :</span> <span className="font-bold text-white">Paris (CDG) ➔ Djeddah (JED)</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Date Départ :</span> <span className="font-bold text-white">15/11/2026</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Date Retour :</span> <span className="font-bold text-white">28/11/2026</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center max-w-2xl mx-auto">
              <p className="text-xs font-semibold text-amber-900">
                🔒 Garantie de contrôle humain : Les informations extraites par l&apos;IA restent 100% vérifiables et modifiables par vos conseillers avant validation définitive.
              </p>
            </div>
          </div>
        </section>

        {/* 5. SECTION SUIVI & PIPELINE STATUTS (CDC #120) */}
        <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Pipeline des Dossiers
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Une visibilité limpide sur chaque étape
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Fini de relancer pour savoir où en est un visa : votre tableau de bord reflète l&apos;avancement réel en direct.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  title: 'À vérifier',
                  desc: 'Dossier créé. Les documents sont déposés et en cours de validation interne par l agence.',
                  badge: 'bg-amber-100 text-amber-800 border-amber-300',
                  color: 'border-amber-400',
                },
                {
                  title: 'Prêt à transmettre',
                  desc: 'Toutes les pièces sont complètes, conformes et prêtes à être envoyées au consulat.',
                  badge: 'bg-blue-100 text-blue-800 border-blue-300',
                  color: 'border-blue-400',
                },
                {
                  title: 'En traitement',
                  desc: 'Dossier déposé auprès des autorités consulaires ou de l ambassade du pays de destination.',
                  badge: 'bg-indigo-100 text-indigo-800 border-indigo-300',
                  color: 'border-indigo-400',
                },
                {
                  title: 'Visa prêt',
                  desc: 'Le visa officiel est délivré et immédiatement téléchargeable au format PDF.',
                  badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                  color: 'border-emerald-500',
                },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`bg-white p-6 rounded-2xl border-t-4 ${step.color} border-slate-200 shadow-sm space-y-3`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-700">Étape 0{idx + 1}</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${step.badge}`}>
                      {step.title}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-base">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. SECTION SÉCURITÉ & MULTI-TENANT (CDC #121) */}
        <section className="py-20 lg:py-28 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                Sécurité & Confidentialité
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Vos données protégées par une forteresse multi-tenant
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                La confidentialité de vos voyageurs et de vos volumes d&apos;affaires est notre priorité absolue.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Espaces Agences Totalement Isolés</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Grâce aux politiques Row Level Security (RLS) PostgreSQL, aucune agence ne peut voir les voyageurs, volumes ou documents d&apos;une autre agence.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Stockage Privé & Liens Éphémères</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Les passeports et visas sont chiffrés au repos et accessibles uniquement par des URLs signées à durée de validité restreinte.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-base">Aucune Donnée sur les Réseaux</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Contrairement aux canaux publics, aucune vignette d&apos;aperçu ou donnée voyageur ne filtre sur les réseaux sociaux ou moteurs de recherche.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 7. SECTION POUR LES AGENCES & BÉNÉFICES (CDC #122) */}
        <section className="py-20 lg:py-28 bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Conçu pour les professionnels
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Tous les atouts pour votre agence
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { title: 'Plusieurs collaborateurs', desc: 'Créez des accès pour chacun de vos conseillers voyages au sein de votre agence.' },
                { title: 'Dossiers centralisés', desc: 'Retrouvez en 1 seconde l historique complet de tous les visas commandés depuis 1 an.' },
                { title: 'Recherche instantanée', desc: 'Recherchez par nom de voyageur, numéro de passeport ou référence de dossier.' },
                { title: 'Accès permanent 24/7', desc: 'Téléchargez les visas le week-end ou la veille du vol sans attendre une réponse par email.' },
                { title: 'Notifications automatiques', desc: 'Soyez prévenu dès qu un visa est prêt ou si une pièce justificative manque.' },
                { title: 'Moins d échanges inutiles', desc: 'Divisez par 4 le temps passé à envoyer des messages de relance sans valeur ajoutée.' },
              ].map((benefit, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{benefit.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. FORMULAIRE DE DEMANDE DE DÉMO (CDC #123 & #124) */}
        <section id="demo-form" className="py-20 lg:py-28 bg-gradient-to-b from-white to-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <DemoForm />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
