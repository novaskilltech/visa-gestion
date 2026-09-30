import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Visa Gestion — La plateforme de gestion des visas pour les professionnels du voyage',
  description: 'Centralisez vos demandes de visas, transmettez les documents de vos voyageurs et récupérez les visas terminés depuis une interface professionnelle et sécurisée.',
  keywords: ['visa', 'gestion visa', 'saas b2b', 'agences de voyage', 'hajj omra', 'tourisme', 'formalités consulaires'],
  openGraph: {
    title: 'Visa Gestion — La gestion des visas, enfin centralisée',
    description: 'Centralisez les documents, suivez les dossiers et récupérez les visas depuis une interface sécurisée.',
    url: 'https://domaine-visa-gestion.fr',
    siteName: 'Visa Gestion',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa Gestion — SaaS B2B Visas',
    description: 'Centralisez les demandes de visas et documents de vos voyageurs.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
