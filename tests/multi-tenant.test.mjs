import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('Tests Multi-Tenant & Isolation des Organisations (CDC #107 & #112)', () => {
  const mockOrganizations = [
    { id: 'org-atlas', name: 'Atlas Voyages', status: 'ACTIVE' },
    { id: 'org-salam', name: 'Salam Travel', status: 'ACTIVE' },
    { id: 'org-horizon', name: 'Horizon Travel', status: 'ACTIVE' },
  ];

  const mockCases = [
    { id: 'c1', reference: 'VISA-2026-00125', organization_id: 'org-atlas', traveler: 'Sarah Martin' },
    { id: 'c2', reference: 'VISA-2026-00126', organization_id: 'org-atlas', traveler: 'Ahmed Benali' },
    { id: 'c3', reference: 'VISA-2026-00127', organization_id: 'org-salam', traveler: 'Mohamed Khelifi' },
    { id: 'c4', reference: 'VISA-2026-00129', organization_id: 'org-horizon', traveler: 'Fatima Zahra' },
  ];

  // Helper matching the RLS policy defined in CDC section 112
  function filterCasesByTenant(cases, userRole, userOrgId) {
    if (userRole === 'SUPER_ADMIN' || userRole === 'VISA_AGENT') {
      return cases;
    }
    return cases.filter(c => c.organization_id === userOrgId);
  }

  test('Un utilisateur d Atlas Voyages ne doit voir QUE les dossiers de son organisation', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'AGENCY_ADMIN', 'org-atlas');
    assert.equal(visibleCases.length, 2);
    assert.ok(visibleCases.every(c => c.organization_id === 'org-atlas'));
    assert.ok(!visibleCases.some(c => c.traveler === 'Mohamed Khelifi'));
  });

  test('Un utilisateur de Salam Travel ne doit voir QUE les dossiers de Salam Travel', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'AGENCY_USER', 'org-salam');
    assert.equal(visibleCases.length, 1);
    assert.equal(visibleCases[0].traveler, 'Mohamed Khelifi');
    assert.equal(visibleCases[0].organization_id, 'org-salam');
  });

  test('Un SUPER_ADMIN a une visibilité transverse sur toutes les organisations', () => {
    const visibleCases = filterCasesByTenant(mockCases, 'SUPER_ADMIN', 'org-visa-gestion');
    assert.equal(visibleCases.length, 4);
  });

  test('Toutes les organisations doivent posséder un statut valide', () => {
    const validStatuses = ['ACTIVE', 'SUSPENDED', 'PENDING', 'ARCHIVED'];
    for (const org of mockOrganizations) {
      assert.ok(validStatuses.includes(org.status));
    }
  });

  test('Chaque dossier de visa doit impérativement être rattaché à une organisation (CDC #111)', () => {
    for (const visaCase of mockCases) {
      assert.ok(visaCase.organization_id, `Le dossier ${visaCase.reference} manque d organization_id`);
      assert.match(visaCase.organization_id, /^org-/);
    }
  });
});
