import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Tests Multi-Tenant & Cloisonnement des Prestataires vs Super Admin Omrayanair', () => {
  const mockOrganizations = [
    { id: 'org-omrayanair', name: 'Omrayanair', status: 'ACTIVE' },
    { id: 'org-fabvoyage', name: 'Fab Voyage', status: 'ACTIVE' },
    { id: 'org-france-elite', name: 'France Elite', status: 'ACTIVE' },
  ];

  const mockCases = [
    { id: 'c1', reference: 'VISA-2026-OMRA01', organization_id: 'org-omrayanair', traveler: 'Youssef EL ALAMI' },
    { id: 'c2', reference: 'VISA-2026-FABV01', organization_id: 'org-fabvoyage', traveler: 'Karim BENNANI' },
    { id: 'c3', reference: 'VISA-2026-FELI01', organization_id: 'org-france-elite', traveler: 'Sophie DUPONT' },
  ];

  function filterCasesByTenant(cases, userRole, userOrgId) {
    if (userRole === 'SUPER_ADMIN') {
      return cases;
    }
    return cases.filter(c => c.organization_id === userOrgId);
  }

  test('Omrayanair est l unique SUPER_ADMIN et voit l ensemble des dossiers de la plateforme', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'SUPER_ADMIN', 'org-omrayanair');
    assert.equal(visibleCases.length, 3);
    assert.ok(visibleCases.some(c => c.organization_id === 'org-omrayanair'));
    assert.ok(visibleCases.some(c => c.organization_id === 'org-fabvoyage'));
    assert.ok(visibleCases.some(c => c.organization_id === 'org-france-elite'));
  });

  test('Le prestataire Fab Voyage ne voit QUE ses propres dossiers et pas ceux des autres prestataires', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'PRESTATAIRE', 'org-fabvoyage');
    assert.equal(visibleCases.length, 1);
    assert.equal(visibleCases[0].traveler, 'Karim BENNANI');
    assert.equal(visibleCases[0].organization_id, 'org-fabvoyage');
    assert.ok(!visibleCases.some(c => c.organization_id === 'org-france-elite'));
    assert.ok(!visibleCases.some(c => c.organization_id === 'org-omrayanair'));
  });

  test('Le prestataire France Elite ne voit QUE ses propres dossiers et pas ceux de Fab Voyage', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'PRESTATAIRE', 'org-france-elite');
    assert.equal(visibleCases.length, 1);
    assert.equal(visibleCases[0].traveler, 'Sophie DUPONT');
    assert.equal(visibleCases[0].organization_id, 'org-france-elite');
    assert.ok(!visibleCases.some(c => c.organization_id === 'org-fabvoyage'));
    assert.ok(!visibleCases.some(c => c.organization_id === 'org-omrayanair'));
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

  test('Suppression d un dossier : un prestataire ne peut supprimer que son propre dossier', () => {
    let cases = [
      { id: 'c1', organization_id: 'org-fabvoyage', traveler: 'Client 1' },
      { id: 'c2', organization_id: 'org-france-elite', traveler: 'Client 2' },
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

    // Fab Voyage tente de supprimer un dossier de France Elite => Refusé
    const resRefus = deleteCase('c2', 'PRESTATAIRE', 'org-fabvoyage');
    assert.equal(resRefus.success, false);
    assert.equal(cases.length, 2);

    // Fab Voyage supprime son propre dossier => Accepté
    const resOk = deleteCase('c1', 'PRESTATAIRE', 'org-fabvoyage');
    assert.equal(resOk.success, true);
    assert.equal(cases.length, 1);
    assert.equal(cases[0].id, 'c2');

    // Le Super Admin Omrayanair a le droit de modérer/supprimer tout dossier
    const resSuperAdmin = deleteCase('c2', 'SUPER_ADMIN', 'org-omrayanair');
    assert.equal(resSuperAdmin.success, true);
    assert.equal(cases.length, 0);
  });

  test('Modification d un dossier : mise à jour des champs avec succès', () => {
    let currentCase = {
      id: 'c1',
      organization_id: 'org-fabvoyage',
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

  test('Vérification authentification et rôles : Omrayanair SUPER_ADMIN, Fab Voyage PRESTATAIRE', () => {
    const configuredAccounts = [
      { username: 'omrayanair', password: 'Khouribga111*', organization_id: 'org-omrayanair', role: 'SUPER_ADMIN' },
      { username: 'fabvoyage', password: 'fab78200', organization_id: 'org-fabvoyage', role: 'PRESTATAIRE' },
      { username: 'France Elite', password: 'omrayanair', organization_id: 'org-france-elite', role: 'PRESTATAIRE' },
    ];

    function authenticateMock(identifier, password) {
      const cleanId = identifier.trim().toLowerCase();
      const match = configuredAccounts.find(a => a.username.toLowerCase() === cleanId);
      if (!match) return { success: false, error: 'Identifiant introuvable' };
      if (match.password !== password.trim()) return { success: false, error: 'Mot de passe incorrect' };
      return { success: true, session: match };
    }

    // Auth Omrayanair (Super Admin)
    const authOmra = authenticateMock('omrayanair', 'Khouribga111*');
    assert.equal(authOmra.success, true);
    assert.equal(authOmra.session.role, 'SUPER_ADMIN');

    // Auth Fab Voyage (Prestataire)
    const authFab = authenticateMock('fabvoyage', 'fab78200');
    assert.equal(authFab.success, true);
    assert.equal(authFab.session.organization_id, 'org-fabvoyage');
    assert.equal(authFab.session.role, 'PRESTATAIRE');

    // Auth France Elite (Prestataire)
    const authFranceElite = authenticateMock('France Elite', 'omrayanair');
    assert.equal(authFranceElite.success, true);
    assert.equal(authFranceElite.session.role, 'PRESTATAIRE');
  });

  test('Ajout d une nouvelle agence par le Super Admin avec octroi immédiat de login et mot de passe', () => {
    const customAccounts = [];
    const customOrgs = [];

    function createAgencyMock(data, session) {
      if (session.role !== 'SUPER_ADMIN') {
        return { success: false, error: 'Habilitation refusée' };
      }
      if (!data.name || !data.username || !data.password) {
        return { success: false, error: 'Champs requis manquants' };
      }
      const orgId = `org-${Date.now()}`;
      const org = { id: orgId, name: data.name, status: 'ACTIVE' };
      const account = {
        username: data.username.toLowerCase(),
        password: data.password,
        organization_id: orgId,
        role: data.role || 'AGENCY_ADMIN',
      };
      customOrgs.push(org);
      customAccounts.push(account);
      return { success: true, org, account };
    }

    const superAdminSession = { role: 'SUPER_ADMIN', username: 'omrayanair' };
    const res = createAgencyMock(
      {
        name: 'Al Madina Voyages',
        username: 'almadina',
        password: 'Password123*',
        role: 'AGENCY_ADMIN',
      },
      superAdminSession
    );

    assert.equal(res.success, true);
    assert.equal(res.account.username, 'almadina');
    assert.equal(res.account.password, 'Password123*');
    assert.equal(res.account.role, 'AGENCY_ADMIN');
    assert.equal(customOrgs.length, 1);

    // Test de tentative de création par un non-Super Admin (Prestataire) -> Doit être refusé
    const nonAdminRes = createAgencyMock(
      { name: 'Fraud Agency', username: 'fraud', password: '123' },
      { role: 'PRESTATAIRE', username: 'fabvoyage' }
    );
    assert.equal(nonAdminRes.success, false);
    assert.equal(nonAdminRes.error, 'Habilitation refusée');
  });
});

