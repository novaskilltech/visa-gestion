import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { DemoForm } from '@/components/DemoForm';
import { Mail, Phone, MapPin, ShieldCheck, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 bg-slate-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left col : text & contact details */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                  Contact & Démonstration
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  Prêt à simplifier vos démarches consulaires ?
                </h1>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                  Remplissez le formulaire ci-contre pour planifier une démonstration de Visa Gestion avec un spécialiste visas.
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Email commercial</h4>
                    <p className="text-xs text-slate-500">contact@visa-gestion.fr</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Ligne directe agences</h4>
                    <p className="text-xs text-slate-500">+33 1 42 68 55 00 (Lun - Ven, 9h - 18h)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Siège social</h4>
                    <p className="text-xs text-slate-500">Paris, France</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Traitement garanti sous 24 heures
                </p>
                <p className="text-emerald-700">
                  Toute demande de démo formulée par une agence immatriculée au registre Atout France est prioritaire.
                </p>
              </div>
            </div>

            {/* Right col : Form */}
            <div className="lg:col-span-7">
              <DemoForm />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
