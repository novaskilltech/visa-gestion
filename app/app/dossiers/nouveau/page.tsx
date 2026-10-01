'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, createVisaCase } from '@/lib/store';
import { VisaCase } from '@/types';
import { parsePassportText, ParsedPassportData } from '@/lib/mrz-parser';
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
  Info
} from 'lucide-react';

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

  // Flight info
  const [pnr, setPnr] = useState('');
  const [company, setCompany] = useState('');

  // File & OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStep, setScanStep] = useState<string>('');
  const [aiExtracted, setAiExtracted] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [detectionSummary, setDetectionSummary] = useState<string[]>([]);
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // REAL OCR EXTRACTION ENGINE (SUPPORT IMAGE & PDF)
  const processPassportFile = async (file: File) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanStep('Chargement du document...');
    setUploadedFileName(file.name);
    setAiExtracted(false);
    setWarningMsg(null);
    setDetectionSummary([]);

    try {
      let rawText = '';

      // CAS 1 : C'EST UN FICHIER PDF
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        setScanStep('Conversion du PDF et analyse des calques...');
        setScanProgress(25);

        const pdfResult = await processPdfFile(file);
        
        // Afficher l'aperçu rendu de la première page du PDF
        if (pdfResult.previewUrl) {
          setFilePreview(pdfResult.previewUrl);
        }

        // Si le PDF contenait du texte numérique exploitable
        if (pdfResult.text && pdfResult.text.length > 30) {
          rawText = pdfResult.text;
          setScanProgress(70);
        } else if (pdfResult.canvas) {
          // Si c'est un PDF scanné (image dans PDF), on lance l'OCR sur le canvas haute résolution
          setScanStep('Lecture optique OCR de la page scannée du PDF...');
          setScanProgress(40);

          const ocrResult = await Tesseract.recognize(pdfResult.canvas, 'fra+eng', {
            logger: (m) => {
              if (m.status === 'recognizing text' && m.progress) {
                setScanProgress(Math.round(40 + m.progress * 50));
              }
            },
          });
          rawText = ocrResult.data.text || '';
        }
      } 
      // CAS 2 : C'EST UNE IMAGE (JPG, PNG, WEBP)
      else {
        setScanStep('Lecture de l\'image et analyse optique...');
        setScanProgress(25);

        // Aperçu de l'image
        const reader = new FileReader();
        reader.onload = (e) => setFilePreview(e.target?.result as string);
        reader.readAsDataURL(file);

        const ocrResult = await Tesseract.recognize(file, 'fra+eng', {
          logger: (m) => {
            if (m.status === 'recognizing text' && m.progress) {
              setScanProgress(Math.round(25 + m.progress * 65));
            }
          },
        });
        rawText = ocrResult.data.text || '';
      }

      setScanStep('Extraction des entités réelles (norme OACI 9303)...');
      setScanProgress(95);

      // PARSING STRICT (ZÉRO DONNÉE FICTIVE)
      const parsed = parsePassportText(rawText);
      const found: string[] = [];

      if (parsed.lastName) {
        setLastName(parsed.lastName);
        found.push(`Nom : ${parsed.lastName}`);
      }
      if (parsed.firstName) {
        setFirstName(parsed.firstName);
        found.push(`Prénom : ${parsed.firstName}`);
      }
      if (parsed.passportNumber) {
        setPassportNum(parsed.passportNumber);
        found.push(`Passeport : ${parsed.passportNumber}`);
      }
      if (parsed.nationality) {
        setNationality(parsed.nationality);
      }
      if (parsed.birthDate) {
        setBirthDate(parsed.birthDate);
        found.push(`Naissance : ${parsed.birthDate}`);
      }
      if (parsed.expiryDate) {
        setExpiryDate(parsed.expiryDate);
        found.push(`Expiration : ${parsed.expiryDate}`);
      }

      setScanProgress(100);
      setAiExtracted(true);
      setDetectionSummary(found);

      if (found.length === 0) {
        setWarningMsg(
          "Le texte du document n'a pas pu être lu avec une netteté suffisante. Veuillez saisir manuellement les informations ci-dessous."
        );
      } else if (found.length < 3) {
        setWarningMsg(
          "Certaines informations ont été détectées, mais d'autres sont incomplètes. Veuillez vérifier et compléter les champs vides ci-dessous."
        );
      }

    } catch (err) {
      console.error('Erreur lors du traitement du passeport:', err);
      setWarningMsg(
        "Impossible de lire automatiquement ce fichier. Vous pouvez saisir les informations directement dans le formulaire."
      );
      setAiExtracted(false);
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPassportFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processPassportFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !destination) {
      alert('Veuillez renseigner au moins le nom, prénom et la destination.');
      return;
    }

    createVisaCase(
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
        organization_id: session.organization_id,
        organization_name: session.organization_name,
        created_by: session.user_id,
      },
      session
    );

    router.push('/app/dashboard');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top back */}
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
            Déposez le passeport (PDF ou Image) : l&apos;IA extrait les données réelles sans inventer d&apos;informations.
          </p>
        </div>

        {/* ACTIVE OCR & DRAG-AND-DROP SCANNER BOX */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-brand-600" />
              Scanner Réel PDF & Images (MRZ + OCR)
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              IA Active (Données réelles uniquement)
            </span>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="application/pdf,image/png,image/jpeg,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Interactive Dropzone */}
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
            {/* Laser scanning beam animation */}
            {isScanning && (
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-brand-500/20 to-transparent animate-pulse pointer-events-none h-full"></div>
            )}

            <div className="space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
                {isScanning ? (
                  <RefreshCw className="w-7 h-7 animate-spin text-brand-600" />
                ) : (
                  <UploadCloud className="w-7 h-7 text-brand-600" />
                )}
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  {uploadedFileName
                    ? `Fichier sélectionné : ${uploadedFileName}`
                    : 'Glissez-déposez le PDF ou l\'image du passeport, ou cliquez pour parcourir'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prend en charge les fichiers PDF natifs et scannés, JPG, PNG, WEBP
                </p>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md shadow-brand-600/30 inline-flex items-center gap-2"
                >
                  <Scan className="w-4 h-4" />
                  <span>Sélectionner le passeport (PDF ou Image)</span>
                </button>
              </div>
            </div>

            {/* Scanning Progress Bar */}
            {isScanning && (
              <div className="mt-4 p-4 bg-brand-50 rounded-xl border border-brand-200 space-y-2 text-left animate-in fade-in">
                <div className="flex items-center justify-between text-xs font-semibold text-brand-900">
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {scanStep}
                  </span>
                  <span>{scanProgress}%</span>
                </div>
                <div className="w-full bg-brand-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-brand-600 h-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Success & Detection details */}
            {aiExtracted && (
              <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 text-left space-y-2 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Document analysé : {uploadedFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="text-[11px] text-brand-700 hover:underline font-bold"
                  >
                    Changer de document
                  </button>
                </div>

                {detectionSummary.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="font-semibold text-slate-700">Données réelles détectées :</span>
                    {detectionSummary.map((item, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold text-[11px]">
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {/* Warning Message if OCR missed something */}
            {warningMsg && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 text-left">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{warningMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Preview thumbnail of the scanned PDF / image */}
        {filePreview && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={filePreview}
              alt="Aperçu document scanné"
              className="w-24 h-16 object-contain bg-white rounded-lg border border-slate-300 shadow-2xs"
            />
            <div className="text-xs">
              <p className="font-bold text-slate-800">{uploadedFileName}</p>
              <p className="text-[11px] text-slate-500">
                Aperçu visuel de la page du passeport rendu et analysé par le moteur
              </p>
            </div>
          </div>
        )}

        {/* FORM */}
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
                2. Données d&apos;identité du voyageur
              </h3>
              <span className="text-[11px] text-slate-500">
                Vérifiez ou complétez les informations issues de votre passeport
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

          {/* Flight Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              3. Détails des vols (Optionnel)
            </h3>
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compagnie aérienne
                </label>
                <input
                  type="text"
                  placeholder="Saudia, Emirates, Air France..."
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>
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
              <span>Transmettre le dossier au prestataire</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
