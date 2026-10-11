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
    name: 'flyadeal', 
    matchers: [/\bFLYADEAL\b/i, /\bADEAL\b/i, /\bF3\s*[0-9]{3,4}\b/i], 
    code: 'F3' 
  },
  { 
    name: 'Wizz Air', 
    matchers: [/\bWIZZAIR\b/i, /\bWIZZ\s*AIR\b/i, /\bW6\s*[0-9]{3,4}\b/i, /\bW9\s*[0-9]{3,4}\b/i, /\b5W\s*[0-9]{3,4}\b/i], 
    code: 'W6' 
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

  // 1. DÉTECTION DU CODE PNR (RÉSERVATION / CONFIRMATION / DOSSIER PASSAGER)
  let detectedPnr = '';

  // Patterns explicites avec tous les libellés usuels des compagnies aériennes
  // Supporte les délimiteurs : , -, #, espaces et sauts de ligne
  const pnrPatterns = [
    // "Code de confirmation", "Confirmation code", "Code confirmation", "Booking confirmation"
    /(?:CODE\s*(?:DE\s*)?CONFIRMATION|CONFIRMATION\s*(?:CODE|NO|NUMBER|NUM[ÉE]RO)?|BOOKING\s*CONFIRMATION)\s*[:.\-\s#\n\r]*([A-Z0-9]{5,8})\b/i,
    // "Code de réservation", "Booking reference", "Booking code", "Réf réservation", "Reservation number"
    /(?:CODE\s*(?:DE\s*)?R[ÉE]SERVATION|BOOKING\s*(?:REF(?:ERENCE)?|CODE)|R[ÉE]SERVATION\s*(?:NO|NUMBER|N°)?|RESERVATION\s*(?:CODE|NUMBER|NO)?)\s*[:.\-\s#\n\r]*([A-Z0-9]{5,8})\b/i,
    // "Numéro du dossier", "Dossier passager", "Numéro de dossier voyageur", "Record Locator", "RLOC"
    /(?:NUM[ÉE]RO\s*(?:DU\s*)?DOSSIER(?:\s*(?:DU\s*)?PASSAGER)?|DOSSIER\s*(?:PASSAGER|VOYAGEUR)?|RECORD\s*LOCATOR|RLOC)\s*[:.\-\s#\n\r]*([A-Z0-9]{5,8})\b/i,
    // "PNR", "Code PNR", "PNR No"
    /(?:CODE\s*)?PNR(?:\s*(?:NUMBER|NO|N°|CODE))?\s*[:.\-\s#\n\r]*([A-Z0-9]{5,8})\b/i,
    // "Référence dossier", "Référence billet", "Référence vol", "Référence de réservation"
    /(?:R[ÉE]F[ÉE]RENCE\s*(?:DE\s*R[ÉE]SERVATION|DU\s*DOSSIER|DU\s*VOL|DU\s*BILLET|DU\s*VOYAGE)?|REF\b)\s*[:.\-\s#\n\r]*([A-Z0-9]{5,8})\b/i,
    // "Itinéraire", "Electronic Itinerary", "Itinéraire électronique"
    /(?:ITIN[ÉE]RAIRE\s*(?:[ÉE]LECTRONIQUE)?|ITINERARY)\s*[:.\-\s#\n\r]*([A-Z0-9]{5,8})\b/i,
    // "E-ticket receipt / confirmation"
    /(?:E-?TICKET\s*(?:RECEIPT|CONFIRMATION)?\s*(?:NUMBER|NO)?)\s*[:.\-\s#\n\r]*([A-Z0-9]{5,8})\b/i,
    // Format GDS standard
    /\b([A-Z0-9]{6})\b\s*(?:GDS|AMADEUS|SABRE|GALILEO)/i,
    /(?:ELECTRONIC\s*TICKET|ETKT)\b.*?([A-Z0-9]{6})/i,
  ];

  for (const pat of pnrPatterns) {
    const match = text.match(pat);
    if (match && match[1]) {
      const candidate = match[1].trim().toUpperCase();
      // Exclure les faux positifs évidents (mots usuels ou dates)
      const ignoredWords = ['BILLET', 'FLIGHT', 'TICKET', 'VOYAGE', 'FRANCE', 'SAUDIA', 'RETURN', 'DEPART', 'CONFIRM', 'STATUS', 'NUMBER', 'DIRECT', 'PASSEPORT'];
      if (!ignoredWords.includes(candidate) && !/^\d{4,8}$/.test(candidate) && candidate.length >= 5 && candidate.length <= 8) {
        detectedPnr = candidate;
        summary.push(`Code PNR détecté : ${detectedPnr}`);
        break;
      }
    }
  }

  // 1b. Si pas de mot-clé trouvé, détection intelligente de code de réservation standard à 6 caractères
  // (Le standard mondial aéronautique IATA/GDS : 6 caractères alphanumériques reconnaissables dans un billet)
  if (!detectedPnr) {
    // Chercher les tokens de 6 caractères exactement (ex: O93HVZ, WHDPMR, IGZ27A, 6X7Y9Z)
    const sixCharTokens = text.match(/\b([A-Z0-9]{6})\b/g) || [];
    const ignoredDictionary = new Set([
      'BILLET', 'FLIGHT', 'TICKET', 'VOYAGE', 'FRANCE', 'SAUDIA', 'RETURN', 'DEPART', 
      'ARRIVE', 'ONLINE', 'MOBILE', 'AGENCY', 'AVION', 'TRAVEL', 'SYSTEM', 'NUMBER',
      'AIRLINE', 'AIRWAY', 'PARIS', 'JEDDAH', 'MADINA', 'RIYADH', 'AIRBUS', 'BOEING',
      'SECOND', 'MINUTE', 'GUEST', 'CLASS', 'ADULT', 'CHLD', 'INFANT', 'STATUS',
      'ISSUED', 'NOTICE', 'REFUND', 'CHANGE', 'BEFORE', 'OCTOBR', 'DECEMB', 'PASSEP',
      'FEMALE', 'GENDER', 'CLIENT', 'PERSON', 'DETAIL', 'MIDDLE', 'CREDIT', 'CHARGE'
    ]);

    for (const token of sixCharTokens) {
      const code = token.toUpperCase();
      // Un PNR standard IATA comporte 6 caractères, contient des lettres majuscules et n'est pas 100% chiffres
      const hasLetters = /[A-Z]/.test(code);
      const isPureDigits = /^[0-9]{6}$/.test(code);
      if (hasLetters && !isPureDigits && !ignoredDictionary.has(code)) {
        detectedPnr = code;
        summary.push(`Code PNR (format 6 caractères standard) : ${detectedPnr}`);
        break;
      }
    }
  }

  // 2. DÉTECTION DE LA COMPAGNIE AÉRIENNE & NUMÉRO DE VOL
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

  // Détection explicite du numéro de vol (ex: Flight: SV 142, Vol F3812, XY 521, TO 3140, W6 2451)
  if (!detectedFlightNum) {
    const explicitFlightMatch = text.match(/(?:FLIGHT|VOL|VOL\s*N°|FLIGHT\s*NO)\s*[:.\-\s#\n\r]*([A-Z0-9]{2}\s*[0-9]{2,4})\b/i);
    if (explicitFlightMatch && explicitFlightMatch[1]) {
      detectedFlightNum = explicitFlightMatch[1].toUpperCase().replace(/\s+/g, '');
      summary.push(`Numéro de vol : ${detectedFlightNum}`);
    } else {
      // Reconnaissance des codes IATA de vols fréquents (SV, XY, F3, AT, AF, MS, TO, TK, PC, W6, AH, TU, LH...)
      const flightCodeMatch = text.match(/\b((?:SV|XY|F3|AT|AF|MS|TO|TK|PC|W6|AH|TU|LH|EK|QR|EY|GF)\s*[0-9]{2,4})\b/i);
      if (flightCodeMatch && flightCodeMatch[1]) {
        detectedFlightNum = flightCodeMatch[1].toUpperCase().replace(/\s+/g, '');
        summary.push(`Numéro de vol identifié : ${detectedFlightNum}`);
      } else {
        const generalFlightMatch = text.match(/\b([A-Z]{2}\s*[0-9]{3,4})\b/);
        if (generalFlightMatch && generalFlightMatch[1]) {
          detectedFlightNum = generalFlightMatch[1].toUpperCase().replace(/\s+/g, '');
          summary.push(`Numéro de vol identifié : ${detectedFlightNum}`);
        }
      }
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

  // Format 1 : 15/11/2026 ou 15/11/26 ou 15-11-2026 ou 15.11.2026
  const numericDateRegex = /\b(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{2,4})\b/g;
  let numMatch: RegExpExecArray | null;
  while ((numMatch = numericDateRegex.exec(text)) !== null) {
    const d = parseInt(numMatch[1] || '0', 10);
    const m = parseInt(numMatch[2] || '0', 10);
    let y = parseInt(numMatch[3] || '0', 10);
    if (y < 100) y += 2000;
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2024 && y <= 2035) {
      foundDates.push({
        date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        raw: numMatch[0],
        index: numMatch.index,
      });
    }
  }

  // Format 1b : Format ISO 2026-11-20
  const isoDateRegex = /\b(\d{4})[\/\-](\d{2})[\/\-](\d{2})\b/g;
  let isoMatch: RegExpExecArray | null;
  while ((isoMatch = isoDateRegex.exec(text)) !== null) {
    const y = parseInt(isoMatch[1] || '0', 10);
    const m = parseInt(isoMatch[2] || '0', 10);
    const d = parseInt(isoMatch[3] || '0', 10);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12 && y >= 2024 && y <= 2035) {
      foundDates.push({
        date: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        raw: isoMatch[0],
        index: isoMatch.index,
      });
    }
  }

  // Format 2 : 20 NOV 2026 ou 20-NOV-26 ou 20NOV26 ou 20 NOVEMBRE 2026
  const alphaDateRegex = /\b(\d{1,2})[\s\-\/]*([A-Za-zÀ-ÿ]{3,10})[\s\-\/]*(\d{2,4})\b/g;
  let alphaMatch: RegExpExecArray | null;
  while ((alphaMatch = alphaDateRegex.exec(text)) !== null) {
    const d = parseInt(alphaMatch[1] || '0', 10);
    const monthStr = (alphaMatch[2] || '').toUpperCase();
    let y = parseInt(alphaMatch[3] || '0', 10);
    if (y < 100) y += 2000; // si format YY -> 20YY

    const monthNum = MONTH_NAMES[monthStr] || MONTH_NAMES[monthStr.substring(0, 3)] || MONTH_NAMES[monthStr.substring(0, 4)];
    if (monthNum && d >= 1 && d <= 31 && y >= 2024 && y <= 2035) {
      foundDates.push({
        date: `${y}-${monthNum}-${String(d).padStart(2, '0')}`,
        raw: alphaMatch[0],
        index: alphaMatch.index,
      });
    }
  }

  // Format 2b : Format IATA court (ex: 18OCT ou 30OCT sans année explicite, ou suivi d'une heure)
  const iataShortDateRegex = /\b(\d{1,2})([A-Z]{3})\b/g;
  let iataMatch: RegExpExecArray | null;
  const currentOrNextYear = new Date().getFullYear();
  while ((iataMatch = iataShortDateRegex.exec(text)) !== null) {
    const d = parseInt(iataMatch[1] || '0', 10);
    const monthStr = (iataMatch[2] || '').toUpperCase();
    const monthNum = MONTH_NAMES[monthStr];
    if (monthNum && d >= 1 && d <= 31) {
      // Déterminer l'année : chercher si 2025, 2026 ou 2027 est présent dans le texte global
      const textYearMatch = text.match(/\b(202[4-9])\b/);
      const chosenYear = textYearMatch ? parseInt(textYearMatch[1], 10) : currentOrNextYear;
      foundDates.push({
        date: `${chosenYear}-${monthNum}-${String(d).padStart(2, '0')}`,
        raw: iataMatch[0],
        index: iataMatch.index,
      });
    }
  }

  // Format 3 : NOV 20, 2026 ou November 20 2026
  const usDateRegex = /\b([A-Za-zÀ-ÿ]{3,10})\s+(\d{1,2}),?\s+(\d{4})\b/g;
  let usMatch: RegExpExecArray | null;
  while ((usMatch = usDateRegex.exec(text)) !== null) {
    const monthStr = (usMatch[1] || '').toUpperCase();
    const d = parseInt(usMatch[2] || '0', 10);
    const y = parseInt(usMatch[3] || '0', 10);
    const monthNum = MONTH_NAMES[monthStr] || MONTH_NAMES[monthStr.substring(0, 3)];
    if (monthNum && d >= 1 && d <= 31 && y >= 2024 && y <= 2035) {
      foundDates.push({
        date: `${y}-${monthNum}-${String(d).padStart(2, '0')}`,
        raw: usMatch[0],
        index: usMatch.index,
      });
    }
  }

  // Détermination intelligente de la date de départ et retour
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
