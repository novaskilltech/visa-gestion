'use client';

import { useState } from 'react';
import { submitDemoRequest } from '@/lib/store';
import { CheckCircle2, Send, AlertCircle, Sparkles } from 'lucide-react';

export function DemoForm() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    agency_name: '',
    professional_email: '',
    phone: '',
    country: 'France',
    monthly_volume: '20 à 50 visas / mois',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.first_name || !formData.last_name || !formData.agency_name || !formData.professional_email || !formData.phone) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    try {
      submitDemoRequest(formData);
      setSubmitted(true);
    } catch {
      setError("Une erreur est survenue lors de l'enregistrement de votre demande.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-emerald-100 text-center space-y-5 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-slate-900">Demande bien reçue !</h3>
          <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
            Merci <strong>{formData.first_name}</strong>. Un expert de l&apos;équipe Visa Gestion prendra contact avec l&apos;agence <strong>{formData.agency_name}</strong> sous 24h pour organiser votre démonstration privée et configurer votre espace sécurisé.
          </p>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 text-left space-y-1">
          <p className="font-semibold text-slate-700">Prochaines étapes de l&apos;onboarding :</p>
          <p>1. Échange téléphonique & qualification de vos flux consulaires</p>
          <p>2. Création de votre organisation et compte Administrateur Agence</p>
          <p>3. Envoi de votre invitation sécurisée pour votre premier dossier</p>
        </div>
        <button
          onClick={() => {
            setSubmitted(false);
            setFormData({
              first_name: '',
              last_name: '',
              agency_name: '',
              professional_email: '',
              phone: '',
              country: 'France',
              monthly_volume: '20 à 50 visas / mois',
              message: '',
            });
          }}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 underline"
        >
          Envoyer une autre demande
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-slate-200 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Accès Réservé Professionnels</span>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
          Demander une démonstration
        </h3>
        <p className="text-sm text-slate-500">
          Découvrez comment Visa Gestion élimine les relances WhatsApp et centralise vos visas.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Prénom *
          </label>
          <input
            type="text"
            required
            placeholder="Karim"
            value={formData.first_name}
            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nom *
          </label>
          <input
            type="text"
            required
            placeholder="Mansouri"
            value={formData.last_name}
            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Nom de l&apos;agence de voyages *
          </label>
          <input
            type="text"
            required
            placeholder="Atlas Voyages"
            value={formData.agency_name}
            onChange={(e) => setFormData({ ...formData, agency_name: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Email professionnel *
          </label>
          <input
            type="email"
            required
            placeholder="direction@atlas-voyages.fr"
            value={formData.professional_email}
            onChange={(e) => setFormData({ ...formData, professional_email: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Téléphone direct *
          </label>
          <input
            type="tel"
            required
            placeholder="+33 1 42 68 55 00"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Pays
          </label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-slate-900"
          >
            <option value="France">France</option>
            <option value="Belgique">Belgique</option>
            <option value="Suisse">Suisse</option>
            <option value="Maroc">Maroc</option>
            <option value="Tunisie">Tunisie</option>
            <option value="Algérie">Algérie</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Volume approximatif de visas traités / mois
        </label>
        <select
          value={formData.monthly_volume}
          onChange={(e) => setFormData({ ...formData, monthly_volume: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent bg-white text-slate-900"
        >
          <option value="Moins de 20 visas / mois">Moins de 20 visas / mois</option>
          <option value="20 à 50 visas / mois">20 à 50 visas / mois</option>
          <option value="50 à 150 visas / mois">50 à 150 visas / mois</option>
          <option value="Plus de 150 visas / mois">Plus de 150 visas / mois (Fort volume / Hajj)</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          Précisions sur vos destinations principales ou besoins
        </label>
        <textarea
          rows={3}
          placeholder="Ex: Nous traitons principalement des visas pour l'Arabie Saoudite (Omra), l'Ouzbékistan et la Chine..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-6 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md shadow-brand-600/30 hover:shadow-brand-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? 'Transmission en cours...' : 'Demander une démonstration'}</span>
      </button>

      <p className="text-center text-xs text-slate-500">
        Vos données sont strictement confidentielles et utilisées uniquement pour traiter votre demande professionnelle.
      </p>
    </form>
  );
}
