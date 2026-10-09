'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getCurrentSession, 
  getAllOrganizations, 
  getCasesForSession,
  getAvailablePrestataires,
  transmitCaseToProvider
} from '@/lib/store';
import { Organization, VisaCase, UserSession } from '@/types';
import { TransmitModal } from '@/components/TransmitModal';
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
  Search,
  Send,
  UserCheck
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [allCases, setAllCases] = useState<VisaCase[]>([]);
  const [availablePrestataires, setAvailablePrestataires] = useState<Organization[]>([]);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState('ALL');
  const [transmittingCase, setTransmittingCase] = useState<VisaCase | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      setOrganizations(getAllOrganizations());
      setAllCases(getCasesForSession(current));
      setAvailablePrestataires(getAvailablePrestataires());
    }
  }, []);

  if (!session) return null;

  const handleTransmit = (providerId: string, providerName: string, notes: string) => {
    if (!transmittingCase) return;
    const res = transmitCaseToProvider(transmittingCase.id, providerId, providerName, notes, session);
    if (res) {
      // Recharger la liste locale
      setAllCases(getCasesForSession(session));
      setFeedbackMsg(`Dossier ${transmittingCase.reference} transmis avec succès à ${providerName}.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
    setTransmittingCase(null);
  };

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
          <h1 className="text-2xl font-bold text-slate-900">
            Supervision Cross-Tenant
          </h1>
          <p className="text-xs text-slate-500">
            Vue consolidée multi-agences et attribution des dossiers aux prestataires.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/app/admin/organisations"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Building className="w-4 h-4" />
            <span>Gérer les agences</span>
          </Link>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* KPI Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total dossiers</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{dossiersRecus}</p>
          <span className="text-[10px] text-slate-400">Toutes agences</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">À vérifier</span>
          <p className="text-2xl font-extrabold text-amber-700 mt-1">{docsManquants}</p>
          <span className="text-[10px] text-amber-600">En attente pièces</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wider block">En traitement</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">{dossiersEnTraitement}</p>
          <span className="text-[10px] text-blue-600">Chez prestataire</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block">Visas émis</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{visasPrets}</p>
          <span className="text-[10px] text-emerald-600">Prêts délivrance</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
          <span className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider block">Partenaires</span>
          <p className="text-2xl font-extrabold text-purple-700 mt-1">{activeOrgs}</p>
          <span className="text-[10px] text-purple-600">Actifs</span>
        </div>
      </div>

      {/* Tenant Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
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
                <th className="py-3 px-4">Prestataire assigné</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                  <td className="py-3 px-4">
                    {c.assigned_provider_name ? (
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          <UserCheck className="w-3 h-3 text-sky-600" />
                          {c.assigned_provider_name}
                        </span>
                        <button
                          onClick={() => setTransmittingCase(c)}
                          className="text-[10px] text-slate-400 hover:text-slate-700 underline"
                          title="Réassigner à un autre prestataire"
                        >
                          Changer
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setTransmittingCase(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                          c.status === 'PRET_A_TRANSMETTRE'
                            ? 'bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white shadow-xs animate-pulse'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Send className="w-3 h-3" />
                        <span>Transmettre</span>
                      </button>
                    )}
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

      {/* Modal de transmission */}
      {transmittingCase && (
        <TransmitModal
          isOpen={!!transmittingCase}
          onClose={() => setTransmittingCase(null)}
          onTransmit={handleTransmit}
          providers={availablePrestataires}
          caseReference={transmittingCase.reference}
          travelerName={`${transmittingCase.traveler_last_name.toUpperCase()} ${transmittingCase.traveler_first_name}`}
          currentProviderId={transmittingCase.assigned_provider_id}
          documentsCount={transmittingCase.documents?.length || 0}
        />
      )}
    </div>
  );
}
