'use client';

import { 
  VisaCase, 
  Organization, 
  OrganizationMember, 
  UserSession, 
  CaseStatus, 
  DemoRequest,
  AccountCredential,
  CaseDocument 
} from '@/types';
import { 
  INITIAL_CASES, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_MEMBERS, 
  INITIAL_DEMO_REQUESTS,
  CONFIGURED_ACCOUNTS 
} from './mock-data';

// Clés v3 : suppression de tous les dossiers fictifs, démarrage vierge
const STORAGE_KEYS = {
  CASES: 'visa_gestion_v3_cases',
  ORGS: 'visa_gestion_v3_organizations',
  MEMBERS: 'visa_gestion_v3_members',
  SESSION: 'visa_gestion_v3_session',
  DEMOS: 'visa_gestion_v3_demos',
};

export const AVAILABLE_ACCOUNTS: AccountCredential[] = CONFIGURED_ACCOUNTS;

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
}

export function getCurrentSession(): UserSession {
  const session = getStored<UserSession | null>(STORAGE_KEYS.SESSION, null);
  // Si pas de session ou si ancienne session avec comptes supprimés (Atlas/Salam)
  if (!session || !AVAILABLE_ACCOUNTS.some(a => a.organization_id === session.organization_id)) {
    const defaultAccount = AVAILABLE_ACCOUNTS[0]; // Omrayanair
    setCurrentSession(defaultAccount);
    return defaultAccount;
  }
  const matchingConfigured = AVAILABLE_ACCOUNTS.find(a => a.user_id === session.user_id);
  if (matchingConfigured && (matchingConfigured.role !== session.role || matchingConfigured.name !== session.name)) {
    const updatedSession = { ...session, role: matchingConfigured.role, name: matchingConfigured.name };
    setCurrentSession(updatedSession);
    return updatedSession;
  }
  return session;
}

export function setCurrentSession(session: UserSession): void {
  setStored(STORAGE_KEYS.SESSION, session);
}

export function authenticate(identifier: string, password: string): { success: boolean; session?: UserSession; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  // Recherche du compte correspondant
  for (const account of AVAILABLE_ACCOUNTS) {
    const matchUser = 
      account.username.toLowerCase() === cleanId ||
      account.email.toLowerCase() === cleanId ||
      (account.organization_name.toLowerCase() === cleanId) ||
      (account.user_id === 'user-france-elite' && (cleanId === 'france-elite' || cleanId === 'france elite' || cleanId === 'franceelite')) ||
      (account.user_id === 'user-fabvoyage' && (cleanId === 'fabvoyage' || cleanId === 'fab voyage' || cleanId === 'fab-voyage'));

    if (matchUser) {
      if (account.password === cleanPass) {
        setCurrentSession(account);
        return { success: true, session: account };
      } else {
        return { success: false, error: 'Mot de passe incorrect.' };
      }
    }
  }

  return { success: false, error: 'Identifiant introuvable. Veuillez vérifier vos identifiants de connexion.' };
}

export function getAllOrganizations(): Organization[] {
  const stored = getStored<Organization[]>(STORAGE_KEYS.ORGS, INITIAL_ORGANIZATIONS);
  const missing = INITIAL_ORGANIZATIONS.filter(initOrg => !stored.some(o => o.id === initOrg.id));
  if (missing.length > 0) {
    const merged = [...stored, ...missing];
    setStored(STORAGE_KEYS.ORGS, merged);
    return merged;
  }
  return stored;
}

export function updateOrganizationStatus(orgId: string, status: Organization['status']): void {
  const orgs = getAllOrganizations();
  const updated = orgs.map(org => org.id === orgId ? { ...org, status, updated_at: new Date().toISOString() } : org);
  setStored(STORAGE_KEYS.ORGS, updated);
}

export function getAllMembers(): OrganizationMember[] {
  const stored = getStored<OrganizationMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
  const updated = stored.map(storedMem => {
    const initMem = INITIAL_MEMBERS.find(m => m.id === storedMem.id);
    if (initMem && (initMem.role !== storedMem.role || initMem.name !== storedMem.name)) {
      return { ...storedMem, role: initMem.role, name: initMem.name };
    }
    return storedMem;
  });
  const missing = INITIAL_MEMBERS.filter(initMem => !updated.some(m => m.id === initMem.id));
  if (missing.length > 0 || JSON.stringify(updated) !== JSON.stringify(stored)) {
    const merged = [...updated, ...missing];
    setStored(STORAGE_KEYS.MEMBERS, merged);
    return merged;
  }
  return updated;
}

export function getCasesForSession(session: UserSession): VisaCase[] {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  
  // SEUL LE SUPER ADMIN (Omrayanair) voit l'ensemble des dossiers de la plateforme
  if (session.role === 'SUPER_ADMIN') {
    return allCases;
  }
  
  // Les prestataires et agences ne voient STRICTEMENT que les dossiers de leur propre organisation
  return allCases.filter(c => c.organization_id === session.organization_id);
}

export function getCaseById(caseId: string, session: UserSession): VisaCase | null {
  const cases = getCasesForSession(session);
  return cases.find(c => c.id === caseId) || null;
}

export function createVisaCase(
  newCaseData: Omit<VisaCase, 'id' | 'reference' | 'created_at' | 'updated_at'>,
  session: UserSession
): VisaCase {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const nextNum = String(allCases.length + 1).padStart(3, '0');
  const orgCode = session.organization_name ? session.organization_name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase() : 'VISA';
  const reference = `VISA-2026-${orgCode}${nextNum}`;

  const created: VisaCase = {
    ...newCaseData,
    id: `case-${Date.now()}`,
    reference,
    organization_id: session.organization_id,
    organization_name: session.organization_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const updated = [created, ...allCases];
  setStored(STORAGE_KEYS.CASES, updated);
  return created;
}

export function updateCaseStatus(caseId: string, status: CaseStatus): void {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const updated = allCases.map(c => {
    if (c.id === caseId) {
      return { ...c, status, updated_at: new Date().toISOString() };
    }
    return c;
  });
  setStored(STORAGE_KEYS.CASES, updated);
}

export function updateVisaCase(
  caseId: string,
  updatedData: Partial<Omit<VisaCase, 'id' | 'reference' | 'created_at'>>,
  session: UserSession
): VisaCase | null {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const target = allCases.find(c => c.id === caseId);
  if (!target) return null;

  // Contrôle d'autorisation multi-tenant (Organisation propriétaire ou Super Admin Omrayanair)
  const canEdit = session.role === 'SUPER_ADMIN' || target.organization_id === session.organization_id;
  if (!canEdit) return null;

  const updated: VisaCase = {
    ...target,
    ...updatedData,
    updated_at: new Date().toISOString(),
  };

  const newCases = allCases.map(c => (c.id === caseId ? updated : c));
  setStored(STORAGE_KEYS.CASES, newCases);
  return updated;
}

export function deleteVisaCase(
  caseId: string,
  session: UserSession
): { success: boolean; error?: string } {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const target = allCases.find(c => c.id === caseId);
  if (!target) {
    return { success: false, error: 'Dossier introuvable.' };
  }

  // Contrôle d'autorisation multi-tenant (Organisation propriétaire ou Super Admin Omrayanair)
  const canDelete = session.role === 'SUPER_ADMIN' || target.organization_id === session.organization_id;
  if (!canDelete) {
    return { success: false, error: 'Accès refusé : vous n\'avez pas les droits pour supprimer ce dossier.' };
  }

  const remaining = allCases.filter(c => c.id !== caseId);
  setStored(STORAGE_KEYS.CASES, remaining);
  return { success: true };
}

export function addDocumentToCase(
  caseId: string,
  docData: Omit<CaseDocument, 'id' | 'case_id' | 'organization_id' | 'created_at'>,
  session: UserSession
): VisaCase | null {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const target = allCases.find(c => c.id === caseId);
  if (!target) return null;

  // Contrôle d'autorisation multi-tenant
  const canEdit = session.role === 'SUPER_ADMIN' || target.organization_id === session.organization_id;
  if (!canEdit) return null;

  const newDoc: CaseDocument = {
    ...docData,
    id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    case_id: caseId,
    organization_id: target.organization_id,
    created_at: new Date().toISOString(),
  };

  const updated: VisaCase = {
    ...target,
    documents: [...(target.documents || []), newDoc],
    updated_at: new Date().toISOString(),
  };

  const newCases = allCases.map(c => (c.id === caseId ? updated : c));
  setStored(STORAGE_KEYS.CASES, newCases);
  return updated;
}

export function removeDocumentFromCase(
  caseId: string,
  docId: string,
  session: UserSession
): VisaCase | null {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const target = allCases.find(c => c.id === caseId);
  if (!target) return null;

  const canEdit = session.role === 'SUPER_ADMIN' || target.organization_id === session.organization_id;
  if (!canEdit) return null;

  const updated: VisaCase = {
    ...target,
    documents: (target.documents || []).filter(d => d.id !== docId),
    updated_at: new Date().toISOString(),
  };

  const newCases = allCases.map(c => (c.id === caseId ? updated : c));
  setStored(STORAGE_KEYS.CASES, newCases);
  return updated;
}

export function getDashboardStats(session: UserSession) {
  const cases = getCasesForSession(session);
  
  return {
    total: cases.length,
    a_verifier: cases.filter(c => c.status === 'A_VERIFIER').length,
    pret_transmettre: cases.filter(c => c.status === 'PRET_A_TRANSMETTRE').length,
    en_traitement: cases.filter(c => c.status === 'EN_TRAITEMENT').length,
    visa_pret: cases.filter(c => c.status === 'VISA_PRET').length,
    termine: cases.filter(c => c.status === 'TERMINE').length,
  };
}

export function submitDemoRequest(
  data: Omit<DemoRequest, 'id' | 'status' | 'created_at'>
): DemoRequest {
  const current = getStored<DemoRequest[]>(STORAGE_KEYS.DEMOS, INITIAL_DEMO_REQUESTS);
  const newReq: DemoRequest = {
    ...data,
    id: `demo-${Date.now()}`,
    status: 'NEW',
    created_at: new Date().toISOString(),
  };
  setStored(STORAGE_KEYS.DEMOS, [newReq, ...current]);
  return newReq;
}

export function getDemoRequests(): DemoRequest[] {
  return getStored<DemoRequest[]>(STORAGE_KEYS.DEMOS, INITIAL_DEMO_REQUESTS);
}
