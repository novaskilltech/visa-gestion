'use client';

import { useState, useEffect } from 'react';
import { getCurrentSession } from '@/lib/store';
import { UserSession } from '@/types';
import { Building, Mail, Phone, MapPin, CheckCircle2, ShieldCheck, Bell } from 'lucide-react';

export default function SettingsPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [agencyName, setAgencyName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [phone, setPhone] = useState('+33 1 42 68 55 00');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('14 Rue de la Paix, 75002 Paris');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      setAgencyName(current.organization_name);
      setLegalName(`${current.organization_name} SAS`);
      setEmail(current.email);
    }
  }, []);

  if (!session) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
          Paramètres de l&apos;organisation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Coordonnées de l&apos;agence, mentions légales et préférences de communication.
        </p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Paramètres de l&apos;agence mis à jour avec succès !</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Identité de l&apos;agence (CDC #133)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nom commercial
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Raison sociale légale
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Téléphone agence
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email de contact
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Adresse postale du siège / point de vente
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Préférences de notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600" />
              <span>Recevoir un email dès qu&apos;un visa officiel est délivré et prêt au téléchargement</span>
            </label>
            <label className="flex items-center gap-3 text-xs text-slate-700 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600" />
              <span>Notification immédiate en cas de document manquant ou illisible</span>
            </label>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30"
          >
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
