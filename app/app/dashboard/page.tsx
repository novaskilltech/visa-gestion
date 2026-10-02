'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getCurrentSession, 
  getCasesForSession, 
  getDashboardStats 
} from '@/lib/store';
import { VisaCase, UserSession } from '@/types';
import { 
  PlusCircle, 
  Clock, 
  FileCheck, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  ArrowRight, 
  Download, 
  Layers,
  Plane,
  FileText,
  Sparkles,
  ShieldCheck,
  Bot,
  Zap,
  Activity
} from 'lucide-react';

export default function DashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [cases, setCases] = useState<VisaCase[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      const userCases = getCasesForSession(current);
      setCases(userCases);
    }
  }, []);

  if (!session) return null;

  const stats = getDashboardStats(session);

  const filteredCases = cases.filter(c => 
    c.traveler_first_name.toLowerCase().includes(search.toLowerCase()) ||
    c.traveler_last_name.toLowerCase().includes(search.toLowerCase()) ||
    c.reference.toLowerCase().includes(search.toLowerCase()) ||
    c.destination_country.toLowerCase().includes(search.toLowerCase()) ||
    (c.flight_pnr && c.flight_pnr.toLowerCase().includes(search.toLowerCase())) ||
    (c.return_flight_pnr && c.return_flight_pnr.toLowerCase().includes(search.toLowerCase()))
  );

  const getStatusBadge = (status: VisaCase['status']) => {
    switch (status) {
      case 'VISA_PRET':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            VISA PRÊT
          </span>
        );
      case 'EN_TRAITEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
            EN TRAITEMENT
          </span>
        );
      case 'PRET_A_TRANSMETTRE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-300">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            TRANSMISSION
          </span>
        );
      case 'A_VERIFIER':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            DOCS MANQUANTS
          </span>
        );
      case 'TERMINE':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300">
            CLÔTURÉ
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* COCKPIT HEADER AERO-TECH */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-aero-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-sky-300 border border-sky-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              {session.role === 'SUPER_ADMIN' ? 'Centre Consulaire France Elite' : 'Terminal Agence'}
            </span>
            <span className="text-xs text-slate-500">
              Organisation : <strong className="text-slate-900 font-bold">{session.organization_name}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Console de Contrôle des Visas
          </h1>
          <p className="text-xs text-slate-500">
            Traitement haute vitesse, extraction biométrique et synchronisation PNR en direct.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/app/dossiers/nouveau"
            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 hover:shadow-sky-600/35 transition-all hover:scale-102"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nouveau dossier (Multi-Scan IA)</span>
          </Link>
        </div>
      </div>

      {/* BENTO GRID KPI AERO-TECH (CDC #134) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : En traitement consulaire */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-aero-sm hover:border-sky-300 transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Dossiers en cours</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">
            {stats.en_traitement + stats.pret_transmettre}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] text-sky-700 font-medium">
            <Activity className="w-3.5 h-3.5 text-sky-500" />
            <span>Consulat & transmission active</span>
          </div>
        </div>

        {/* KPI 2 : À vérifier */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-aero-sm hover:border-amber-300 transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Pièces à vérifier</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-amber-600 font-mono">
            {stats.a_verifier}
          </p>
          <p className="text-[11px] text-amber-700 font-medium">
            Lecture OCR ou billet à compléter
          </p>
        </div>

        {/* KPI 3 : Visas Prêts */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-gradient-to-b from-white to-emerald-50/30 shadow-aero-sm hover:border-emerald-400 transition-colors space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-emerald-900">Visas délivrés</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 font-mono">
            {stats.visa_pret}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            <span>Téléchargeables immédiatement</span>
          </p>
        </div>

        {/* KPI 4 : Total Historique */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-aero-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Total dossiers</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 font-mono">
            {stats.total}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            Base certifiée de l&apos;agence
          </p>
        </div>
      </div>

      {/* RECENT CASES RADAR TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-aero-card overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <span>Dossiers de visa en direct</span>
            </h2>
            <p className="text-xs text-slate-500">
              Reconnaissance OACI 9303, suivi consulaire et billets d&apos;avion synchronisés
            </p>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher voyageur, PNR, réf..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white text-slate-900 font-medium shadow-2xs"
            />
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100 shadow-inner">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Aucun dossier trouvé</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Glissez-déposez vos passeports et billets d&apos;avion pour que le moteur OCR initialise automatiquement vos dossiers.
            </p>
            <div className="pt-2">
              <Link
                href="/app/dossiers/nouveau"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Créer un premier dossier</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Voyageur & Identité</th>
                  <th className="py-3 px-4">Destination & Séjour</th>
                  <th className="py-3 px-4">Vols & PNR Détectés</th>
                  <th className="py-3 px-4">Statut Visa</th>
                  <th className="py-3 px-4">Date Départ</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Référence */}
                    <td className="py-3.5 px-4">
                      <Link href={`/app/dossiers/${c.id}`} className="aero-pnr-badge hover:border-sky-500 hover:text-sky-900 transition-colors">
                        {c.reference}
                      </Link>
                    </td>

                    {/* Voyageur */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {c.traveler_last_name.toUpperCase()} {c.traveler_first_name}
                      </span>
                      {c.traveler_passport_num ? (
                        <span className="font-mono text-[10px] text-slate-400 block font-medium">
                          Passeport: {c.traveler_passport_num}
                        </span>
                      ) : null}
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{c.destination_country}</span>
                      <span className="text-[10px] text-slate-400">
                        {c.travel_type === 'OMRA_HAJJ' ? 'Pèlerinage Omra' : c.travel_type}
                      </span>
                    </td>

                    {/* Vols & PNR */}
                    <td className="py-3.5 px-4">
                      {c.has_separate_tickets || (c.return_flight_pnr && c.return_flight_pnr.trim()) ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                            Aller: {c.flight_pnr || 'N/A'}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200 ml-1">
                            Retour: {c.return_flight_pnr || 'N/A'}
                          </span>
                        </div>
                      ) : c.flight_pnr ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          <Plane className="w-3 h-3 text-slate-500" />
                          {c.flight_company ? `${c.flight_company} (${c.flight_pnr})` : c.flight_pnr}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Non renseigné</span>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                    </td>

                    {/* Date départ */}
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {c.departure_date || 'Non renseigné'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {c.status === 'VISA_PRET' ? (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Télécharger</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <span>Ouvrir</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
