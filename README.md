# Visa Gestion — SaaS B2B pour Agences de Voyages

> **Plateforme SaaS B2B sécurisée permettant aux agences de voyages, agences Hajj/Omra et tour-opérateurs de centraliser leurs dossiers de visas, de bénéficier de l'extraction automatique par IA et de récupérer les visas finalisés depuis une interface dédiée.**

---

## 🌟 Proposition de Valeur
Visa Gestion remplace les échanges dispersés sur WhatsApp, les pièces d'identité éparpillées par email et les fichiers Excel par une infrastructure cloud hermétique, chiffrée et multi-tenant.

## 🚀 Fonctionnalités Clés
1. **Multi-Tenant Natif (RLS)** :
   - Isolation stricte par organisation (`organizations` & `organization_members`).
   - Aucune agence ne peut accéder aux voyageurs, documents ou volumes d'une autre agence.
2. **Matrice des Rôles (RBAC)** :
   - `SUPER_ADMIN` : Pilotage global, gestion des agences et supervision générale du flux.
   - `VISA_AGENT` : Traitement consulaire, vérification des pièces et délivrance du visa final.
   - `AGENCY_ADMIN` : Responsable de l'agence cliente (dépôt, suivi, gestion des conseillers).
   - `AGENCY_USER` : Conseiller voyage (dépôt et suivi de ses dossiers).
3. **Moteur d'Extraction IA** :
   - Analyse automatique des passeports (bande MRZ + visuel) et des billets d'avion (PNR, compagnie, dates).
   - Données 100% vérifiables et modifiables par l'humain avant soumission.
4. **Pipeline en 5 Étapes** :
   - `À vérifier` ➔ `Prêt à transmettre` ➔ `En traitement` ➔ `Visa prêt` ➔ `Terminé`.
5. **Vitrine B2B & Acquisition** :
   - Landing page commerciale (`/`), comparatif anti-WhatsApp, sections Fonctionnalités, Sécurité et Tarification.
   - Formulaire de demande de démo pour un onboarding qualifié.
   - Accès démo interactif avec switcher multi-rôles en 1 clic.

---

## 🛠️ Stack Technique
- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript (mode strict)
- **Styles** : Tailwind CSS
- **Icônes** : Lucide React
- **Base de données & Sécurité** : Supabase / PostgreSQL avec Row Level Security (RLS)
- **Tests automatisés** : Node.js Test Runner (`node:test`)
- **Déploiement** : Vercel

---

## 🧪 Tests Unitaires
Pour exécuter la suite de tests automatisée validant l'isolation multi-tenant :
```bash
npm test
```

## 🏗️ Build de Production
```bash
npm run build
```

## 🔐 Base de Données & Schéma RLS
Le schéma SQL complet avec toutes les règles RLS et fonctions helpers est disponible dans :
`supabase/schema.sql`
