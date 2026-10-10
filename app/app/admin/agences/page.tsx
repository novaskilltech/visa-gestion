'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  getCurrentSession, 
  getAllOrganizations, 
  updateOrganizationStatus, 
  getAllMembers,
  getCasesForSession,
  getAvailableAccounts
} from '@/lib/store';
import { Organization, UserSession, OrganizationMember, VisaCase, AccountCredential } from '@/types';
import { AddAgencyModal } from '@/components/AddAgencyModal';
import { 
  Building, 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  Ban, 
  Plus, 
  ArrowLeft,
  Search,
  ExternalLink,
  KeyRound,
  Lock
} from 'lucide-react';

export default function AdminAgenciesPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [cases, setCases] = useState<VisaCase[]>([]);
  const [accounts, setAccounts] = useState<AccountCredential[]>([]);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      setOrganizations(getAllOrganizations());
      setMembers(getAllMembers());
      setCases(getCasesForSession(current));
      setAccounts(getAvailableAccounts());
    }
  }, []);

  if (!session) return null;

  const handleToggleStatus = (orgId: string, currentStatus: Organization['status']) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    updateOrganizationStatus(orgId, nextStatus);
    setOrganizations(getAllOrganizations());
    setFeedback(`Statut de l'organisation mis à jour : ${nextStatus}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    o.country.toLowerCase().includes(search.toLowerCase()) ||
    (o.email && o.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au dashboard opérateur</span>
        </Link>
        <span className="text-xs text-slate-400">
          Super Admin Console
        </span>
      </div>

      {/* Header (CDC #136) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Gestion des Agences Clientes (Tenants)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Administration des comptes B2B, habilitations et attribution des identifiants d&apos;accès.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher agence..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all shrink-0 hover:scale-102"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une agence</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-800 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-purple-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Agencies Table (CDC #136) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Agence / Nom légal</th>
                <th className="py-3 px-4">Identifiant (Login)</th>
                <th className="py-3 px-4">Contact / Email</th>
                <th className="py-3 px-4">Dossiers en cours</th>
                <th className="py-3 px-4">Dossiers terminés</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrgs.map((org) => {
                const orgMembers = members.filter(m => m.organization_id === org.id);
                const adminUser = orgMembers.find(m => m.role === 'AGENCY_ADMIN' || m.role === 'SUPER_ADMIN') || orgMembers[0];
                const orgAccount = accounts.find(a => a.organization_id === org.id);
                const orgCases = cases.filter(c => c.organization_id === org.id);
                const casesEnCours = orgCases.filter(c => c.status !== 'TERMINE').length;
                const casesTermines = orgCases.filter(c => c.status === 'TERMINE').length;

                return (
                  <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-sm">{org.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{org.legal_name || org.name} • {org.country}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {orgAccount ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200 font-mono text-xs font-bold">
                          <KeyRound className="w-3 h-3 text-purple-600" />
                          <span>{orgAccount.username}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-mono text-[11px] italic">Non configuré</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {adminUser ? (
                        <div>
                          <p className="font-semibold text-slate-800">{adminUser.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{adminUser.email}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Non assigné</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {orgMembers.length} collaborateur(s)
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-bold text-brand-700 bg-brand-50 border border-brand-200">
                        {casesEnCours}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {casesTermines}
                    </td>
                    <td className="py-3.5 px-4">
                      {org.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          <Ban className="w-3 h-3" />
                          SUSPENDUE
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(org.id, org.status)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                          org.status === 'ACTIVE'
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-300'
                        }`}
                      >
                        {org.status === 'ACTIVE' ? 'Suspendre' : 'Réactiver'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL D'AJOUT D'AGENCE / PRESTATAIRE AVEC LOGIN ET MOT DE PASSE */}
      {session && (
        <AddAgencyModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          session={session}
          onCreated={(newOrg) => {
            setOrganizations(getAllOrganizations());
            setMembers(getAllMembers());
            setAccounts(getAvailableAccounts());
            setFeedback(`Nouvelle structure "${newOrg.name}" enregistrée avec succès avec son compte d'accès.`);
            setTimeout(() => setFeedback(null), 4000);
          }}
        />
      )}
    </div>
  );
}
