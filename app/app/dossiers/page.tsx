'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentSession, getCasesForSession } from '@/lib/store';
import { VisaCase, UserSession, CaseStatus } from '@/types';
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Layers, 
  AlertCircle,
  FileText,
  FileCheck,
  Plane,
  Activity
} from 'lucide-react';

export default function DossiersPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [cases, setCases] = useState<VisaCase[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      setCases(getCasesForSession(current));
    }
  }, []);

  if (!session) return null;

  const filtered = cases.filter(c => {
    const matchSearch = 
      c.traveler_first_name.toLowerCase().includes(search.toLowerCase()) ||
      c.traveler_last_name.toLowerCase().includes(search.toLowerCase()) ||
      c.reference.toLowerCase().includes(search.toLowerCase()) ||
      c.destination_country.toLowerCase().includes(search.toLowerCase()) ||
      (c.flight_pnr && c.flight_pnr.toLowerCase().includes(search.toLowerCase())) ||
      (c.return_flight_pnr && c.return_flight_pnr.toLowerCase().includes(search.toLowerCase()));
    
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'VISA_PRET':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-300 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            VISA PRÊT
          </span>
        );
      case 'EN_TRAITEMENT':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-md border border-sky-300">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping"></span>
            EN COURS
          </span>
        );
      case 'PRET_A_TRANSMETTRE':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-300">
            <Layers className="w-3 h-3 text-blue-600" />
            TRANSMISSION
          </span>
        );
      case 'A_VERIFIER':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-300">
            <AlertCircle className="w-3 h-3 text-amber-600" />
            À VÉRIFIER
          </span>
        );
      case 'TERMINE':
        return (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300">
            CLÔTURÉ
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  const tabs = [
    { id: 'ALL', label: 'Tous', count: cases.length },
    { id: 'A_VERIFIER', label: 'À vérifier', count: cases.filter(c => c.status === 'A_VERIFIER').length },
    { id: 'PRET_A_TRANSMETTRE', label: 'Prêts', count: cases.filter(c => c.status === 'PRET_A_TRANSMETTRE').length },
    { id: 'EN_TRAITEMENT', label: 'En traitement', count: cases.filter(c => c.status === 'EN_TRAITEMENT').length },
    { id: 'VISA_PRET', label: 'Visas prêts', count: cases.filter(c => c.status === 'VISA_PRET').length },
    { id: 'TERMINE', label: 'Terminés', count: cases.filter(c => c.status === 'TERMINE').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-aero-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900 text-sky-300 border border-sky-500/30">
              Terminal Registre
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Organisation: <strong className="text-slate-900">{session.organization_name}</strong>
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            Gestionnaire des Dossiers Visas
          </h1>
          <p className="text-xs text-slate-500">
            {filtered.length} dossier(s) indexé(s) avec pièces d&apos;identité et billets rattachés.
          </p>
        </div>
        <Link
          href="/app/dossiers/nouveau"
          className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/25 transition-all hover:scale-102"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nouveau dossier voyageur</span>
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-aero-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-sky-300 shadow-sm border border-sky-500/40'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                statusFilter === tab.id ? 'bg-sky-500/20 text-sky-200' : 'bg-white text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher voyageur, passeport, PNR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-sky-500 text-slate-900 font-medium"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-aero-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100">
              <FileCheck className="w-7 h-7" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Aucun dossier dans cette sélection</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Déposez vos passeports et billets d&apos;avion pour que le moteur OCR initialise automatiquement vos dossiers.
            </p>
            <div className="pt-2">
              <Link
                href="/app/dossiers/nouveau"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Créer un nouveau dossier</span>
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
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Vols & PNR</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Départ</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link href={`/app/dossiers/${c.id}`} className="aero-pnr-badge hover:border-sky-500 hover:text-sky-900 transition-colors">
                        {c.reference}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">
                        {c.traveler_last_name.toUpperCase()} {c.traveler_first_name}
                      </span>
                      {c.traveler_passport_num && (
                        <span className="text-[10px] font-mono text-slate-400 block font-medium">
                          {c.traveler_passport_num} • {c.traveler_nationality || 'FRA'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {c.destination_country}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.travel_type === 'OMRA_HAJJ' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px]">
                          Omra / Hajj
                        </span>
                      ) : (
                        <span className="text-[11px]">{c.travel_type}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {c.has_separate_tickets || (c.return_flight_pnr && c.return_flight_pnr.trim()) ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                            A: {c.flight_pnr || 'N/A'}
                          </span>
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-purple-50 text-purple-800 px-1.5 py-0.5 rounded border border-purple-200 ml-1">
                            R: {c.return_flight_pnr || 'N/A'}
                          </span>
                        </div>
                      ) : c.flight_pnr ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          <Plane className="w-3 h-3 text-slate-500" />
                          {c.flight_pnr}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">Non renseigné</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                      {c.assigned_provider_name && (
                        <div className="mt-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                            → {c.assigned_provider_name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {c.departure_date || 'Non défini'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status === 'VISA_PRET' ? (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-102"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Visa</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 font-bold px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <span>Voir</span>
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
