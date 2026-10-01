import { Organization, OrganizationMember, VisaCase, DemoRequest, AccountCredential } from '@/types';

// ORGANISATIONS RÉELLES VALIDÉES PAR L'UTILISATEUR
export const INITIAL_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-omrayanair',
    name: 'Omrayanair',
    legal_name: 'Omrayanair Voyages & Omra',
    email: 'contact@omrayanair.com',
    phone: '+33 1 40 00 00 00',
    country: 'France',
    address: 'Agence Omrayanair',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'org-france-elite',
    name: 'France Elite',
    legal_name: 'France Elite Visas & Traitement Consulaire',
    email: 'contact@france-elite.fr',
    phone: '+33 1 50 00 00 00',
    country: 'France',
    address: 'Centre Consulaire France Elite',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// COMPTES CONFIGURÉS PAR L'UTILISATEUR
export const CONFIGURED_ACCOUNTS: AccountCredential[] = [
  {
    user_id: 'user-omrayanair',
    username: 'omrayanair',
    email: 'omrayanair@visa-gestion.fr',
    name: 'Omrayanair (Agence)',
    role: 'AGENCY_ADMIN',
    organization_id: 'org-omrayanair',
    organization_name: 'Omrayanair',
    password: 'Khouribga111*',
  },
  {
    user_id: 'user-france-elite',
    username: 'France Elite',
    email: 'contact@france-elite.fr',
    name: 'France Elite (Prestataire Visas)',
    role: 'SUPER_ADMIN',
    organization_id: 'org-france-elite',
    organization_name: 'France Elite',
    password: 'omrayanair',
  },
];

export const INITIAL_MEMBERS: OrganizationMember[] = [
  {
    id: 'mem-omrayanair',
    organization_id: 'org-omrayanair',
    user_id: 'user-omrayanair',
    name: 'Omrayanair (Agence)',
    email: 'omrayanair@visa-gestion.fr',
    role: 'AGENCY_ADMIN',
    active: true,
    created_at: new Date().toISOString(),
  },
  {
    id: 'mem-france-elite',
    organization_id: 'org-france-elite',
    user_id: 'user-france-elite',
    name: 'France Elite (Prestataire Visas)',
    email: 'contact@france-elite.fr',
    role: 'SUPER_ADMIN',
    active: true,
    created_at: new Date().toISOString(),
  },
];

// BASE DE DOSSIERS VIERGE (0 dossier fictif - uniquement les vrais dossiers créés par l'utilisateur)
export const INITIAL_CASES: VisaCase[] = [];

export const INITIAL_DEMO_REQUESTS: DemoRequest[] = [];
