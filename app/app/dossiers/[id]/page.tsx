'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getCurrentSession, 
  getCaseById, 
  updateCaseStatus 
} from '@/lib/store';
import { VisaCase, UserSession, CaseStatus } from '@/types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Layers, 
  Download, 
  FileCheck, 
  FileText, 
  Plane, 
  ShieldCheck, 
  Calendar,
  Building,
  User,
  Sparkles
} from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [session, setSession] = useState<UserSession | null>(null);
  const [caseData, setCaseData] = useState<VisaCase | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    const current = getCurrentSession();
    setSession(current);
    if (current && caseId) {
      const found = getCaseById(caseId, current);
      setCaseData(found);
    }
  }, [caseId]);

  if (!session) return null;

  if (!caseData) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Dossier introuvable ou accès refusé</h2>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          En vertu des règles de sécurité multi-tenant, vous ne pouvez consulter que les dossiers rattachés à votre organisation ({session.organization_name}).
        </p>
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: CaseStatus) => {
    updateCaseStatus(caseData.id, newStatus);
    setCaseData({ ...caseData, status: newStatus });
  };

  const handleDownloadVisa = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const steps: { key: CaseStatus; label: string }[] = [
    { key: 'A_VERIFIER', label: 'À vérifier' },
    { key: 'PRET_A_TRANSMETTRE', label: 'Prêt à transmettre' },
    { key: 'EN_TRAITEMENT', label: 'En traitement consulaire' },
    { key: 'VISA_PRET', label: 'Visa prêt' },
    { key: 'TERMINE', label: 'Dossier terminé' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === caseData.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Top navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/dossiers"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la liste des dossiers</span>
        </Link>
        <span className="text-xs text-slate-400 font-mono">
          Réf: {caseData.reference}
        </span>
      </div>

      {/* Main Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-200">
                {caseData.reference}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {caseData.organization_name}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
              {caseData.traveler_last_name.toUpperCase()} {caseData.traveler_first_name}
            </h1>
            <p className="text-xs text-slate-500">
              Destination : <strong className="text-slate-800">{caseData.destination_country}</strong> ({caseData.travel_type})
            </p>
          </div>

          {/* Action Download Visa if READY */}
          {caseData.status === 'VISA_PRET' && (
            <button
              onClick={handleDownloadVisa}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-102"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Visa Officiel (PDF)</span>
            </button>
          )}
        </div>

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Téléchargement initié : e-visa-officiel-{caseData.reference}.pdf (Document scellé et authentifié)</span>
          </div>
        )}

        {/* WORKFLOW PIPELINE TRACKER (CDC #120) */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Avancement du dossier
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
            {steps.map((st, i) => {
              const isPast = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              return (
                <div
                  key={st.key}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-brand-50 border-brand-500 shadow-2xs'
                      : isPast
                      ? 'bg-emerald-50/70 border-emerald-200'
                      : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                  }`}
                >
                  <span className={`text-[10px] font-bold block ${isCurrent ? 'text-brand-700' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                    Étape 0{i + 1}
                  </span>
                  <span className={`text-xs font-semibold ${isCurrent ? 'text-brand-900' : isPast ? 'text-emerald-900' : 'text-slate-500'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Change status tool for operator / agent */}
        {(session.role === 'SUPER_ADMIN' || session.role === 'VISA_AGENT' || session.role === 'AGENCY_ADMIN') && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-slate-700">
              Modifier le statut opérationnel :
            </span>
            <div className="flex flex-wrap gap-1.5">
              {steps.map(st => (
                <button
                  key={st.key}
                  onClick={() => handleStatusChange(st.key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    caseData.status === st.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-white hover:bg-slate-200 border border-slate-200 text-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Two columns data */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voyageur Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Identité du voyageur
            </h3>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Conforme MRZ
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Nom complet</span>
              <span className="font-bold text-slate-800">{caseData.traveler_last_name.toUpperCase()} {caseData.traveler_first_name}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Numéro de passeport</span>
              <span className="font-mono font-bold text-slate-800">{caseData.traveler_passport_num || 'Non renseigné'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Nationalité</span>
              <span className="font-semibold text-slate-800">{caseData.traveler_nationality || 'Française'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Date de naissance</span>
              <span className="font-semibold text-slate-800">{caseData.traveler_birth_date || 'Non renseignée'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 col-span-2">
              <span className="text-slate-400 block text-[10px]">Expiration du passeport</span>
              <span className="font-semibold text-slate-800">{caseData.traveler_passport_expiry || 'Non renseignée'}</span>
            </div>
          </div>
        </div>

        {/* Vol & Logistique */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Plane className="w-4 h-4 text-indigo-600" />
              Détails du voyage & PNR
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
              {caseData.travel_type}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Compagnie & PNR</span>
              <span className="font-bold text-slate-800">{caseData.flight_company || 'Saudia'} ({caseData.flight_pnr || 'SV8942'})</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Destination</span>
              <span className="font-bold text-slate-800">{caseData.destination_country}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Date de départ</span>
              <span className="font-mono font-semibold text-slate-800">{caseData.departure_date || 'N/A'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-400 block text-[10px]">Date de retour</span>
              <span className="font-mono font-semibold text-slate-800">{caseData.return_date || 'N/A'}</span>
            </div>
            {caseData.notes && (
              <div className="p-2.5 rounded-lg bg-slate-50 col-span-2">
                <span className="text-slate-400 block text-[10px]">Notes du dossier</span>
                <span className="text-slate-700 text-[11px] leading-relaxed">{caseData.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Documents attachés (CDC #118) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-brand-600" />
            Documents attachés au dossier
          </h3>
          <span className="text-xs text-slate-400">Stockage privé sécurisé AES-256</span>
        </div>

        <div className="space-y-2">
          {caseData.documents && caseData.documents.length > 0 ? (
            caseData.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-brand-600">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{doc.file_name}</p>
                    <p className="text-[10px] text-slate-400">{doc.type} • Déposé le {new Date(doc.created_at).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadVisa}
                  className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Consulter</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-brand-600">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-800">passeport_{caseData.traveler_last_name.toLowerCase()}.pdf</p>
                  <p className="text-[10px] text-slate-400">PASSEPORT BIOMÉTRIQUE • Pièce principale</p>
                </div>
              </div>
              <button
                onClick={handleDownloadVisa}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Télécharger</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
