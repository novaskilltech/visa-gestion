'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  getCurrentSession, 
  getCaseById, 
  updateCaseStatus,
  updateVisaCase,
  deleteVisaCase,
  addDocumentToCase,
  removeDocumentFromCase
} from '@/lib/store';
import { VisaCase, UserSession, CaseStatus, CaseDocument, DocumentType } from '@/types';
import { classifyDocumentType, parseFlightTicketText } from '@/lib/flight-parser';
import { parsePassportText } from '@/lib/mrz-parser';
import { processPdfFile } from '@/lib/pdf-reader';
import Tesseract from 'tesseract.js';
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
  Sparkles,
  Edit3,
  Trash2,
  Save,
  X,
  AlertTriangle,
  Plus,
  RefreshCw,
  Eye,
  UploadCloud
} from 'lucide-react';

export default function CaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [session, setSession] = useState<UserSession | null>(null);
  const [caseData, setCaseData] = useState<VisaCase | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    traveler_first_name: '',
    traveler_last_name: '',
    traveler_passport_num: '',
    traveler_nationality: '',
    traveler_birth_date: '',
    traveler_passport_expiry: '',
    destination_country: '',
    travel_type: 'OMRA_HAJJ' as VisaCase['travel_type'],
    departure_date: '',
    return_date: '',
    has_separate_tickets: false,
    flight_pnr: '',
    flight_company: '',
    return_flight_pnr: '',
    return_flight_company: '',
    notes: '',
  });

  // Delete modal state (Double Confirmation)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1);
  const [isDeleting, setIsDeleting] = useState(false);

  // Attachment & OCR state
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [uploadDocStep, setUploadDocStep] = useState('');
  const [docFeedbackMsg, setDocFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

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

  const startEditing = () => {
    setEditForm({
      traveler_first_name: caseData.traveler_first_name || '',
      traveler_last_name: caseData.traveler_last_name || '',
      traveler_passport_num: caseData.traveler_passport_num || '',
      traveler_nationality: caseData.traveler_nationality || 'Française',
      traveler_birth_date: caseData.traveler_birth_date || '',
      traveler_passport_expiry: caseData.traveler_passport_expiry || '',
      destination_country: caseData.destination_country || 'Arabie Saoudite',
      travel_type: caseData.travel_type || 'OMRA_HAJJ',
      departure_date: caseData.departure_date || '',
      return_date: caseData.return_date || '',
      has_separate_tickets: !!caseData.has_separate_tickets,
      flight_pnr: caseData.flight_pnr || '',
      flight_company: caseData.flight_company || '',
      return_flight_pnr: caseData.return_flight_pnr || '',
      return_flight_company: caseData.return_flight_company || '',
      notes: caseData.notes || '',
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.traveler_first_name || !editForm.traveler_last_name) {
      alert('Le nom et le prénom sont obligatoires.');
      return;
    }
    const updated = updateVisaCase(caseData.id, editForm, session);
    if (updated) {
      setCaseData(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    }
  };

  const handleDeleteConfirm = () => {
    setIsDeleting(true);
    const res = deleteVisaCase(caseData.id, session);
    if (res.success) {
      router.push('/app/dossiers');
    } else {
      alert(res.error || 'Erreur lors de la suppression.');
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteStep(1);
    }
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    updateCaseStatus(caseData.id, newStatus);
    setCaseData({ ...caseData, status: newStatus });
  };

  const handleDownloadVisa = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  const handleAttachDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !caseData || !session) return;
    const file = e.target.files[0];
    setIsUploadingDoc(true);
    setUploadDocStep('Chargement et lecture du document...');
    setDocFeedbackMsg(null);

    try {
      let rawText = '';
      let previewUrl = '';

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setUploadDocStep('Rendu du PDF et analyse des calques...');
        const pdfRes = await processPdfFile(file);
        previewUrl = pdfRes.previewUrl || '';
        if (pdfRes.text && pdfRes.text.length > 30) {
          rawText = pdfRes.text;
        } else if (pdfRes.canvas) {
          setUploadDocStep('Lecture optique OCR du PDF scanné...');
          const ocrRes = await Tesseract.recognize(pdfRes.canvas, 'fra+eng');
          rawText = ocrRes.data.text || '';
        }
      } else {
        setUploadDocStep('Lecture de l\'image et OCR...');
        const reader = new FileReader();
        previewUrl = await new Promise((res) => {
          reader.onload = () => res(reader.result as string);
          reader.onerror = () => res('');
          reader.readAsDataURL(file);
        });
        const ocrRes = await Tesseract.recognize(file, 'fra+eng');
        rawText = ocrRes.data.text || '';
      }

      // Classifier le document
      const detectedType = classifyDocumentType(rawText);

      // Si le document apporte des données de vol ou d'identité non renseignées, les injecter
      const updates: Partial<Omit<VisaCase, 'id' | 'reference' | 'created_at'>> = {};
      if (detectedType === 'BILLET_AVION') {
        const flightData = parseFlightTicketText(rawText);
        if (!caseData.flight_pnr && flightData.pnr) {
          updates.flight_pnr = flightData.pnr;
        } else if (caseData.flight_pnr && flightData.pnr && flightData.pnr !== caseData.flight_pnr) {
          // Billet retour séparé !
          updates.has_separate_tickets = true;
          updates.return_flight_pnr = flightData.pnr;
          if (flightData.airline) updates.return_flight_company = flightData.airline;
        }
        if (!caseData.flight_company && flightData.airline) updates.flight_company = flightData.airline;
        if (!caseData.departure_date && flightData.departureDate) updates.departure_date = flightData.departureDate;
        if (!caseData.return_date && flightData.returnDate) updates.return_date = flightData.returnDate;
      } else if (detectedType === 'PASSEPORT') {
        const passData = parsePassportText(rawText);
        if (!caseData.traveler_passport_num && passData.passportNumber) updates.traveler_passport_num = passData.passportNumber;
        if (!caseData.traveler_birth_date && passData.birthDate) updates.traveler_birth_date = passData.birthDate;
        if (!caseData.traveler_passport_expiry && passData.expiryDate) updates.traveler_passport_expiry = passData.expiryDate;
      }

      if (Object.keys(updates).length > 0) {
        updateVisaCase(caseData.id, updates, session);
      }

      // Attacher le document au dossier
      const updated = addDocumentToCase(
        caseData.id,
        {
          type: detectedType,
          file_name: file.name,
          file_size: file.size,
          file_url: previewUrl || '#',
        },
        session
      );

      if (updated) {
        setCaseData(updated);
        setDocFeedbackMsg({
          text: `Document "${file.name}" attaché avec succès au dossier.`,
          type: 'success',
        });
        setTimeout(() => setDocFeedbackMsg(null), 4000);
      }
    } catch (err) {
      console.error('Erreur attachement document:', err);
      setDocFeedbackMsg({
        text: 'Erreur lors de l\'analyse automatique du document.',
        type: 'error',
      });
    } finally {
      setIsUploadingDoc(false);
      setUploadDocStep('');
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  const handleRemoveDoc = (docId: string) => {
    if (!caseData || !session) return;
    if (confirm('Voulez-vous retirer cette pièce jointe du dossier ?')) {
      const updated = removeDocumentFromCase(caseData.id, docId, session);
      if (updated) {
        setCaseData(updated);
        setDocFeedbackMsg({
          text: 'Pièce jointe retirée du dossier.',
          type: 'success',
        });
        setTimeout(() => setDocFeedbackMsg(null), 3000);
      }
    }
  };

  const handleViewDoc = (doc: CaseDocument) => {
    if (doc.file_url && (doc.file_url.startsWith('data:') || doc.file_url.startsWith('blob:') || doc.file_url.startsWith('http'))) {
      const win = window.open();
      if (win) {
        if (doc.file_url.startsWith('data:image')) {
          win.document.write(`<title>${doc.file_name}</title><body style="margin:0;background:#070e1a;display:flex;align-items:center;justify-content:center;height:100vh;"><img src="${doc.file_url}" style="max-width:95vw;max-height:95vh;border-radius:12px;box-shadow:0 15px 35px rgba(0,0,0,0.6);border:1px solid rgba(0,210,255,0.3);"/></body>`);
        } else {
          win.location.href = doc.file_url;
        }
        return;
      }
    }
    // Fallback simulation
    handleDownloadVisa();
  };

  const handleDownloadDoc = (doc: CaseDocument) => {
    if (doc.file_url && (doc.file_url.startsWith('data:') || doc.file_url.startsWith('blob:') || doc.file_url.startsWith('http'))) {
      const a = document.createElement('a');
      a.href = doc.file_url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDocFeedbackMsg({
        text: `Téléchargement lancé : "${doc.file_name}"`,
        type: 'success',
      });
      setTimeout(() => setDocFeedbackMsg(null), 3000);
      return;
    }

    // Fichier placeholder ou document simulé
    const blob = new Blob(
      [`Document certifié Visa Gestion\nNom: ${doc.file_name}\nType: ${doc.type}\nDossier: ${caseData?.reference}\nOrganisme: ${caseData?.organization_name}\nDate: ${new Date().toISOString()}`],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.file_name.endsWith('.pdf') || doc.file_name.endsWith('.png') || doc.file_name.endsWith('.jpg') || doc.file_name.endsWith('.jpeg')
      ? doc.file_name
      : `${doc.file_name}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    setDocFeedbackMsg({
      text: `Téléchargement lancé : "${doc.file_name}"`,
      type: 'success',
    });
    setTimeout(() => setDocFeedbackMsg(null), 3000);
  };

  const handleDownloadAllDocs = () => {
    if (!caseData?.documents || caseData.documents.length === 0) return;
    caseData.documents.forEach((doc, idx) => {
      setTimeout(() => {
        handleDownloadDoc(doc);
      }, idx * 350);
    });

    setDocFeedbackMsg({
      text: `Téléchargement groupé lancé pour les ${caseData.documents.length} documents.`,
      type: 'success',
    });
    setTimeout(() => setDocFeedbackMsg(null), 4000);
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

          {/* Action Buttons: Modifier, Supprimer, Télécharger */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!isEditing && (
              <>
                <button
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-300 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                  title="Modifier les données du dossier"
                >
                  <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Modifier</span>
                </button>

                <button
                  onClick={() => {
                    setDeleteStep(1);
                    setIsDeleteDialogOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-colors shadow-2xs"
                  title="Supprimer définitivement ce dossier"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Supprimer</span>
                </button>
              </>
            )}

            {caseData.status === 'VISA_PRET' && (
              <button
                onClick={handleDownloadVisa}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all hover:scale-102"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le Visa (PDF)</span>
              </button>
            )}
          </div>
        </div>

        {/* Notifications Feedback */}
        {saveSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Les modifications du dossier {caseData.reference} ont été enregistrées avec succès.</span>
          </div>
        )}

        {downloadSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Téléchargement initié : e-visa-officiel-{caseData.reference}.pdf (Document scellé et authentifié)</span>
          </div>
        )}

        {/* WORKFLOW PIPELINE TRACKER */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Progression consulaire</span>
            <span>Statut : <strong className="text-slate-800">{steps.find(s => s.key === caseData.status)?.label}</strong></span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
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

      {/* EDIT MODE FORM vs READ-ONLY VIEW */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-brand-500 shadow-md space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-brand-600" />
                <span>Modification du dossier {caseData.reference}</span>
              </h2>
              <p className="text-xs text-slate-500">Mettez à jour les informations du voyageur ou les détails logistiques des vols.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Annuler</span>
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>

          {/* Identité du voyageur */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">1. Identité du voyageur</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nom de famille *</label>
                <input
                  type="text"
                  required
                  value={editForm.traveler_last_name}
                  onChange={(e) => setEditForm({ ...editForm, traveler_last_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-bold uppercase focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Prénom(s) *</label>
                <input
                  type="text"
                  required
                  value={editForm.traveler_first_name}
                  onChange={(e) => setEditForm({ ...editForm, traveler_first_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de passeport</label>
                <input
                  type="text"
                  value={editForm.traveler_passport_num}
                  onChange={(e) => setEditForm({ ...editForm, traveler_passport_num: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nationalité</label>
                <input
                  type="text"
                  value={editForm.traveler_nationality}
                  onChange={(e) => setEditForm({ ...editForm, traveler_nationality: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date de naissance</label>
                <input
                  type="date"
                  value={editForm.traveler_birth_date}
                  onChange={(e) => setEditForm({ ...editForm, traveler_birth_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration du passeport</label>
                <input
                  type="date"
                  value={editForm.traveler_passport_expiry}
                  onChange={(e) => setEditForm({ ...editForm, traveler_passport_expiry: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Voyage & Destination */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">2. Destination & Dates de voyage</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Destination *</label>
                <input
                  type="text"
                  required
                  value={editForm.destination_country}
                  onChange={(e) => setEditForm({ ...editForm, destination_country: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Type de voyage</label>
                <select
                  value={editForm.travel_type}
                  onChange={(e) => setEditForm({ ...editForm, travel_type: e.target.value as VisaCase['travel_type'] })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                >
                  <option value="OMRA_HAJJ">Omra & Hajj</option>
                  <option value="TOURISM">Tourisme</option>
                  <option value="BUSINESS">Affaires</option>
                  <option value="FAMILY">Famille</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date de départ</label>
                <input
                  type="date"
                  value={editForm.departure_date}
                  onChange={(e) => setEditForm({ ...editForm, departure_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date de retour</label>
                <input
                  type="date"
                  value={editForm.return_date}
                  onChange={(e) => setEditForm({ ...editForm, return_date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Vols & Billets Séparés */}
          <div className="space-y-4 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">3. Vols & Billets d&apos;avion</h3>
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                <input
                  type="checkbox"
                  checked={editForm.has_separate_tickets}
                  onChange={(e) => setEditForm({ ...editForm, has_separate_tickets: e.target.checked })}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span className="text-xs font-semibold text-slate-700">Billets séparés (2 PNR / 2 Compagnies)</span>
              </label>
            </div>

            {!editForm.has_separate_tickets ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de réservation PNR</label>
                  <input
                    type="text"
                    placeholder="Ex: SV142"
                    value={editForm.flight_pnr}
                    onChange={(e) => setEditForm({ ...editForm, flight_pnr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Compagnie aérienne</label>
                  <input
                    type="text"
                    placeholder="Saudia, Royal Air Maroc, Air France..."
                    value={editForm.flight_company}
                    onChange={(e) => setEditForm({ ...editForm, flight_company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <span className="text-[11px] font-bold text-blue-900 block uppercase">Vol Aller (Billet 1)</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">PNR Aller</label>
                    <input
                      type="text"
                      placeholder="Ex: SV142"
                      value={editForm.flight_pnr}
                      onChange={(e) => setEditForm({ ...editForm, flight_pnr: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Compagnie Aller</label>
                    <input
                      type="text"
                      placeholder="Saudia..."
                      value={editForm.flight_company}
                      onChange={(e) => setEditForm({ ...editForm, flight_company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                  <span className="text-[11px] font-bold text-purple-900 block uppercase">Vol Retour (Billet 2)</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">PNR Retour</label>
                    <input
                      type="text"
                      placeholder="Ex: MS892"
                      value={editForm.return_flight_pnr}
                      onChange={(e) => setEditForm({ ...editForm, return_flight_pnr: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Compagnie Retour</label>
                    <input
                      type="text"
                      placeholder="EgyptAir, Transavia..."
                      value={editForm.return_flight_company}
                      onChange={(e) => setEditForm({ ...editForm, return_flight_company: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes du dossier */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes internes & consignes consulaires</label>
            <textarea
              rows={3}
              value={editForm.notes}
              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
              placeholder="Précisions utiles pour le prestataire consulaire..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
            />
          </div>

          {/* Bottom Save bar */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-600/30 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      ) : (
        /* READ ONLY VIEW */
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
                Données d&apos;identité
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
              <div className="flex items-center gap-1.5">
                {(caseData.has_separate_tickets || (caseData.return_flight_pnr && caseData.return_flight_pnr.trim())) && (
                  <span className="text-[10px] bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200">
                    2 Billets séparés
                  </span>
                )}
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                  {caseData.travel_type}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              {caseData.has_separate_tickets || (caseData.return_flight_pnr && caseData.return_flight_pnr.trim()) ? (
                <>
                  <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200">
                    <span className="text-blue-700 block text-[10px] font-bold uppercase tracking-wide">Vol Aller (Billet 1)</span>
                    <span className="font-bold text-slate-800 block">{caseData.flight_company || 'Non renseignée'}</span>
                    <span className="font-mono text-[11px] text-blue-900 font-semibold">PNR: {caseData.flight_pnr || 'N/A'}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-purple-50/70 border border-purple-200">
                    <span className="text-purple-700 block text-[10px] font-bold uppercase tracking-wide">Vol Retour (Billet 2)</span>
                    <span className="font-bold text-slate-800 block">{caseData.return_flight_company || 'Non renseignée'}</span>
                    <span className="font-mono text-[11px] text-purple-900 font-semibold">PNR: {caseData.return_flight_pnr || 'N/A'}</span>
                  </div>
                </>
              ) : (
                <div className="p-2.5 rounded-lg bg-slate-50 col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px]">Compagnie & PNR</span>
                  <span className="font-bold text-slate-800">
                    {caseData.flight_company || (caseData.flight_pnr ? 'Compagnie non spécifiée' : 'Non renseigné')}
                    {caseData.flight_pnr ? ` (${caseData.flight_pnr})` : ''}
                  </span>
                </div>
              )}
              <div className="p-2.5 rounded-lg bg-slate-50 col-span-2 sm:col-span-1">
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
      )}

      {/* Documents attachés (CDC #118 & Gestion cumulative) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Hidden File Input for adding attachments */}
        <input
          type="file"
          ref={docInputRef}
          accept="application/pdf,image/png,image/jpeg,image/webp"
          onChange={handleAttachDocument}
          className="hidden"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600" />
              <span>Documents attachés au dossier ({caseData.documents?.length || 0})</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Passeports biométriques, e-tickets de vol (Aller & Retour) et pièces justificatives
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {caseData.documents && caseData.documents.length > 0 && (
              <button
                type="button"
                onClick={handleDownloadAllDocs}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-sky-300 border border-sky-500/30 transition-colors shadow-2xs"
                title="Télécharger l'intégralité des documents du dossier en un clic"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tout télécharger ({caseData.documents.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => docInputRef.current?.click()}
              disabled={isUploadingDoc}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 border border-brand-200 text-xs font-bold text-brand-700 transition-colors shadow-2xs disabled:opacity-50"
            >
              {isUploadingDoc ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand-600" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-brand-600" />
              )}
              <span>Ajouter une pièce jointe (PDF/Image)</span>
            </button>
          </div>
        </div>

        {/* Upload in progress banner */}
        {isUploadingDoc && (
          <div className="p-3.5 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-3 text-xs text-brand-900 animate-in fade-in">
            <RefreshCw className="w-4 h-4 animate-spin text-brand-600 shrink-0" />
            <div>
              <p className="font-bold">{uploadDocStep}</p>
              <p className="text-[11px] text-brand-700">L&apos;IA lit le document et met à jour automatiquement les données associées.</p>
            </div>
          </div>
        )}

        {/* Feedback message banner */}
        {docFeedbackMsg && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in ${
            docFeedbackMsg.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            {docFeedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{docFeedbackMsg.text}</span>
          </div>
        )}

        <div className="space-y-2">
          {caseData.documents && caseData.documents.length > 0 ? (
            caseData.documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold border shrink-0 ${
                    doc.type === 'BILLET_AVION'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : doc.type === 'PASSEPORT'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}>
                    {doc.type === 'BILLET_AVION' ? (
                      <Plane className="w-4 h-4" />
                    ) : doc.type === 'PASSEPORT' ? (
                      <ShieldCheck className="w-4 h-4" />
                    ) : (
                      <FileCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{doc.file_name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-600">
                        {doc.type === 'PASSEPORT' ? 'Passeport biométrique' : doc.type === 'BILLET_AVION' ? 'Billet d\'avion / E-ticket' : 'Autre document'}
                      </span>
                      {doc.file_size ? (
                        <span>• {(doc.file_size / 1024).toFixed(1)} KB</span>
                      ) : null}
                      <span>• Déposé le {new Date(doc.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
                  <button
                    type="button"
                    onClick={() => handleViewDoc(doc)}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs transition-colors"
                    title="Consulter l'aperçu du document"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>Consulter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(doc)}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-300 font-bold text-sky-800 flex items-center gap-1.5 shadow-2xs transition-all hover:scale-102"
                    title="Télécharger directement ce document"
                  >
                    <Download className="w-3.5 h-3.5 text-sky-600" />
                    <span>Télécharger</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveDoc(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Retirer cette pièce jointe"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Aucun document attaché pour le moment</p>
                <p className="text-[11px] text-slate-500">Ajoutez le passeport ou les billets d&apos;avion pour que le prestataire y accède.</p>
              </div>
              <button
                type="button"
                onClick={() => docInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter un document</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DOUBLE CONFIRMATION MODAL POUR LA SUPPRESSION (RÈGLE STRICTE NOVA SQUAD) */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {deleteStep === 1 ? 'Supprimer ce dossier ?' : 'Confirmation irréversible (Étape 2/2)'}
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-600">
                  Action définitive
                </span>
              </div>
            </div>

            {deleteStep === 1 ? (
              <div className="space-y-3 text-xs text-slate-600">
                <p>
                  Vous avez demandé la suppression du dossier <strong className="text-slate-900 font-mono">{caseData.reference}</strong> pour le voyageur <strong>{caseData.traveler_last_name.toUpperCase()} {caseData.traveler_first_name}</strong>.
                </p>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                  Cette action retirera le dossier de votre tableau de bord et de l&apos;espace de traitement du prestataire.
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-600">
                <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 font-medium">
                  ⚠️ <strong>Double confirmation obligatoire :</strong> Êtes-vous absolument sûr de vouloir détruire ce dossier ? Cette opération ne peut pas être annulée.
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteStep(1);
                }}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Annuler
              </button>

              {deleteStep === 1 ? (
                <button
                  type="button"
                  onClick={() => setDeleteStep(2)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
                >
                  Continuer vers la confirmation
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-md shadow-rose-700/30 flex items-center gap-1.5 transition-all"
                >
                  {isDeleting ? (
                    <span>Suppression...</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Oui, supprimer définitivement</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
