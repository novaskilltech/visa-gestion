'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, createVisaCase } from '@/lib/store';
import { VisaCase, CaseDocument, DocumentType } from '@/types';
import { parsePassportText } from '@/lib/mrz-parser';
import { parseFlightTicketText, classifyDocumentType } from '@/lib/flight-parser';
import { processPdfFile } from '@/lib/pdf-reader';
import Tesseract from 'tesseract.js';
import { 
  Sparkles, 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send,
  Plane,
  ShieldCheck,
  Bot,
  Image as ImageIcon,
  Scan,
  RefreshCw,
  FileCheck,
  Plus,
  Trash2,
  Eye,
  Info
} from 'lucide-react';

interface CumulativeDoc {
  id: string;
  file: File;
  name: string;
  size: number;
  previewUrl: string | null;
  detectedType: DocumentType;
  status: 'SCANNING' | 'DONE' | 'ERROR';
  progress: number;
  stepText: string;
  summary: string[];
  errorMessage?: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const session = getCurrentSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Travel state
  const [destination, setDestination] = useState('Arabie Saoudite');
  const [travelType, setTravelType] = useState<VisaCase['travel_type']>('OMRA_HAJJ');
  const [departureDate, setDepartureDate] = useState('2026-11-20');
  const [returnDate, setReturnDate] = useState('2026-12-05');

  // Traveler state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [passportNum, setPassportNum] = useState('');
  const [nationality, setNationality] = useState('Française');
  const [birthDate, setBirthDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  // Flight info - Aller (Billet 1)
  const [pnr, setPnr] = useState('');
  const [company, setCompany] = useState('');

  // Billets séparés - Retour (Billet 2)
  const [hasSeparateTickets, setHasSeparateTickets] = useState(false);
  const [returnPnr, setReturnPnr] = useState('');
  const [returnCompany, setReturnCompany] = useState('');

  // Cumulative documents state
  const [documents, setDocuments] = useState<CumulativeDoc[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [globalScanSummary, setGlobalScanSummary] = useState<string[]>([]);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // File size formatter
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Convert File to Base64 or ObjectURL for persistent in-session preview/download
  const readFileAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Sequential queue processor for multiple cumulative documents
  const processFilesBatch = async (files: File[]) => {
    if (files.length === 0) return;
    setIsProcessingQueue(true);
    setWarningMsg(null);

    // Initialiser les entrées dans l'état cumulatif
    const newDocEntries: CumulativeDoc[] = files.map((file) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file,
      name: file.name,
      size: file.size,
      previewUrl: null,
      detectedType: 'AUTRE',
      status: 'SCANNING',
      progress: 5,
      stepText: 'En attente d\'analyse...',
      summary: [],
    }));

    setDocuments((prev) => [...prev, ...newDocEntries]);

    // Traitement séquentiel de chaque fichier pour fluidité et robustesse OCR
    for (const docEntry of newDocEntries) {
      const file = docEntry.file;

      const updateDocState = (patch: Partial<CumulativeDoc>) => {
        setDocuments((prev) =>
          prev.map((d) => (d.id === docEntry.id ? { ...d, ...patch } : d))
        );
      };

      updateDocState({ stepText: 'Lecture du fichier...', progress: 15 });

      try {
        let rawText = '';
        let previewDataUrl: string | null = null;

        // 1. EXTRACTION DU TEXTE & GÉNÉRATION DE L'APERÇU
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          updateDocState({ stepText: 'Rendu du PDF et analyse des calques...', progress: 30 });
          const pdfResult = await processPdfFile(file);
          previewDataUrl = pdfResult.fileDataUrl || pdfResult.previewUrl;

          if (pdfResult.text && pdfResult.text.length > 30) {
            rawText = pdfResult.text;
            updateDocState({ progress: 70 });
          } else if (pdfResult.canvas) {
            updateDocState({ stepText: 'Lecture optique OCR du PDF scanné...', progress: 45 });
            const ocrResult = await Tesseract.recognize(pdfResult.canvas, 'fra+eng', {
              logger: (m) => {
                if (m.status === 'recognizing text' && m.progress) {
                  updateDocState({ progress: Math.round(45 + m.progress * 45) });
                }
              },
            });
            rawText = ocrResult.data.text || '';
          }
        } else {
          // Image JPG, PNG, WEBP
          updateDocState({ stepText: 'Lecture de l\'image et OCR...', progress: 30 });
          previewDataUrl = await readFileAsDataUrl(file);

          const ocrResult = await Tesseract.recognize(file, 'fra+eng', {
            logger: (m) => {
              if (m.status === 'recognizing text' && m.progress) {
                updateDocState({ progress: Math.round(30 + m.progress * 60) });
              }
            },
          });
          rawText = ocrResult.data.text || '';
        }

        updateDocState({ stepText: 'Identification du document et extraction...', progress: 92 });

        // 2. CLASSIFICATION & PARSING STRICT (ZÉRO DONNÉE FICTIVE)
        const docType = classifyDocumentType(rawText);
        const itemSummary: string[] = [];

        // CAS A : PASSEPORT DÉTECTÉ OU PRÉSENCE DE MOTIFS PASSEPORT
        if (docType === 'PASSEPORT' || /P<[A-Z]{3}|PASSPORT|PASSEPORT/i.test(rawText)) {
          const parsedPassport = parsePassportText(rawText);
          const detectedAs = 'PASSEPORT' as DocumentType;

          if (parsedPassport.lastName) {
            setLastName((prev) => prev || parsedPassport.lastName);
            itemSummary.push(`Nom : ${parsedPassport.lastName}`);
          }
          if (parsedPassport.firstName) {
            setFirstName((prev) => prev || parsedPassport.firstName);
            itemSummary.push(`Prénom : ${parsedPassport.firstName}`);
          }
          if (parsedPassport.passportNumber) {
            setPassportNum((prev) => prev || parsedPassport.passportNumber);
            itemSummary.push(`N° Passeport : ${parsedPassport.passportNumber}`);
          }
          if (parsedPassport.nationality) {
            setNationality((prev) => prev || parsedPassport.nationality);
            itemSummary.push(`Nationalité : ${parsedPassport.nationality}`);
          }
          if (parsedPassport.birthDate) {
            setBirthDate((prev) => prev || parsedPassport.birthDate);
            itemSummary.push(`Naissance : ${parsedPassport.birthDate}`);
          }
          if (parsedPassport.expiryDate) {
            setExpiryDate((prev) => prev || parsedPassport.expiryDate);
            itemSummary.push(`Expiration : ${parsedPassport.expiryDate}`);
          }

          updateDocState({
            status: 'DONE',
            progress: 100,
            stepText: 'Passeport biométrique analysé',
            detectedType: detectedAs,
            previewUrl: previewDataUrl,
            summary: itemSummary.length > 0 ? itemSummary : ['Passeport identifié'],
          });
        } 
        // CAS B : BILLET D'AVION / CONFIRMATION DE VOL DÉTECTÉ OU PRÉSENCE DE VOL / DATES
        else if (docType === 'BILLET_AVION' || /PNR|BOOKING|E-TICKET|SAUDIA|FLYNAS|AIRLINES|VOL|FLIGHT|DEPART|ARRIV/i.test(rawText)) {
          const parsedFlight = parseFlightTicketText(rawText);
          const detectedAs = 'BILLET_AVION' as DocumentType;

          // Détection automatique Billet 1 (Aller) ou Billet 2 (Retour / Séparé)
          if (parsedFlight.pnr) {
            setPnr((currentPnr) => {
              if (!currentPnr) {
                return parsedFlight.pnr;
              } else if (currentPnr !== parsedFlight.pnr) {
                // Deuxième billet avec PNR différent détecté !
                setHasSeparateTickets(true);
                setReturnPnr(parsedFlight.pnr);
                if (parsedFlight.airline) setReturnCompany(parsedFlight.airline);
                return currentPnr;
              }
              return currentPnr;
            });
          }

          if (parsedFlight.airline) {
            setCompany((currentComp) => currentComp || parsedFlight.airline);
          }

          // Dates et destination
          if (parsedFlight.departureDate) {
            setDepartureDate(parsedFlight.departureDate);
          }
          if (parsedFlight.returnDate) {
            setReturnDate(parsedFlight.returnDate);
          }
          if (parsedFlight.destination) {
            setDestination(parsedFlight.destination);
          }

          if (parsedFlight.pnr) itemSummary.push(`PNR : ${parsedFlight.pnr}`);
          if (parsedFlight.airline) itemSummary.push(`Compagnie : ${parsedFlight.airline}`);
          if (parsedFlight.flightNumber) itemSummary.push(`Vol : ${parsedFlight.flightNumber}`);
          if (parsedFlight.departureDate) itemSummary.push(`Vol du : ${parsedFlight.departureDate}`);
          if (parsedFlight.returnDate) itemSummary.push(`Retour du : ${parsedFlight.returnDate}`);

          updateDocState({
            status: 'DONE',
            progress: 100,
            stepText: 'Billet d\'avion analysé avec succès',
            detectedType: detectedAs,
            previewUrl: previewDataUrl,
            summary: itemSummary.length > 0 ? itemSummary : ['Billet d\'avion identifié'],
          });
        } 
        // CAS C : AUTRE DOCUMENT (ex: justificatif, visa antérieur)
        else {
          // Tentative d'analyse secondaire
          const maybeFlight = parseFlightTicketText(rawText);
          const maybePassport = parsePassportText(rawText);

          if (maybePassport.passportNumber || maybePassport.lastName) {
            if (maybePassport.lastName) setLastName((prev) => prev || maybePassport.lastName);
            if (maybePassport.firstName) setFirstName((prev) => prev || maybePassport.firstName);
            if (maybePassport.passportNumber) setPassportNum((prev) => prev || maybePassport.passportNumber);
            updateDocState({
              status: 'DONE',
              progress: 100,
              stepText: 'Document d\'identité analysé',
              detectedType: 'PASSEPORT',
              previewUrl: previewDataUrl,
              summary: [`Données extraites : ${maybePassport.lastName || maybePassport.passportNumber}`],
            });
          } else if (maybeFlight.pnr || maybeFlight.airline || maybeFlight.departureDate) {
            if (maybeFlight.pnr) setPnr((prev) => prev || maybeFlight.pnr);
            if (maybeFlight.airline) setCompany((prev) => prev || maybeFlight.airline);
            if (maybeFlight.departureDate) setDepartureDate(maybeFlight.departureDate);
            if (maybeFlight.returnDate) setReturnDate(maybeFlight.returnDate);
            updateDocState({
              status: 'DONE',
              progress: 100,
              stepText: 'Document de transport analysé',
              detectedType: 'BILLET_AVION',
              previewUrl: previewDataUrl,
              summary: [`Vol extrait : ${maybeFlight.pnr || maybeFlight.airline || maybeFlight.departureDate}`],
            });
          } else {
            updateDocState({
              status: 'DONE',
              progress: 100,
              stepText: 'Document annexé au dossier',
              detectedType: 'AUTRE',
              previewUrl: previewDataUrl,
              summary: ['Pièce jointe enregistrée'],
            });
          }
        }

      } catch (err) {
        console.error('Erreur OCR sur fichier:', file.name, err);
        updateDocState({
          status: 'ERROR',
          progress: 100,
          stepText: 'Erreur lors de la lecture automatique',
          errorMessage: 'Document illisible par l\'OCR ou fichier corrompu.',
          summary: ['Lecture manuelle requise'],
        });
      }
    }

    setIsProcessingQueue(false);
  };

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      processFilesBatch(filesArray);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      processFilesBatch(filesArray);
    }
  };

  const removeDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !destination) {
      alert('Veuillez renseigner au moins le nom, le prénom et la destination.');
      return;
    }

    // Convertir les documents cumulés en pièces jointes permanentes pour le dossier
    const caseDocs: CaseDocument[] = documents.map((doc) => ({
      id: doc.id,
      case_id: '', // généré par le store
      organization_id: session.organization_id,
      type: doc.detectedType,
      file_name: doc.name,
      file_size: doc.size,
      file_url: doc.previewUrl || '#',
      created_at: new Date().toISOString(),
    }));

    const createdCase = createVisaCase(
      {
        traveler_first_name: firstName,
        traveler_last_name: lastName,
        traveler_passport_num: passportNum,
        traveler_nationality: nationality,
        traveler_birth_date: birthDate,
        traveler_passport_expiry: expiryDate,
        destination_country: destination,
        travel_type: travelType,
        departure_date: departureDate,
        return_date: returnDate,
        status: (lastName && passportNum) ? 'PRET_A_TRANSMETTRE' : 'A_VERIFIER',
        flight_pnr: pnr,
        flight_company: company,
        has_separate_tickets: hasSeparateTickets,
        return_flight_pnr: hasSeparateTickets ? returnPnr : '',
        return_flight_company: hasSeparateTickets ? returnCompany : '',
        organization_id: session.organization_id,
        organization_name: session.organization_name,
        created_by: session.user_id,
        documents: caseDocs,
      },
      session
    );

    router.push(`/app/dossiers/${createdCase.id}`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/app/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </Link>
        <span className="text-xs text-slate-500">
          Création de dossier pour <strong className="text-slate-800">{session.organization_name}</strong>
        </span>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Nouveau dossier visa voyageur
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cumulez et glissez tous vos documents (Passeport, Billets d&apos;avion Aller/Retour, E-tickets) : l&apos;IA extrait automatiquement l&apos;identité et les vols, et les joint au dossier.
          </p>
        </div>

        {/* MULTI-DOCUMENTS CUMULATIVE SCANNER & DROPZONE */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-brand-600" />
              Scanner IA Multi-Documents (Passeport + Billets d&apos;avion)
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 self-start sm:self-auto">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Reconnaissance OACI + PNR en temps réel
            </span>
          </div>

          {/* Hidden Multi-file Input */}
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={handleFilesSelect}
            className="hidden"
          />

          {/* Interactive Multi-Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer select-none relative overflow-hidden ${
              isDragging
                ? 'border-brand-600 bg-brand-100/70 scale-[1.01]'
                : 'border-brand-300 hover:border-brand-500 bg-white/80 hover:bg-white'
            }`}
          >
            {/* Pulsing scanning beam while processing */}
            {isProcessingQueue && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/20 to-transparent animate-pulse pointer-events-none h-full"></div>
            )}

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
                {isProcessingQueue ? (
                  <RefreshCw className="w-7 h-7 animate-spin text-brand-600" />
                ) : (
                  <UploadCloud className="w-7 h-7 text-brand-600" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {isProcessingQueue
                    ? 'Analyse IA des documents en cours...'
                    : 'Glissez-déposez plusieurs documents à la fois ou cumulez-les ici'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Passeports biométriques (PDF/Images) + Billets d&apos;avion (PDF E-ticket ou cartes d&apos;embarquement)
                </p>
              </div>

              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Sélectionner des documents (Multi-sélection)</span>
                </button>
              </div>
            </div>
          </div>

          {/* LISTE DES DOCUMENTS CUMULÉS & STATUT DE RECONNAISSANCE */}
          {documents.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-600" />
                  <span>Documents cumulés dans le dossier ({documents.length})</span>
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-brand-700 hover:underline font-bold inline-flex items-center gap-1 text-[11px]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter un autre document</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center gap-3">
                      {doc.previewUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={doc.previewUrl}
                          alt={doc.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-50"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
                          {doc.detectedType === 'BILLET_AVION' ? (
                            <Plane className="w-6 h-6 text-brand-600" />
                          ) : (
                            <FileText className="w-6 h-6 text-brand-600" />
                          )}
                        </div>
                      )}

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 truncate max-w-[220px] sm:max-w-xs">
                            {doc.name}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({formatFileSize(doc.size)})
                          </span>
                        </div>

                        {/* Status / Step badge */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {doc.status === 'SCANNING' && (
                            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin text-amber-600" />
                              {doc.stepText} ({doc.progress}%)
                            </span>
                          )}

                          {doc.status === 'DONE' && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                              doc.detectedType === 'PASSEPORT'
                                ? 'bg-emerald-100 text-emerald-800'
                                : doc.detectedType === 'BILLET_AVION'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {doc.detectedType === 'PASSEPORT' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                              {doc.detectedType === 'BILLET_AVION' && <Plane className="w-3 h-3 text-blue-600" />}
                              {doc.detectedType === 'PASSEPORT'
                                ? 'Passeport biométrique'
                                : doc.detectedType === 'BILLET_AVION'
                                ? 'Billet / Vol détecté'
                                : 'Document annexé'}
                            </span>
                          )}

                          {doc.status === 'ERROR' && (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              {doc.errorMessage || 'Erreur d\'analyse'}
                            </span>
                          )}
                        </div>

                        {/* Detected summary tags */}
                        {doc.summary.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {doc.summary.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => removeDocument(doc.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Retirer cette pièce jointe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FORMULAIRE PRÉ-REMPLI PAR L'IA */}
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Destination & Travel Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              1. Informations de voyage
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Pays de destination *
                </label>
                <select
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 bg-white text-slate-900 font-medium"
                >
                  <option value="Arabie Saoudite">Arabie Saoudite (Omra / Hajj / Tourisme)</option>
                  <option value="Ouzbékistan">Ouzbékistan</option>
                  <option value="Chine">Chine</option>
                  <option value="Inde">Inde</option>
                  <option value="Égypte">Égypte</option>
                  <option value="Turquie">Turquie</option>
                  <option value="Autre destination">Autre destination</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Type de séjour *
                </label>
                <select
                  value={travelType}
                  onChange={(e) => setTravelType(e.target.value as VisaCase['travel_type'])}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 bg-white text-slate-900 font-medium"
                >
                  <option value="OMRA_HAJJ">Hajj / Omra</option>
                  <option value="TOURISM">Tourisme individuel</option>
                  <option value="BUSINESS">Affaires / Professionnel</option>
                  <option value="FAMILY">Visite familiale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de départ prévue
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de retour prévue
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Traveler Info */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">
                2. Données d&apos;identité du voyageur (Extrait du Passeport)
              </h3>
              <span className="text-[11px] text-slate-500">
                Informations certifiées conformes OACI 9303
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de famille (sur le passeport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nom extrait du document"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-bold text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prénom(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Prénom extrait du document"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Numéro de passeport
                </label>
                <input
                  type="text"
                  placeholder="N° de passeport"
                  value={passportNum}
                  onChange={(e) => setPassportNum(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-mono font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nationalité
                </label>
                <input
                  type="text"
                  placeholder="Française"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Date d&apos;expiration du passeport
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Flight Details & Separate Tickets Support */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plane className="w-4 h-4 text-brand-600" />
                <span>3. Détails des vols & Billets d&apos;avion (Extrait des e-tickets)</span>
              </h3>
              
              {/* Option billets séparés switch */}
              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors">
                <input
                  type="checkbox"
                  checked={hasSeparateTickets}
                  onChange={(e) => setHasSeparateTickets(e.target.checked)}
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 w-3.5 h-3.5"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Billets séparés (2 PNR / 2 Compagnies)
                </span>
              </label>
            </div>

            {!hasSeparateTickets ? (
              // Billet unique / Aller-Retour groupé
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Numéro de réservation PNR
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: SV142"
                      value={pnr}
                      onChange={(e) => setPnr(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Compagnie aérienne
                    </label>
                    <input
                      type="text"
                      placeholder="Saudia, Royal Air Maroc, Turkish Airlines..."
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 italic">
                  💡 Si le voyageur a réservé son aller et son retour sur 2 billets séparés (2 compagnies ou 2 PNR distincts), cochez la case &laquo; Billets séparés &raquo; ci-dessus ou déposez le deuxième billet d&apos;avion pour détection automatique.
                </p>
              </div>
            ) : (
              // Billets séparés : Billet 1 Aller + Billet 2 Retour
              <div className="space-y-4">
                {/* Bloc 1: Vol Aller */}
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Plane className="w-3.5 h-3.5 text-blue-600" />
                      Billet 1 : Vol Aller
                    </span>
                    <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      PNR & Compagnie Aller
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Code PNR Aller
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: SV142"
                        value={pnr}
                        onChange={(e) => setPnr(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Compagnie aérienne Aller
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Saudia, Air France..."
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Bloc 2: Vol Retour (Billet séparé) */}
                <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Plane className="w-3.5 h-3.5 text-purple-600" />
                      Billet 2 : Vol Retour (Billet Séparé)
                    </span>
                    <span className="text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                      2ème PNR & Compagnie
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Code PNR Retour
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: MS892"
                        value={returnPnr}
                        onChange={(e) => setReturnPnr(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono uppercase text-slate-900 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Compagnie aérienne Retour
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: EgyptAir, Transavia, Flynas..."
                        value={returnCompany}
                        onChange={(e) => setReturnCompany(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              href="/app/dashboard"
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Annuler
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Transmettre le dossier avec les pièces jointes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
