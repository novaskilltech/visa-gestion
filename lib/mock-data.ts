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

// NOUVELLE BASE DE DOSSIERS PROPRE POUR OMRAYANAIR
export const INITIAL_CASES: VisaCase[] = [
  {
    id: 'case-omra-1',
    reference: 'VISA-2026-OMRA01',
    organization_id: 'org-omrayanair',
    organization_name: 'Omrayanair',
    traveler_first_name: 'Youssef',
    traveler_last_name: 'EL ALAMI',
    traveler_passport_num: '26FR77889',
    traveler_nationality: 'Française',
    traveler_birth_date: '1985-05-12',
    traveler_passport_expiry: '2031-09-20',
    destination_country: 'Arabie Saoudite',
    travel_type: 'OMRA_HAJJ',
    departure_date: '2026-11-15',
    return_date: '2026-11-29',
    status: 'PRET_A_TRANSMETTRE',
    flight_pnr: 'SV142',
    flight_company: 'Saudia Airlines',
    notes: 'Dossier Omra transmis par l agence Omrayanair. En attente de traitement par le prestataire France Elite.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    documents: [
      {
        id: 'doc-omra-1',
        case_id: 'case-omra-1',
        organization_id: 'org-omrayanair',
        type: 'PASSEPORT',
        file_name: 'passeport_el_alami_youssef.pdf',
        file_url: '/mock-documents/passeport.pdf',
        created_at: new Date().toISOString(),
      },
    ],
  },
];

export const INITIAL_DEMO_REQUESTS: DemoRequest[] = [];
