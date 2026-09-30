export type UserRole = 'SUPER_ADMIN' | 'VISA_AGENT' | 'AGENCY_ADMIN' | 'AGENCY_USER';

export type OrganizationStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING' | 'ARCHIVED';

export interface Organization {
  id: string;
  name: string;
  legal_name?: string;
  email: string;
  phone?: string;
  country: string;
  address?: string;
  logo_url?: string;
  status: OrganizationStatus;
  created_at: string;
  updated_at: string;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  created_at: string;
}

export type CaseStatus = 
  | 'A_VERIFIER' 
  | 'PRET_A_TRANSMETTRE' 
  | 'EN_TRAITEMENT' 
  | 'VISA_PRET' 
  | 'TERMINE' 
  | 'REFUSE';

export type DocumentType = 
  | 'PASSEPORT' 
  | 'BILLET_AVION' 
  | 'PHOTO_IDENTITE' 
  | 'JUSTIFICATIF_HEBERGEMENT' 
  | 'VISA_FINAL' 
  | 'AUTRE';

export interface ExtractedPassportData {
  first_name: string;
  last_name: string;
  passport_number: string;
  nationality: string;
  birth_date: string;
  expiry_date: string;
  confidence: number;
}

export interface ExtractedFlightData {
  pnr: string;
  airline: string;
  flight_number: string;
  departure_date: string;
  return_date?: string;
  itinerary: string;
}

export interface CaseDocument {
  id: string;
  case_id: string;
  organization_id: string;
  type: DocumentType;
  file_name: string;
  file_url: string;
  file_size?: number;
  extracted_data?: ExtractedPassportData | ExtractedFlightData | Record<string, unknown>;
  created_at: string;
}

export interface VisaCase {
  id: string;
  reference: string;
  organization_id: string;
  organization_name?: string;
  traveler_first_name: string;
  traveler_last_name: string;
  traveler_passport_num?: string;
  traveler_nationality?: string;
  traveler_birth_date?: string;
  traveler_passport_expiry?: string;
  destination_country: string;
  travel_type: 'TOURISM' | 'BUSINESS' | 'OMRA_HAJJ' | 'FAMILY';
  departure_date?: string;
  return_date?: string;
  status: CaseStatus;
  flight_pnr?: string;
  flight_company?: string;
  flight_dates?: string;
  assigned_agent_id?: string;
  assigned_agent_name?: string;
  visa_document_url?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  documents?: CaseDocument[];
}

export interface DemoRequest {
  id: string;
  first_name: string;
  last_name: string;
  agency_name: string;
  professional_email: string;
  phone: string;
  country: string;
  monthly_volume: string;
  message?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'REJECTED';
  created_at: string;
}

export interface UserSession {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  organization_id: string;
  organization_name: string;
}
