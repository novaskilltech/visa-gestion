import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://visa-gestion.vercel.app'),
  title: {
    default: 'Visa Gestion — La plateforme de gestion des visas pour les professionnels du voyage',
    template: '%s | Visa Gestion',
  },
  description: 'Plateforme SaaS B2B sécurisée permettant aux agences de voyages et professionnels du Hajj & Omra de centraliser leurs dossiers, extraire les pièces d\'identité par IA et récupérer les visas consulaires.',
  keywords: [
    'visa',
    'gestion visa',
    'saas b2b',
    'agences de voyage',
    'hajj omra',
    'formalités consulaires',
    'saudia',
    'pnr',
    'ocr passeport',
    'traitement visa',
  ],
  authors: [{ name: 'Visa Gestion SAS' }],
  creator: 'Visa Gestion SAS',
  publisher: 'Visa Gestion SAS',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://visa-gestion.vercel.app',
    siteName: 'Visa Gestion',
    title: 'Visa Gestion — La gestion des visas, enfin centralisée pour les agences',
    description: 'Fini le chaos WhatsApp. Centralisez vos dossiers de visas, profitez de l\'extraction automatique par IA et suivez l\'état consulaire en temps réel.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Visa Gestion — Plateforme SaaS B2B pour Agences de Voyages et Formalités Consulaires',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Visa Gestion — SaaS B2B Visas & Agences de Voyage',
    description: 'Centralisez les demandes de visas et documents de vos voyageurs en toute sécurité.',
    images: ['/twitter-image.jpg'],
    creator: '@VisaGestion',
  },
  robots: {
    index: true,
    follow: true,
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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
