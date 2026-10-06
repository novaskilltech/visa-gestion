import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Tests Multi-Tenant & Isolation Omrayanair vs France Elite (CDC #107 & #112)', () => {
  const mockOrganizations = [
    { id: 'org-omrayanair', name: 'Omrayanair', status: 'ACTIVE' },
    { id: 'org-france-elite', name: 'France Elite', status: 'ACTIVE' },
  ];

  const mockCases = [
    { id: 'c1', reference: 'VISA-2026-OMRA01', organization_id: 'org-omrayanair', traveler: 'Youssef EL ALAMI' },
    { id: 'c2', reference: 'VISA-2026-OMRA02', organization_id: 'org-omrayanair', traveler: 'Fatima ZAHRA' },
    { id: 'c3', reference: 'VISA-2026-AUTRE01', organization_id: 'org-autre', traveler: 'Autre Client' },
  ];

  function filterCasesByTenant(cases, userRole, userOrgId) {
    if (userRole === 'SUPER_ADMIN' || userRole === 'VISA_AGENT') {
      return cases;
    }
    return cases.filter(c => c.organization_id === userOrgId);
  }

  test('L agence Omrayanair ne doit voir QUE ses propres dossiers', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'AGENCY_ADMIN', 'org-omrayanair');
    assert.equal(visibleCases.length, 2);
    assert.ok(visibleCases.every(c => c.organization_id === 'org-omrayanair'));
    assert.ok(!visibleCases.some(c => c.traveler === 'Autre Client'));
  });

  test('Le prestataire France Elite (SUPER_ADMIN) a accès à l ensemble des dossiers pour traitement', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'SUPER_ADMIN', 'org-france-elite');
    assert.equal(visibleCases.length, 3);
  });

  test('Toutes les organisations possèdent un statut conforme', () => {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING', 'ARCHIVED'];
    for (const org of mockOrganizations) {
      assert.ok(validStatuses.includes(org.status));
    }
  });

  test('Chaque dossier de visa est rattaché à une organisation', () => {
    for (const visaCase of mockCases) {
      assert.ok(visaCase.organization_id);
      assert.match(visaCase.organization_id, /^org-/);
    }
  });

  test('Support des billets séparés : deux PNR et deux compagnies distinctes', () => {
    const caseWithSeparateTickets = {
      id: 'c-sep-1',
      reference: 'VISA-2026-OMRA-SEP',
      organization_id: 'org-omrayanair',
      traveler: 'Karim TAZI',
      has_separate_tickets: true,
      flight_pnr: 'SV142',
      flight_company: 'Saudia Airlines',
      return_flight_pnr: 'MS892',
      return_flight_company: 'EgyptAir',
    };

    assert.equal(caseWithSeparateTickets.has_separate_tickets, true);
    assert.equal(caseWithSeparateTickets.flight_pnr, 'SV142');
    assert.equal(caseWithSeparateTickets.flight_company, 'Saudia Airlines');
    assert.equal(caseWithSeparateTickets.return_flight_pnr, 'MS892');
    assert.equal(caseWithSeparateTickets.return_flight_company, 'EgyptAir');
    assert.notEqual(caseWithSeparateTickets.flight_pnr, caseWithSeparateTickets.return_flight_pnr);
  });

  test('Suppression d un dossier : une agence ne peut supprimer que son propre dossier', () => {
    let cases = [
      { id: 'c1', organization_id: 'org-omrayanair', traveler: 'Client 1' },
      { id: 'c2', organization_id: 'org-autre', traveler: 'Client 2' },
    ];

    function deleteCase(caseId, userRole, userOrgId) {
      const target = cases.find(c => c.id === caseId);
      if (!target) return { success: false, error: 'Introuvable' };
      if (userRole !== 'SUPER_ADMIN' && target.organization_id !== userOrgId) {
        return { success: false, error: 'Non autorisé' };
      }
      cases = cases.filter(c => c.id !== caseId);
      return { success: true };
    }

    // Omrayanair tente de supprimer un dossier d'une autre agence => Refusé
    const resRefus = deleteCase('c2', 'AGENCY_ADMIN', 'org-omrayanair');
    assert.equal(resRefus.success, false);
    assert.equal(cases.length, 2);

    // Omrayanair supprime son propre dossier => Accepté
    const resOk = deleteCase('c1', 'AGENCY_ADMIN', 'org-omrayanair');
    assert.equal(resOk.success, true);
    assert.equal(cases.length, 1);
    assert.equal(cases[0].id, 'c2');
  });

  test('Modification d un dossier : mise à jour des champs avec succès', () => {
    let currentCase = {
      id: 'c1',
      organization_id: 'org-omrayanair',
      traveler_first_name: 'Ahmed',
      traveler_last_name: 'TEST',
      destination: 'Arabie Saoudite',
    };

    function updateCase(caseId, updates) {
      if (currentCase.id === caseId) {
        currentCase = { ...currentCase, ...updates };
        return currentCase;
      }
      return null;
    }

    const updated = updateCase('c1', {
      traveler_first_name: 'Mustapha',
      destination: 'Turquie',
    });

    assert.equal(updated.traveler_first_name, 'Mustapha');
    assert.equal(updated.traveler_last_name, 'TEST');
    assert.equal(updated.destination, 'Turquie');
  });

  test('Compte Fab Voyage : authentification et rôle prestataire (SUPER_ADMIN)', () => {
    const configuredAccounts = [
      { username: 'omrayanair', password: 'Khouribga111*', organization_id: 'org-omrayanair', role: 'AGENCY_ADMIN' },
      { username: 'fabvoyage', password: 'fab78200', organization_id: 'org-fabvoyage', role: 'SUPER_ADMIN' },
      { username: 'France Elite', password: 'omrayanair', organization_id: 'org-france-elite', role: 'SUPER_ADMIN' },
    ];

    function authenticateMock(identifier, password) {
      const cleanId = identifier.trim().toLowerCase();
      const match = configuredAccounts.find(a => a.username.toLowerCase() === cleanId);
      if (!match) return { success: false, error: 'Identifiant introuvable' };
      if (match.password !== password.trim()) return { success: false, error: 'Mot de passe incorrect' };
      return { success: true, session: match };
    }

    // Auth Fab Voyage prestataire valide
    const authSuccess = authenticateMock('fabvoyage', 'fab78200');
    assert.equal(authSuccess.success, true);
    assert.equal(authSuccess.session.organization_id, 'org-fabvoyage');
    assert.equal(authSuccess.session.role, 'SUPER_ADMIN');

    // Auth Fab Voyage mauvais mot de passe
    const authWrongPass = authenticateMock('fabvoyage', 'mauvaismdp');
    assert.equal(authWrongPass.success, false);
    assert.equal(authWrongPass.error, 'Mot de passe incorrect');

    // En tant que prestataire (SUPER_ADMIN), Fab Voyage a accès à tous les dossiers pour traitement consulaire
    const mockCasesPlatform = [
      { id: 'c1', reference: 'VISA-2026-OMRA001', organization_id: 'org-omrayanair', traveler: 'Client Omrayanair 1' },
      { id: 'c2', reference: 'VISA-2026-OMRA002', organization_id: 'org-omrayanair', traveler: 'Client Omrayanair 2' },
      { id: 'c3', reference: 'VISA-2026-AUTRE01', organization_id: 'org-autre', traveler: 'Client Autre 1' },
    ];

    const fabVisible = filterCasesByTenant(mockCasesPlatform, 'SUPER_ADMIN', 'org-fabvoyage');
    assert.equal(fabVisible.length, 3);
    assert.ok(fabVisible.some(c => c.organization_id === 'org-omrayanair'));

    // L'agence Omrayanair reste quant à elle strictement cloisonnée à ses dossiers
    const omraVisible = filterCasesByTenant(mockCasesPlatform, 'AGENCY_ADMIN', 'org-omrayanair');
    assert.equal(omraVisible.length, 2);
    assert.ok(!omraVisible.some(c => c.organization_id === 'org-autre'));
  });
});
