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
  FileText
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
    c.destination_country.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: VisaCase['status']) => {
    switch (status) {
      case 'VISA_PRET':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Visa prêt
          </span>
        );
      case 'EN_TRAITEMENT':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            <Clock className="w-3.5 h-3.5" />
            En traitement
          </span>
        );
      case 'PRET_A_TRANSMETTRE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <Layers className="w-3.5 h-3.5" />
            Prêt à transmettre
          </span>
        );
      case 'A_VERIFIER':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" />
            À vérifier
          </span>
        );
      case 'TERMINE':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            Terminé
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome header & CTA */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Bonjour, {session.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Espace agence : <strong className="text-slate-800">{session.organization_name}</strong> • {cases.length} dossier(s) actif(s)
          </p>
        </div>
        <Link
          href="/app/dossiers/nouveau"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nouveau dossier visa</span>
        </Link>
      </div>

      {/* KPI Cards (CDC #134) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Dossiers en cours</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.en_traitement + stats.pret_transmettre}</p>
          <p className="text-[11px] text-blue-600 font-medium">Consulat & transmission</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Documents demandés</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.a_verifier}</p>
          <p className="text-[11px] text-amber-600 font-medium">À compléter ou vérifier</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Visas prêts</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{stats.visa_pret}</p>
          <p className="text-[11px] text-emerald-600 font-medium">Disponibles immédiatement</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Dossiers terminés</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.termine}</p>
          <p className="text-[11px] text-slate-400 font-medium">Historique agence</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Dossiers récents de l&apos;agence</h2>
            <p className="text-xs text-slate-500">Isolation multi-tenant active (uniquement les dossiers de votre agence)</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher voyageur, réf..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900"
            />
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto border border-brand-100">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Aucun dossier pour le moment</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Votre agence démarre avec une base vierge de tout dossier fictif. Déposez vos vrais passeports pour générer vos dossiers de visas.
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
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Référence</th>
                  <th className="py-3 px-4">Voyageur</th>
                  <th className="py-3 px-4">Destination</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4">Date départ</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                      <Link href={`/app/dossiers/${c.id}`} className="hover:underline">
                        {c.reference}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {c.traveler_last_name.toUpperCase()} {c.traveler_first_name}
                      {c.traveler_passport_num && (
                        <span className="block text-[10px] font-mono text-slate-400 font-normal">
                          Passeport: {c.traveler_passport_num}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800">{c.destination_country}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.travel_type === 'OMRA_HAJJ' ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                          Omra / Hajj
                        </span>
                      ) : (
                        <span className="text-[11px]">{c.travel_type}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {c.departure_date || 'Non renseigné'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status === 'VISA_PRET' ? (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Télécharger</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 font-semibold"
                        >
                          <span>Détails</span>
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
