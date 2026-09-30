'use client';

import { useState, useEffect } from 'react';
import { getCurrentSession, getAllMembers } from '@/lib/store';
import { OrganizationMember, UserSession } from '@/types';
import { Users, UserPlus, Shield, CheckCircle2, Mail, Clock } from 'lucide-react';

export default function TeamPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<'AGENCY_ADMIN' | 'AGENCY_USER'>('AGENCY_USER');
  const [invitedSuccess, setInvitedSuccess] = useState(false);

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      const all = getAllMembers();
      // Multi-tenant filter : only members of current organization (or all if super admin)
      if (current.role === 'SUPER_ADMIN') {
        setMembers(all);
      } else {
        setMembers(all.filter(m => m.organization_id === current.organization_id));
      }
    }
  }, []);

  if (!session) return null;

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteName) return;

    const newMember: OrganizationMember = {
      id: `mem-${Date.now()}`,
      organization_id: session.organization_id,
      user_id: `user-${Date.now()}`,
      name: inviteName,
      email: inviteEmail,
      role: inviteRole,
      active: true,
      created_at: new Date().toISOString(),
    };

    setMembers([...members, newMember]);
    setInvitedSuccess(true);
    setTimeout(() => {
      setShowInviteModal(false);
      setInvitedSuccess(false);
      setInviteName('');
      setInviteEmail('');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Équipe de l&apos;agence
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Collaborateurs habilités pour <strong className="text-slate-800">{session.organization_name}</strong>
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="inline-flex items-center gap-2 py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Inviter un collaborateur</span>
        </button>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-brand-600" />
                Inviter un collaborateur
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Fermer
              </button>
            </div>

            {invitedSuccess ? (
              <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Invitation envoyée par email avec succès !</span>
              </div>
            ) : (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nom et prénom
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sami Trabelsi"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email professionnel
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sami@atlas-voyages.fr"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rôle accordé
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'AGENCY_ADMIN' | 'AGENCY_USER')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                  >
                    <option value="AGENCY_USER">AGENCY_USER (Collaborateur conseiller)</option>
                    <option value="AGENCY_ADMIN">AGENCY_ADMIN (Responsable d&apos;agence)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm"
                  >
                    Envoyer l&apos;invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Collaborateur</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Rôle</th>
              <th className="py-3 px-4">Statut</th>
              <th className="py-3 px-4">Date d&apos;ajout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((m) => (
              <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-xs">
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{m.name}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600">
                  {m.email}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    m.role === 'AGENCY_ADMIN'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    <Shield className="w-3 h-3" />
                    {m.role}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Actif
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-500">
                  {new Date(m.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
