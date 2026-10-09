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
import { supabase } from './supabase';

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

// -------------------------------------------------------------
// SYNCHRONISATION SUPABASE EN BACKGROUND (FIRE-AND-FORGET)
// -------------------------------------------------------------
async function syncCaseToSupabase(c: VisaCase) {
  try {
    await supabase.from('visa_cases').upsert({
      id: c.id,
      reference: c.reference,
      organization_id: c.organization_id,
      organization_name: c.organization_name,
      traveler_first_name: c.traveler_first_name,
      traveler_last_name: c.traveler_last_name,
      traveler_passport_num: c.traveler_passport_num,
      traveler_nationality: c.traveler_nationality,
      traveler_birth_date: c.traveler_birth_date,
      traveler_passport_expiry: c.traveler_passport_expiry,
      destination_country: c.destination_country,
      travel_type: c.travel_type,
      departure_date: c.departure_date,
      return_date: c.return_date,
      status: c.status,
      flight_pnr: c.flight_pnr,
      flight_company: c.flight_company,
      has_separate_tickets: c.has_separate_tickets,
      return_flight_pnr: c.return_flight_pnr,
      return_flight_company: c.return_flight_company,
      flight_dates: c.flight_dates,
      assigned_agent_id: c.assigned_agent_id,
      assigned_agent_name: c.assigned_agent_name,
      assigned_provider_id: c.assigned_provider_id,
      assigned_provider_name: c.assigned_provider_name,
      transmitted_at: c.transmitted_at,
      visa_document_url: c.visa_document_url,
      notes: c.notes,
      created_by: c.created_by,
      created_at: c.created_at,
      updated_at: c.updated_at,
      documents: c.documents || [],
    });
  } catch (err) {
    console.error('Supabase sync error:', err);
  }
}

async function deleteCaseFromSupabase(caseId: string) {
  try {
    await supabase.from('visa_cases').delete().eq('id', caseId);
  } catch (err) {
    console.error('Supabase delete error:', err);
  }
}

/**
 * Récupère tous les dossiers depuis Supabase et fusionne avec le localStorage
 */
export async function syncCasesWithCloud(): Promise<VisaCase[]> {
  try {
    const { data, error } = await supabase.from('visa_cases').select('*');
    if (!error && Array.isArray(data)) {
      const localCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, []);
      
      // Fusion intelligente par date de mise à jour (updated_at)
      const mergedMap = new Map<string, VisaCase>();
      for (const lc of localCases) {
        mergedMap.set(lc.id, lc);
      }
      for (const rc of data) {
        const local = mergedMap.get(rc.id);
        if (!local || new Date(rc.updated_at) >= new Date(local.updated_at)) {
          mergedMap.set(rc.id, rc as VisaCase);
        }
      }

      const allMerged = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setStored(STORAGE_KEYS.CASES, allMerged);
      return allMerged;
    }
  } catch (err) {
    console.error('Cloud sync error:', err);
  }
  return getStored<VisaCase[]>(STORAGE_KEYS.CASES, []);
}

// -------------------------------------------------------------
// SESSIONS & ORGANISATIONS
// -------------------------------------------------------------
export function getCurrentSession(): UserSession {
  const session = getStored<UserSession | null>(STORAGE_KEYS.SESSION, null);
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
  const updated = stored.map(storedOrg => {
    const initOrg = INITIAL_ORGANIZATIONS.find(o => o.id === storedOrg.id);
    if (initOrg && initOrg.phone && storedOrg.phone !== initOrg.phone) {
      return { ...storedOrg, phone: initOrg.phone };
    }
    return storedOrg;
  });
  const missing = INITIAL_ORGANIZATIONS.filter(initOrg => !updated.some(o => o.id === initOrg.id));
  if (missing.length > 0 || JSON.stringify(updated) !== JSON.stringify(stored)) {
    const merged = [...updated, ...missing];
    setStored(STORAGE_KEYS.ORGS, merged);
    return merged;
  }
  return updated;
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

// -------------------------------------------------------------
// DOSSIERS DE VISAS (AVEC PERSISTANCE SUPABASE CLOUD AUTOMATIQUE)
// -------------------------------------------------------------
export function getCasesForSession(session: UserSession): VisaCase[] {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  
  if (session.role === 'SUPER_ADMIN') {
    return allCases;
  }
  
  return allCases.filter(c => 
    c.organization_id === session.organization_id || 
    c.assigned_provider_id === session.organization_id
  );
}

export function getAvailablePrestataires(): Organization[] {
  const orgs = getAllOrganizations();
  return orgs.filter(o => o.id !== 'org-omrayanair' && o.status === 'ACTIVE');
}

export function transmitCaseToProvider(
  caseId: string,
  providerId: string,
  providerName: string,
  notes?: string,
  session?: UserSession
): VisaCase | null {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const target = allCases.find(c => c.id === caseId);
  if (!target) return null;

  if (session && session.role !== 'SUPER_ADMIN') {
    return null;
  }

  const transmitNote = notes?.trim()
    ? `[Transmission à ${providerName} le ${new Date().toLocaleDateString('fr-FR')}]: ${notes.trim()}`
    : `[Transmis au prestataire ${providerName} le ${new Date().toLocaleDateString('fr-FR')}]`;

  const updated: VisaCase = {
    ...target,
    assigned_provider_id: providerId,
    assigned_provider_name: providerName,
    transmitted_at: new Date().toISOString(),
    status: 'EN_TRAITEMENT',
    notes: target.notes ? `${target.notes}\n${transmitNote}` : transmitNote,
    updated_at: new Date().toISOString(),
  };

  const newCases = allCases.map(c => (c.id === caseId ? updated : c));
  setStored(STORAGE_KEYS.CASES, newCases);
  syncCaseToSupabase(updated); // Synchronisation instantanée Supabase
  return updated;
}

export function getCaseById(caseId: string, session: UserSession): VisaCase | null {
  const cases = getCasesForSession(session);
  return cases.find(c => c.id === caseId) || null;
}

export async function fetchCaseByIdAsync(caseId: string, session: UserSession): Promise<VisaCase | null> {
  // Vérifie d'abord localement
  let found = getCaseById(caseId, session);
  if (found) return found;

  // Si pas présent localement, chercher dans Supabase
  try {
    const { data, error } = await supabase.from('visa_cases').select('*').eq('id', caseId).maybeSingle();
    if (!error && data) {
      const c = data as VisaCase;
      // Contrôle de permission multi-tenant
      const hasAccess = session.role === 'SUPER_ADMIN' || 
        c.organization_id === session.organization_id || 
        c.assigned_provider_id === session.organization_id;
      
      if (hasAccess) {
        // Enregistrer localement pour les futurs accès
        const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
        if (!allCases.some(x => x.id === c.id)) {
          setStored(STORAGE_KEYS.CASES, [c, ...allCases]);
        }
        return c;
      }
    }
  } catch (err) {
    console.error('fetchCaseByIdAsync error:', err);
  }
  return null;
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
  syncCaseToSupabase(created); // Synchronisation instantanée Supabase
  return created;
}

export function updateCaseStatus(caseId: string, status: CaseStatus): void {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  let updatedTarget: VisaCase | null = null;
  const updated = allCases.map(c => {
    if (c.id === caseId) {
      updatedTarget = { ...c, status, updated_at: new Date().toISOString() };
      return updatedTarget;
    }
    return c;
  });
  setStored(STORAGE_KEYS.CASES, updated);
  if (updatedTarget) syncCaseToSupabase(updatedTarget);
}

export function updateVisaCase(
  caseId: string,
  updatedData: Partial<Omit<VisaCase, 'id' | 'reference' | 'created_at'>>,
  session: UserSession
): VisaCase | null {
  const allCases = getStored<VisaCase[]>(STORAGE_KEYS.CASES, INITIAL_CASES);
  const target = allCases.find(c => c.id === caseId);
  if (!target) return null;

  const canEdit = session.role === 'SUPER_ADMIN' || 
    target.organization_id === session.organization_id ||
    target.assigned_provider_id === session.organization_id;
  if (!canEdit) return null;

  const updated: VisaCase = {
    ...target,
    ...updatedData,
    updated_at: new Date().toISOString(),
  };

  const newCases = allCases.map(c => (c.id === caseId ? updated : c));
  setStored(STORAGE_KEYS.CASES, newCases);
  syncCaseToSupabase(updated); // Synchronisation instantanée Supabase
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

  const canDelete = session.role === 'SUPER_ADMIN' || target.organization_id === session.organization_id;
  if (!canDelete) {
    return { success: false, error: 'Accès refusé : vous n\'avez pas les droits pour supprimer ce dossier.' };
  }

  const remaining = allCases.filter(c => c.id !== caseId);
  setStored(STORAGE_KEYS.CASES, remaining);
  deleteCaseFromSupabase(caseId); // Suppression sur Supabase
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

  const canEdit = session.role === 'SUPER_ADMIN' || 
    target.organization_id === session.organization_id ||
    target.assigned_provider_id === session.organization_id;
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
  syncCaseToSupabase(updated); // Synchronisation instantanée Supabase
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

  const canEdit = session.role === 'SUPER_ADMIN' || 
    target.organization_id === session.organization_id ||
    target.assigned_provider_id === session.organization_id;
  if (!canEdit) return null;

  const updated: VisaCase = {
    ...target,
    documents: (target.documents || []).filter(d => d.id !== docId),
    updated_at: new Date().toISOString(),
  };

  const newCases = allCases.map(c => (c.id === caseId ? updated : c));
  setStored(STORAGE_KEYS.CASES, newCases);
  syncCaseToSupabase(updated); // Synchronisation instantanée Supabase
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
