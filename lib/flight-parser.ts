/**
 * Parser Réel pour Billets d'Avion, E-Tickets et Confirmations de Vol (SaaS B2B)
 * RÈGLE STRICTE : ZÉRO DONNÉE FICTIVE.
 * Si un champ n'est pas détecté avec certitude, il reste vide.
 */

export interface ParsedFlightData {
  pnr: string;
  airline: string;
  flightNumber: string;
  departureDate: string; // YYYY-MM-DD
  returnDate: string;    // YYYY-MM-DD
  destination: string;
  isReturnOrSecondTicket?: boolean;
  confidence: number;
  detectedVia: 'BILLET_AVION' | 'VIDE';
  rawText?: string;
  summary: string[];
}

const KNOWN_AIRLINES: { name: string; matchers: RegExp[]; code?: string }[] = [
  { 
    name: 'Saudia Airlines', 
    matchers: [/\bSAUDIA\b/i, /\bSAUDI ARABIAN\b/i, /\bSV\s*[0-9]{3,4}\b/i], 
    code: 'SV' 
  },
  { 
    name: 'Flynas', 
    matchers: [/\bFLYNAS\b/i, /\bNAS AIR\b/i, /\bXY\s*[0-9]{3,4}\b/i], 
    code: 'XY' 
  },
  { 
    name: 'Royal Air Maroc', 
    matchers: [/\bROYAL AIR MAROC\b/i, /\bRAM\b/i, /\bAT\s*[0-9]{3,4}\b/i], 
    code: 'AT' 
  },
  { 
    name: 'Air France', 
    matchers: [/\bAIR FRANCE\b/i, /\bAF\s*[0-9]{3,4}\b/i], 
    code: 'AF' 
  },
  { 
    name: 'EgyptAir', 
    matchers: [/\bEGYPTAIR\b/i, /\bEGYPT AIR\b/i, /\bMS\s*[0-9]{3,4}\b/i], 
    code: 'MS' 
  },
  { 
    name: 'Transavia', 
    matchers: [/\bTRANSAVIA\b/i, /\bTO\s*[0-9]{3,4}\b/i, /\bHV\s*[0-9]{3,4}\b/i], 
    code: 'TO' 
  },
  { 
    name: 'Turkish Airlines', 
    matchers: [/\bTURKISH AIRLINES\b/i, /\bTHY\b/i, /\bTK\s*[0-9]{3,4}\b/i], 
    code: 'TK' 
  },
  { 
    name: 'Emirates', 
    matchers: [/\bEMIRATES\b/i, /\bEK\s*[0-9]{3,4}\b/i], 
    code: 'EK' 
  },
  { 
    name: 'Qatar Airways', 
    matchers: [/\bQATAR AIRWAYS\b/i, /\bQR\s*[0-9]{3,4}\b/i], 
    code: 'QR' 
  },
  { 
    name: 'Etihad Airways', 
    matchers: [/\bETIHAD\b/i, /\bEY\s*[0-9]{3,4}\b/i], 
    code: 'EY' 
  },
  { 
    name: 'Gulf Air', 
    matchers: [/\bGULF AIR\b/i, /\bGF\s*[0-9]{3,4}\b/i], 
    code: 'GF' 
  },
  { 
    name: 'Pegasus Airlines', 
    matchers: [/\bPEGASUS\b/i, /\bPC\s*[0-9]{3,4}\b/i], 
    code: 'PC' 
  },
  { 
    name: 'Air Algérie', 
    matchers: [/\bAIR ALGERIE\b/i, /\bAIR ALGÉRIE\b/i, /\bAH\s*[0-9]{3,4}\b/i], 
    code: 'AH' 
  },
  { 
    name: 'Tunisair', 
    matchers: [/\bTUNISAIR\b/i, /\bTU\s*[0-9]{3,4}\b/i], 
    code: 'TU' 
  },
  { 
    name: 'Lufthansa', 
    matchers: [/\bLUFTHANSA\b/i, /\bLH\s*[0-9]{3,4}\b/i], 
    code: 'LH' 
  },
];

const MONTH_NAMES: Record<string, string> = {
  JAN: '01', JANV: '01', JANUARY: '01', JANVIER: '01',
  FEB: '02', FEV: '02', FEBR: '02', FEVRIER: '02', FEBRUARY: '02',
  MAR: '03', MARS: '03', MARCH: '03',
  APR: '04', AVR: '04', AVRI: '04', AVRIL: '04', APRIL: '04',
  MAY: '05', MAI: '05',
  JUN: '06', JUIN: '06', JUNE: '06',
  JUL: '07', JUIL: '07', JULL: '07', JUILLET: '07', JULY: '07',
  AUG: '08', AOU: '08', AOUT: '08', AOÛT: '08', AUGUST: '08',
  SEP: '09', SEPT: '09', SEPTEMBER: '09', SEPTEMBRE: '09',
  OCT: '10', OCTO: '10', OCTOBER: '10', OCTOBRE: '10',
  NOV: '11', NOVE: '11', NOVEMBER: '11', NOVEMBRE: '11',
  DEC: '12', DECE: '12', DÉC: '12', DECEMBER: '12', DÉCEMBRE: '12',
};

export function parseFlightTicketText(text: string): ParsedFlightData {
  if (!text || text.trim().length === 0) {
    return {
      pnr: '',
      airline: '',
      flightNumber: '',
      departureDate: '',
      returnDate: '',
      destination: '',
      confidence: 0,
      detectedVia: 'VIDE',
      summary: [],
    };
  }

  const summary: string[] = [];

  // 1. DÉTECTION DU CODE PNR (RÉSERVATION)
  let detectedPnr = '';

  // Patterns explicites avec mots-clés
  const pnrPatterns = [
    /(?:PNR|BOOKING\s*REF(?:ERENCE)?|R[ÉE]SERVATION|DOSSIER|RECORD\s*LOCATOR|RLOC|BOOKING\s*CODE)\s*[:.\-]?\s*([A-Z0-9]{5,7})\b/i,
    /(?:CODE\s*(?:DE\s*)?R[ÉE]SERVATION)\s*[:.\-]?\s*([A-Z0-9]{5,7})\b/i,
    /(?:R[ÉE]F[ÉE]RENCE\s*(?:DOSSIER)?)\s*[:.\-]?\s*([A-Z0-9]{5,7})\b/i,
    /\b([A-Z0-9]{6})\b\s*(?:GDS|AMADEUS|SABRE|GALILEO)/i,
  ];

  for (const pat of pnrPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim().toUpperCase();
      // Un PNR standard ne doit pas être un mot commun (ex: BILLET, FLIGHT, TICKET, VOYAGE)
      const ignoredWords = ['BILLET', 'FLIGHT', 'TICKET', 'VOYAGE', 'FRANCE', 'SAUDIA', 'RETURN', 'DEPART'];
      if (!ignoredWords.includes(candidate)) {
        detectedPnr = candidate;
        summary.push(`Code PNR détecté : ${detectedPnr}`);
        break;
      }
    }
  }

  // 2. DÉTECTION DE LA COMPAGNIE AÉRIENNE
  let detectedAirline = '';
  let detectedFlightNum = '';

  for (const item of KNOWN_AIRLINES) {
    for (const matcher of item.matchers) {
      const m = text.match(matcher);
      if (m) {
        detectedAirline = item.name;
        summary.push(`Compagnie aérienne : ${detectedAirline}`);
        if (m[0] && item.code && m[0].toUpperCase().startsWith(item.code)) {
          detectedFlightNum = m[0].toUpperCase().replace(/\s+/g, '');
        }
        break;
      }
    }
    if (detectedAirline) break;
  }

  // Si pas de numéro de vol détecté via la compagnie, chercher pattern de vol générique (ex: SV142, MS892)
  if (!detectedFlightNum) {
    const flightMatch = text.match(/\b([A-Z]{2}\s*[0-9]{3,4})\b/);
    if (flightMatch && flightMatch[1]) {
      detectedFlightNum = flightMatch[1].toUpperCase().replace(/\s+/g, '');
    }
  }

  // 3. DÉTECTION DE LA DESTINATION & PAYS
  let detectedDestination = '';
  if (/JEDDAH|DJEDDAH|JED\b|MEDINA|M[ÉE]DINE|MADINAH|MED\b|RIYADH|RIYAD|RUH\b|SAUDI|ARABIE\s*SAOUDITE/i.test(text)) {
    detectedDestination = 'Arabie Saoudite';
    summary.push('Destination détectée : Arabie Saoudite (Omra / Hajj)');
  } else if (/CASABLANCA|CMN\b|MAROC|MOROCCO|RABAT|MARRAKECH/i.test(text)) {
    detectedDestination = 'Maroc';
  } else if (/CAIRE|CAIRO|CAI\b|EGYPTE|EGYPT/i.test(text)) {
    detectedDestination = 'Égypte';
  } else if (/ISTANBUL|IST\b|SAW\b|TURQUIE|TURKEY/i.test(text)) {
    detectedDestination = 'Turquie';
  } else if (/DUBAI|DXB\b|EMIRATS|UAE/i.test(text)) {
    detectedDestination = 'Émirats Arabes Unis';
  }

  // 4. DÉTECTION DES DATES (DÉPART & RETOUR)
  let departureDate = '';
  let returnDate = '';
  const foundDates: { date: string; raw: string; index: number }[] = [];

  // Format 1 : 15/11/2026 ou 15-11-2026
  const numericDateRegex = /\b(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})\b/g;
  let numMatch: RegExpExecArray | null;
  while ((numMatch = numericDateRegex.exec(text)) !== null) {
    const d = parseInt(numMatch[1] || '0', 10);
    const m = parseInt(numMatch[2] || '0', 10);
    const y = parseInt(numMatch[3] || '0', 10);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2024 && y <= 2035) {
      foundDates.push({
        date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        raw: numMatch[0],
        index: numMatch.index,
      });
    }
  }

  // Format 2 : 20 NOV 2026 ou 20 NOVEMBRE 2026
  const alphaDateRegex = /\b(\d{1,2})\s+([A-Za-zÀ-ÿ]{3,10})\s+(\d{4})\b/g;
  let alphaMatch: RegExpExecArray | null;
  while ((alphaMatch = alphaDateRegex.exec(text)) !== null) {
    const d = parseInt(alphaMatch[1] || '0', 10);
    const monthStr = (alphaMatch[2] || '').toUpperCase();
    const y = parseInt(alphaMatch[3] || '0', 10);
    const monthNum = MONTH_NAMES[monthStr] || MONTH_NAMES[monthStr.substring(0, 3)] || MONTH_NAMES[monthStr.substring(0, 4)];
    if (monthNum && d >= 1 && d <= 31 && y >= 2024 && y <= 2035) {
      foundDates.push({
        date: `${y}-${monthNum}-${String(d).padStart(2, '0')}`,
        raw: alphaMatch[0],
        index: alphaMatch.index,
      });
    }
  }

  // Détermination de la date de départ et retour
  if (foundDates.length > 0) {
    // Trier chronologiquement
    const uniqueDates = Array.from(new Set(foundDates.map(f => f.date))).sort();
    if (uniqueDates.length >= 2 && uniqueDates[0] && uniqueDates[1]) {
      departureDate = uniqueDates[0];
      returnDate = uniqueDates[uniqueDates.length - 1];
      summary.push(`Dates de voyage : Départ le ${departureDate}, Retour le ${returnDate}`);
    } else if (uniqueDates.length === 1 && uniqueDates[0]) {
      departureDate = uniqueDates[0];
      summary.push(`Date de vol détectée : ${departureDate}`);
    }
  }

  const isBillet = !!(detectedPnr || detectedAirline || detectedFlightNum || (/BILLET|BOARDING|FLIGHT|E-TICKET/i.test(text)));
  const confidence = (detectedPnr && detectedAirline) ? 0.95 : (detectedPnr || detectedAirline) ? 0.80 : isBillet ? 0.60 : 0;

  return {
    pnr: detectedPnr,
    airline: detectedAirline,
    flightNumber: detectedFlightNum,
    departureDate,
    returnDate,
    destination: detectedDestination,
    confidence,
    detectedVia: isBillet ? 'BILLET_AVION' : 'VIDE',
    rawText: text,
    summary,
  };
}

/**
 * Classificateur de type de document basé sur le contenu textuel extrait
 */
export function classifyDocumentType(text: string): 'PASSEPORT' | 'BILLET_AVION' | 'AUTRE' {
  if (!text || text.trim().length === 0) return 'AUTRE';

  // Marqueurs passeport / identité
  const isPassport = 
    /P<[A-Z]{3}/i.test(text) ||
    /\bPASSEPORT\b/i.test(text) ||
    /\bPASSPORT\b/i.test(text) ||
    /\bREPUBLIQUE FRANCAISE\b/i.test(text) ||
    /\bNATIONALIT[ÉE]\b/i.test(text) ||
    /\bDATE DE NAISSANCE\b/i.test(text);

  // Marqueurs billet d'avion
  const isFlight = 
    /\bPNR\b/i.test(text) ||
    /\bE-TICKET\b/i.test(text) ||
    /\bBOARDING PASS\b/i.test(text) ||
    /\bBOOKING REF\b/i.test(text) ||
    /\bCONFIRMATION DE VOL\b/i.test(text) ||
    /\bSAUDIA\b/i.test(text) ||
    /\bFLYNAS\b/i.test(text) ||
    /\bROYAL AIR MAROC\b/i.test(text) ||
    /\bEGYPTAIR\b/i.test(text) ||
    /\bAIR FRANCE\b/i.test(text) ||
    /\bTURKISH AIRLINES\b/i.test(text) ||
    /\bEMIRATES\b/i.test(text) ||
    /\bTRANSAVIA\b/i.test(text);

  if (isPassport && !isFlight) return 'PASSEPORT';
  if (isFlight && !isPassport) return 'BILLET_AVION';

  // Si ambiguïté, on évalue la densité
  if (isPassport && isFlight) {
    if (/P<[A-Z]{3}/i.test(text)) return 'PASSEPORT';
    return 'BILLET_AVION';
  }

  return 'AUTRE';
}
