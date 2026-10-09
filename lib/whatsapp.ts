import { Organization, VisaCase } from '@/types';

/**
 * Nettoie et formate un numéro de téléphone international pour l'API WhatsApp (wa.me)
 * Exemple: "+33 6 61 41 63 63" -> "33661416363"
 */
export function formatPhoneNumberForWhatsApp(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/[^\d]/g, '');
}

/**
 * Construit le texte pré-rédigé officiel de notification WhatsApp pour le prestataire
 */
export function buildWhatsAppTransmissionMessage(params: {
  caseId?: string;
  caseReference: string;
  travelerName: string;
  destinationCountry?: string;
  travelType?: string;
  documentsCount?: number;
  notes?: string;
  providerName?: string;
}): string {
  const {
    caseId,
    caseReference,
    travelerName,
    destinationCountry = 'Arabie Saoudite',
    travelType = 'Omra / Hajj',
    documentsCount = 0,
    notes,
    providerName,
  } = params;

  const directUrl = caseId 
    ? `https://visa-gestion.vercel.app/app/dossiers/${caseId}` 
    : `https://visa-gestion.vercel.app/app/dossiers`;

  let msg = `Bonjour${providerName ? ' ' + providerName : ''},\n\n`;
  msg += `📢 *Nouveau dossier visa transmis sur la plateforme VISA GESTION*\n\n`;
  msg += `📁 *Référence :* ${caseReference}\n`;
  msg += `👤 *Voyageur :* ${travelerName}\n`;
  msg += `📍 *Destination :* ${destinationCountry} (${travelType})\n`;
  msg += `📎 *Pièces jointes attachées :* ${documentsCount} document(s) (Passeport / Billets d'avion)\n`;

  if (notes && notes.trim()) {
    msg += `📝 *Note d'instruction :* ${notes.trim()}\n`;
  }

  msg += `\n🔗 *Lien direct sécurisé vers le dossier :*\n`;
  msg += `${directUrl}\n\n`;
  msg += `Merci de prendre en charge ce dossier consulaire dès réception.`;

  return msg;
}

/**
 * Génère le lien complet wa.me prêt à l'emploi
 */
export function getWhatsAppTransmissionUrl(params: {
  phone?: string;
  caseId?: string;
  caseReference: string;
  travelerName: string;
  destinationCountry?: string;
  travelType?: string;
  documentsCount?: number;
  notes?: string;
  providerName?: string;
}): string {
  const rawPhone = formatPhoneNumberForWhatsApp(params.phone);
  const text = buildWhatsAppTransmissionMessage(params);
  const encodedText = encodeURIComponent(text);

  if (rawPhone) {
    return `https://wa.me/${rawPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
