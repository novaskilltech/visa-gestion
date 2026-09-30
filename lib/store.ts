'use client';

import { 
  VisaCase, 
  Organization, 
  OrganizationMember, 
  UserSession, 
  CaseStatus, 
  DemoRequest 
} from '@/types';
import { 
  INITIAL_CASES, 
  INITIAL_ORGANIZATIONS, 
  INITIAL_MEMBERS, 
  INITIAL_DEMO_REQUESTS 
} from './mock-data';

const STORAGE_KEYS = {
  CASES: 'visa_gestion_cases',
  ORGS: 'visa_gestion_organizations',
  MEMBERS: 'visa_gestion_members',
  SESSION: 'visa_gestion_session',
  DEMOS: 'visa_gestion_demos',
};

export const AVAILABLE_DEMO_USERS: UserSession[] = [
  {
    user_id: 'user-admin-atlas',
    name: 'Karim Mansouri',
    email: 'karim@atlas-voyages.fr',
    role: 'AGENCY_ADMIN',
    organization_id: 'org-atlas',
    organization_name: 'Atlas Voyages',
  },
  {
    user_id: 'user-agent-atlas',
    name: 'Leila Cherif',
    email: 'leila@atlas-voyages.fr',
    role: 'AGENCY_USER',
    organization_id: 'org-atlas',
    organization_name: 'Atlas Voyages',
  },
  {
    user_id: 'user-admin-salam',
    name: 'Youssef El Amrani',
    email: 'youssef@salamtravel.fr',
    role: 'AGENCY_ADMIN',
    organization_id: 'org-salam',
    organization_name: 'Salam Travel (Hajj & Omra)',
  },
  {
    user_id: 'user-super-admin',
    name: 'Alexandre Dumas',
    email: 'admin@visa-gestion.fr',
    role: 'SUPER_ADMIN',
    organization_id: 'org-visa-gestion',
    organization_name: 'Visa Gestion (Opérateur)',
  },
  {
    user_id: 'user-visa-agent',
    name: 'Sophie Bernard',
    email: 'sophie@visa-gestion.fr',
    role: 'VISA_AGENT',
    organization_id: 'org-visa-gestion',
    organization_name: 'Visa Gestion (Opérateur)',
  },
];

// Helper to access localStorage safely on browser
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
  return getStored<UserSession>(STORAGE_KEYS.SESSION, AVAILABLE_DEMO_USERS[0]);
}

export function setCurrentSession(session: UserSession): void {
  setStored(STORAGE_KEYS.SESSION, session);
}

export function getAllOrganizations(): Organization[] {
  return getStored<Organization[]>(STORAGE_KEYS.ORGS, INITIAL_ORGANIZATIONS);
}

export function updateOrganizationStatus(orgId: string, status: Organization['status']): void {
  const orgs = getAllOrganizations();
  const updated = orgs.map(org => org.id === orgId ? { ...org, status, updated_at: new Date().toISOString() } : org);
  setStored(STORAGE_KEYS.ORGS, updated);
}

export function getAllMembers(): OrganizationMember[] {
  return getStored<OrganizationMember[]>(STORAGE_KEYS.MEMBERS, INITIAL_MEMBERS);
}

export function getCasesForSession(session: UserSession): VisaCase[] {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  
  // RÈGLE CDC MULTI-TENANT STRICTE :
  // Si SUPER_ADMIN ou VISA_AGENT : accès aux dossiers
  if (session.role === 'SUPER_ADMIN') {
    return allCases;
  }
  if (session.role === 'VISA_AGENT') {
    return allCases;
  }
  
  // Pour AGENCY_ADMIN et AGENCY_USER : stricte isolation par organization_id
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
  const nextNum = String(allCases.length + 125).padStart(5, '0');
  const reference = `VISA-2026-${nextNum}`;

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
