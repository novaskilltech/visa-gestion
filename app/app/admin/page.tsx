'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getCurrentSession, 
  getAllOrganizations, 
  getCasesForSession 
} from '@/lib/store';
import { Organization, VisaCase, UserSession } from '@/types';
import { 
  Building, 
  Layers, 
  Clock, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Search
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allCases, setAllCases] = useState<VisaCase[]>([]);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('ALL');

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      setOrganizations(getAllOrganizations());
      setAllCases(getCasesForSession(current));
    }
  }, []);

  if (!session) return null;

  const activeOrgs = organizations.filter(o => o.status === 'ACTIVE').length;
  
  const filteredCases = selectedOrgFilter === 'ALL'
    ? allCases
    : allCases.filter(c => c.organization_id === selectedOrgFilter);

  const dossiersRecus = filteredCases.length;
  const dossiersEnTraitement = filteredCases.filter(c => c.status === 'EN_TRAITEMENT').length;
  const docsManquants = filteredCases.filter(c => c.status === 'A_VERIFIER').length;
  const visasPrets = filteredCases.filter(c => c.status === 'VISA_PRET').length;
  const dossiersTermines = filteredCases.filter(c => c.status === 'TERMINE').length;

  return (
    <div className="space-y-6">
      {/* Header (CDC #135) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200 mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Console Opérateur Central
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Dashboard Super Admin — Visa Gestion
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Supervision globale des agences clientes et du flux consulaire unifié.
          </p>
        </div>

        <Link
          href="/app/admin/agences"
          className="inline-flex items-center gap-2 py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm"
        >
          <Building className="w-4 h-4" />
          <span>Gérer les agences clientes</span>
        </Link>
      </div>

      {/* KPI Operator Grid (CDC #135) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 block">Agences actives</span>
          <p className="text-2xl font-black text-slate-900">{activeOrgs}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% opérationnelles</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 block">Dossiers reçus</span>
          <p className="text-2xl font-black text-brand-600">{dossiersRecus}</p>
          <span className="text-[10px] text-slate-400">Total plateforme</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 block">En traitement</span>
          <p className="text-2xl font-black text-indigo-600">{dossiersEnTraitement}</p>
          <span className="text-[10px] text-indigo-600 font-semibold">Auprès consulats</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 block">Docs manquants</span>
          <p className="text-2xl font-black text-amber-600">{docsManquants}</p>
          <span className="text-[10px] text-amber-600 font-semibold">À vérifier</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 block">Visas prêts</span>
          <p className="text-2xl font-black text-emerald-600">{visasPrets}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">Délivrés aux agences</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 block">Terminés</span>
          <p className="text-2xl font-black text-slate-700">{dossiersTermines}</p>
          <span className="text-[10px] text-slate-400">Archivés avec succès</span>
        </div>
      </div>

      {/* Operator Filter by Agency (CDC #135) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">Filtrer par agence :</span>
          <select
            value={selectedOrgFilter}
            onChange={(e) => setSelectedOrgFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
          >
            <option value="ALL">Toutes les agences partenaires</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-slate-500">
          Vue transversale réservée au rôle SUPER_ADMIN & VISA_AGENT
        </span>
      </div>

      {/* Cross-tenant Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-900">Flux d&apos;activité des dossiers</h2>
          <span className="text-xs text-slate-400">{filteredCases.length} dossier(s)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Référence</th>
                <th className="py-3 px-4">Agence cliente</th>
                <th className="py-3 px-4">Voyageur</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-brand-700">
                    <Link href={`/app/dossiers/${c.id}`} className="hover:underline">
                      {c.reference}
                    </Link>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    {c.organization_name}
                  </td>
                  <td className="py-3 px-4 text-slate-900 font-medium">
                    {c.traveler_last_name.toUpperCase()} {c.traveler_first_name}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {c.destination_country}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      href={`/app/dossiers/${c.id}`}
                      className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1"
                    >
                      <span>Traiter</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
