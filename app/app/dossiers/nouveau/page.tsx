'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCurrentSession, createVisaCase } from '@/lib/store';
import { VisaCase } from '@/types';
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
  Bot
} from 'lucide-react';

export default function NewCasePage() {
  const router = useRouter();
  const session = getCurrentSession();

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

  // OCR state
  const [isScanning, setIsScanning] = useState(false);
  const [aiExtracted, setAiExtracted] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const simulateAiScan = (type: 'sarah' | 'ahmed') => {
    setIsScanning(true);
    setUploadedFileName(type === 'sarah' ? 'passeport_sarah_martin.pdf' : 'passeport_ahmed_benali.pdf');

    setTimeout(() => {
      if (type === 'sarah') {
        setFirstName('Sarah');
        setLastName('Martin');
        setPassportNum('24AB12345');
        setNationality('Française');
        setBirthDate('1988-06-14');
        setExpiryDate('2032-04-10');
        setPnr('SV8942');
        setCompany('Saudia');
      } else {
        setFirstName('Ahmed');
        setLastName('Benali');
        setPassportNum('21CD98765');
        setNationality('Française');
        setBirthDate('1982-11-03');
        setExpiryDate('2029-08-22');
        setPnr('HY254');
        setCompany('Uzbekistan Airways');
      }
      setIsScanning(false);
      setAiExtracted(true);
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !destination) {
      alert('Veuillez renseigner le nom, prénom et la destination.');
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
        status: aiExtracted ? 'PRET_A_TRANSMETTRE' : 'A_VERIFIER',
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
            Déposez le passeport pour laisser l&apos;IA extraire les informations ou saisissez-les manuellement.
          </p>
        </div>

        {/* AI SCANNER TRIGGER SECTION */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50 border border-brand-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-brand-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Bot className="w-4 h-4 text-brand-600" />
              Module d&apos;Extraction Automatique IA (MRZ + Billet)
            </span>
            <span className="text-[10px] bg-brand-200 text-brand-800 font-bold px-2 py-0.5 rounded">
              Assistant IA Actif
            </span>
          </div>

          <div className="border-2 border-dashed border-brand-300 rounded-xl p-6 text-center bg-white/70 space-y-3">
            <UploadCloud className="w-10 h-10 text-brand-600 mx-auto" />
            <div>
              <p className="text-xs font-bold text-slate-800">
                Glissez-déposez le passeport scanné du voyageur (PDF / JPG)
              </p>
              <p className="text-[11px] text-slate-500">
                Le système analysera la bande MRZ et pré-remplira les champs instantanément.
              </p>
            </div>

            {/* Quick simulation buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs text-slate-700 font-medium">Tester avec un exemple :</span>
              <button
                type="button"
                onClick={() => simulateAiScan('sarah')}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-brand-50 border border-brand-300 text-xs font-semibold text-brand-700 shadow-2xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Exemple 1 : Sarah Martin (Arabie Saoudite)
              </button>
              <button
                type="button"
                onClick={() => simulateAiScan('ahmed')}
                disabled={isScanning}
                className="px-3 py-1.5 rounded-lg bg-white hover:bg-brand-50 border border-brand-300 text-xs font-semibold text-brand-700 shadow-2xs flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Exemple 2 : Ahmed Benali (Ouzbékistan)
              </button>
            </div>

            {isScanning && (
              <div className="p-3 bg-brand-100/60 rounded-lg text-xs text-brand-800 font-medium animate-pulse flex items-center justify-center gap-2">
                <Bot className="w-4 h-4" />
                <span>Analyse optique et extraction des coordonnées en cours...</span>
              </div>
            )}

            {aiExtracted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Données extraites avec succès ({uploadedFileName}) ! Vous pouvez les ajuster ci-dessous.</span>
              </div>
            )}
          </div>
        </div>

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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
                >
                  <option value="Arabie Saoudite">Arabie Saoudite (Omra / Tourisme)</option>
                  <option value="Ouzbékistan">Ouzbékistan</option>
                  <option value="Chine">Chine</option>
                  <option value="Inde">Inde</option>
                  <option value="Égypte">Égypte</option>
                  <option value="Russie">Russie</option>
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
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 bg-white text-slate-900"
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
              {aiExtracted && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                  Vérifié par l&apos;IA
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nom de famille (tel qu&apos;écrit sur le passeport) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="MARTIN"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prénom(s) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sarah"
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
                  placeholder="24AB12345"
                  value={passportNum}
                  onChange={(e) => setPassportNum(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 font-mono text-slate-900"
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
                  placeholder="SV8942"
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
              <span>Créer le dossier visa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
