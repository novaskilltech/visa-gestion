-- ==============================================================================
-- VISA GESTION — SCHEMA SQL MULTI-TENANT & POLITIQUES RLS
-- Plateforme SaaS B2B pour Agences de Voyages et Formalités de Visas
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLE ORGANIZATIONS (Agences de voyages clientes)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    country VARCHAR(100) DEFAULT 'France',
    address TEXT,
    logo_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'PENDING', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TABLE ORGANIZATION_MEMBERS (Collaborateurs de l'agence)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'VISA_AGENT', 'AGENCY_ADMIN', 'AGENCY_USER')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_org_user UNIQUE (organization_id, user_id)
);

-- 4. TABLE VISA_CASES (Dossiers de visas)
CREATE TABLE IF NOT EXISTS visa_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(50) NOT NULL UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    traveler_first_name VARCHAR(100) NOT NULL,
    traveler_last_name VARCHAR(100) NOT NULL,
    traveler_passport_num VARCHAR(50),
    traveler_nationality VARCHAR(100),
    traveler_birth_date DATE,
    traveler_passport_expiry DATE,
    destination_country VARCHAR(100) NOT NULL,
    travel_type VARCHAR(50) DEFAULT 'TOURISM',
    departure_date DATE,
    return_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'A_VERIFIER' 
        CHECK (status IN ('A_VERIFIER', 'PRET_A_TRANSMETTRE', 'EN_TRAITEMENT', 'VISA_PRET', 'TERMINE', 'REFUSE')),
    flight_pnr VARCHAR(50),
    flight_company VARCHAR(100),
    flight_dates VARCHAR(100),
    assigned_agent_id UUID,
    visa_document_url TEXT,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. TABLE CASE_DOCUMENTS (Pièces justificatives & Visas finaux)
CREATE TABLE IF NOT EXISTS case_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES visa_cases(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('PASSEPORT', 'BILLET_AVION', 'PHOTO_IDENTITE', 'JUSTIFICATIF_HEBERGEMENT', 'VISA_FINAL', 'AUTRE')),
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER,
    extracted_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. TABLE DEMO_REQUESTS (Leads Landing Page)
CREATE TABLE IF NOT EXISTS demo_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    agency_name VARCHAR(255) NOT NULL,
    professional_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(100) NOT NULL,
    monthly_volume VARCHAR(100),
    message TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'REJECTED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. INDEXES POUR LA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_cases_org ON visa_cases(organization_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON visa_cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_ref ON visa_cases(reference);
CREATE INDEX IF NOT EXISTS idx_docs_case ON case_documents(case_id);

-- 8. FONCTIONS HELPER DE SÉCURITÉ RLS
CREATE OR REPLACE FUNCTION get_user_org_ids() 
RETURNS SETOF UUID AS $$
BEGIN
    RETURN QUERY
    SELECT organization_id 
    FROM organization_members 
    WHERE user_id = auth.uid() AND active = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin() 
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM organization_members 
        WHERE user_id = auth.uid() AND role = 'SUPER_ADMIN' AND active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. ACTIVATION RLS STRICTE
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE visa_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_requests ENABLE ROW LEVEL SECURITY;

-- 10. POLITIQUES RLS — ORGANIZATIONS
CREATE POLICY "Les membres peuvent lire leur propre organisation"
    ON organizations FOR SELECT
    USING (id IN (SELECT get_user_org_ids()) OR is_super_admin());

CREATE POLICY "Seul le SUPER_ADMIN peut modifier les organisations"
    ON organizations FOR ALL
    USING (is_super_admin());

-- 11. POLITIQUES RLS — ORGANIZATION_MEMBERS
CREATE POLICY "Les membres peuvent voir les utilisateurs de leur organisation"
    ON organization_members FOR SELECT
    USING (organization_id IN (SELECT get_user_org_ids()) OR is_super_admin());

-- 12. POLITIQUES RLS — VISA_CASES (ISOLATION ABSOLUE MULTI-TENANT)
CREATE POLICY "Lecture réservée à l'organisation ou SUPER_ADMIN / VISA_AGENT"
    ON visa_cases FOR SELECT
    USING (
        organization_id IN (SELECT get_user_org_ids()) 
        OR is_super_admin() 
        OR (assigned_agent_id = auth.uid())
    );

CREATE POLICY "Insertion réservée aux membres de l'organisation"
    ON visa_cases FOR INSERT
    WITH CHECK (organization_id IN (SELECT get_user_org_ids()) OR is_super_admin());

CREATE POLICY "Mise à jour réservée aux membres de l'organisation ou agents assignés"
    ON visa_cases FOR UPDATE
    USING (
        organization_id IN (SELECT get_user_org_ids()) 
        OR is_super_admin() 
        OR (assigned_agent_id = auth.uid())
    );

-- 13. POLITIQUES RLS — DEMO_REQUESTS
CREATE POLICY "Insertion publique des demandes de démo"
    ON demo_requests FOR INSERT
    WITH CHECK (TRUE);

CREATE POLICY "Lecture des démos réservée aux SUPER_ADMIN"
    ON demo_requests FOR SELECT
    USING (is_super_admin());
