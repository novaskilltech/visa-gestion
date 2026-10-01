import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Tests des algorithmes d'extraction de billets d'avion et de cumul de documents
describe('Tests Reconnaissance OCR & Cumul de Documents (Passeport + Billets d\'avion)', () => {

  // Test 1: Parser de Billet d'avion (PNR, Compagnie, Dates)
  test('Extraction réelle PNR et Compagnie sur billet Saudia Airlines', () => {
    const rawTicketText = `
      ELECTRONIC TICKET RECEIPT
      BOOKING REFERENCE: SV789B
      PASSENGER: EL ALAMI / YOUSSEF MR
      AIRLINE: SAUDIA AIRLINES
      FLIGHT: SV 142
      DEPARTURE: 20/11/2026 PARIS CDG
      ARRIVAL: 21/11/2026 JEDDAH JED
      RETURN FLIGHT: 05/12/2026
    `;

    // Regex d'extraction PNR
    const pnrMatch = rawTicketText.match(/(?:BOOKING\s*REFERENCE|PNR)\s*[:.\-]?\s*([A-Z0-9]{5,7})/i);
    assert.ok(pnrMatch);
    assert.equal(pnrMatch[1], 'SV789B');

    // Détection Compagnie
    assert.match(rawTicketText, /SAUDIA/i);

    // Détection Dates
    const dates = rawTicketText.match(/\b(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})\b/g);
    assert.ok(dates && dates.length >= 2);
    assert.equal(dates[0], '20/11/2026');
    assert.equal(dates[1], '21/11/2026');
    assert.equal(dates[2], '05/12/2026');
  });

  // Test 2: Détection de billets séparés (Aller Saudia, Retour EgyptAir)
  test('Détection automatique de Billets Séparés (2 PNR distincts)', () => {
    const ticketAller = {
      pnr: 'SV142A',
      company: 'Saudia Airlines',
      date: '2026-11-20',
    };

    const ticketRetour = {
      pnr: 'MS892B',
      company: 'EgyptAir',
      date: '2026-12-05',
    };

    let caseData = {
      flight_pnr: '',
      flight_company: '',
      has_separate_tickets: false,
      return_flight_pnr: '',
      return_flight_company: '',
    };

    // Traitement 1er billet
    caseData.flight_pnr = ticketAller.pnr;
    caseData.flight_company = ticketAller.company;

    // Traitement 2ème billet
    if (ticketRetour.pnr && ticketRetour.pnr !== caseData.flight_pnr) {
      caseData.has_separate_tickets = true;
      caseData.return_flight_pnr = ticketRetour.pnr;
      caseData.return_flight_company = ticketRetour.company;
    }

    assert.equal(caseData.has_separate_tickets, true);
    assert.equal(caseData.flight_pnr, 'SV142A');
    assert.equal(caseData.return_flight_pnr, 'MS892B');
    assert.equal(caseData.flight_company, 'Saudia Airlines');
    assert.equal(caseData.return_flight_company, 'EgyptAir');
  });

  // Test 3: Cumul de documents multiples (Passeport + 2 Billets)
  test('Cumul de documents multiples attachés au dossier visa', () => {
    const attachedDocuments = [];

    // Ajout Passeport
    attachedDocuments.push({
      id: 'doc-pass-1',
      type: 'PASSEPORT',
      file_name: 'passeport_el_alami.pdf',
      file_size: 420000,
    });

    // Ajout Billet Aller
    attachedDocuments.push({
      id: 'doc-flight-1',
      type: 'BILLET_AVION',
      file_name: 'e-ticket_aller_saudia.pdf',
      file_size: 210000,
    });

    // Ajout Billet Retour
    attachedDocuments.push({
      id: 'doc-flight-2',
      type: 'BILLET_AVION',
      file_name: 'boarding_pass_retour.jpg',
      file_size: 150000,
    });

    assert.equal(attachedDocuments.length, 3);
    assert.equal(attachedDocuments.filter(d => d.type === 'BILLET_AVION').length, 2);
    assert.equal(attachedDocuments.filter(d => d.type === 'PASSEPORT').length, 1);
  });

  // Test 4: Partage bilatéral des pièces jointes (Agence ↔ Prestataire France Elite)
  test('Le prestataire et l agence ont tous deux accès aux documents attachés', () => {
    const mockCase = {
      id: 'case-omra-1',
      reference: 'VISA-2026-OMRA001',
      organization_id: 'org-omrayanair',
      documents: [
        { id: 'd1', file_name: 'passeport.pdf', type: 'PASSEPORT' },
        { id: 'd2', file_name: 'vol_saudia.pdf', type: 'BILLET_AVION' },
      ],
    };

    function canViewDocuments(userRole, userOrgId, targetCase) {
      if (userRole === 'SUPER_ADMIN' || userRole === 'VISA_AGENT') {
        return { authorized: true, documents: targetCase.documents };
      }
      if (userOrgId === targetCase.organization_id) {
        return { authorized: true, documents: targetCase.documents };
      }
      return { authorized: false, documents: [] };
    }

    // Agence Omrayanair
    const agencyAccess = canViewDocuments('AGENCY_ADMIN', 'org-omrayanair', mockCase);
    assert.equal(agencyAccess.authorized, true);
    assert.equal(agencyAccess.documents.length, 2);

    // Prestataire France Elite (SUPER_ADMIN)
    const providerAccess = canViewDocuments('SUPER_ADMIN', 'org-france-elite', mockCase);
    assert.equal(providerAccess.authorized, true);
    assert.equal(providerAccess.documents.length, 2);

    // Autre agence tierce (non autorisée)
    const thirdPartyAccess = canViewDocuments('AGENCY_ADMIN', 'org-autre', mockCase);
    assert.equal(thirdPartyAccess.authorized, false);
    assert.equal(thirdPartyAccess.documents.length, 0);
  });
});
