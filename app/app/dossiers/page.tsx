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
  FileText
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
      c.destination_country.toLowerCase().includes(search.toLowerCase());
    
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'VISA_PRET':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Visa prêt
          </span>
        );
      case 'EN_TRAITEMENT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
            <Clock className="w-3 h-3" />
            En traitement
          </span>
        );
      case 'PRET_A_TRANSMETTRE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
            <Layers className="w-3 h-3" />
            Prêt à transmettre
          </span>
        );
      case 'A_VERIFIER':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <AlertCircle className="w-3 h-3" />
            À vérifier
          </span>
        );
      case 'TERMINE':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
            Terminé
          </span>
        );
      default:
        return <span className="text-xs text-slate-500">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Dossiers de visas
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tous les dossiers gérés pour <strong>{session.organization_name}</strong> ({filtered.length} affiché(s))
          </p>
        </div>
        <Link
          href="/app/dossiers/nouveau"
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Nouveau dossier</span>
        </Link>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'Tous les dossiers' },
            { id: 'A_VERIFIER', label: 'À vérifier' },
            { id: 'PRET_A_TRANSMETTRE', label: 'Prêts' },
            { id: 'EN_TRAITEMENT', label: 'En traitement' },
            { id: 'VISA_PRET', label: 'Visas prêts' },
            { id: 'TERMINE', label: 'Terminés' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === tab.id
                  ? 'bg-brand-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher voyageur, passeport..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Aucun dossier trouvé</p>
            <p className="text-xs text-slate-400">Essayez de modifier votre recherche ou filtre.</p>
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
                  <th className="py-3 px-4">Départ</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-brand-700">
                      <Link href={`/app/dossiers/${c.id}`} className="hover:underline">
                        {c.reference}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-900 block">
                        {c.traveler_last_name.toUpperCase()} {c.traveler_first_name}
                      </span>
                      {c.traveler_passport_num && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.traveler_passport_num} • {c.traveler_nationality || 'FRA'}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {c.destination_country}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {c.travel_type}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(c.status)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                      {c.departure_date || 'Non défini'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {c.status === 'VISA_PRET' ? (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Visa</span>
                        </Link>
                      ) : (
                        <Link
                          href={`/app/dossiers/${c.id}`}
                          className="inline-flex items-center gap-1 text-slate-600 hover:text-brand-600 font-semibold"
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
