'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentSession, getCasesForSession } from '@/lib/store';
import { VisaCase, UserSession } from '@/types';
import { 
  FileCheck, 
  Download, 
  Search, 
  CheckCircle2, 
  Building, 
  ArrowRight,
  Plane
} from 'lucide-react';

export default function VisasPage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [cases, setCases] = useState<VisaCase[]>([]);
  const [search, setSearch] = useState('');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current) {
      const all = getCasesForSession(current);
      setCases(all.filter(c => c.status === 'VISA_PRET'));
    }
  }, []);

  if (!session) return null;

  const filtered = cases.filter(c =>
    c.traveler_first_name.toLowerCase().includes(search.toLowerCase()) ||
    c.traveler_last_name.toLowerCase().includes(search.toLowerCase()) ||
    c.reference.toLowerCase().includes(search.toLowerCase()) ||
    c.destination_country.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = (ref: string) => {
    setDownloadSuccess(ref);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Espace Livraisons Officielles
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Visas prêts au téléchargement
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Téléchargez les e-visas de vos voyageurs pour <strong className="text-slate-800">{session.organization_name}</strong>
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher voyageur..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
          />
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Visa officiel {downloadSuccess} téléchargé au format PDF certifié !</span>
        </div>
      )}

      {/* Cards list */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <FileCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-700">Aucun visa prêt pour le moment</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Dès que le consulat délivre un visa, il apparaîtra immédiatement ici avec son bouton de téléchargement sécurisé.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((c) => (
            <div
              key={c.id}
              className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-4 hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                    {c.reference}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {c.traveler_last_name.toUpperCase()} {c.traveler_first_name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Plane className="w-3.5 h-3.5 text-slate-400" />
                    <span>Destination : <strong>{c.destination_country}</strong> ({c.travel_type})</span>
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  Délivré
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Numéro Passeport :</span>
                  <span className="font-mono font-bold text-slate-800">{c.traveler_passport_num || '24AB12345'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Date de départ :</span>
                  <span className="font-mono text-slate-800">{c.departure_date || '15/11/2026'}</span>
                </div>
                {c.flight_pnr && (
                  <div className="flex justify-between text-slate-600">
                    <span>Vol PNR :</span>
                    <span className="font-mono text-slate-800">{c.flight_pnr} ({c.flight_company})</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <Link
                  href={`/app/dossiers/${c.id}`}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <span>Voir le dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => handleDownload(c.reference)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Télécharger Visa PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
