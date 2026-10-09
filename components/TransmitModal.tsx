'use client';

import { useState } from 'react';
import { Organization } from '@/types';
import { Send, X, ShieldCheck, Building, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface TransmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransmit: (providerId: string, providerName: string, notes: string) => void;
  providers: Organization[];
  caseReference: string;
  travelerName: string;
  currentProviderId?: string;
  documentsCount?: number;
}

export function TransmitModal({
  isOpen,
  onClose,
  onTransmit,
  providers,
  caseReference,
  travelerName,
  currentProviderId,
  documentsCount = 0,
}: TransmitModalProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    currentProviderId || (providers[0]?.id || '')
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderId) {
      setError('Veuillez sélectionner un prestataire.');
      return;
    }
    const provider = providers.find((p) => p.id === selectedProviderId);
    if (!provider) {
      setError('Prestataire introuvable.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      onTransmit(provider.id, provider.name, notes);
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-start">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-sky-400/30">
              <Send className="w-3 h-3" />
              <span>Transmission Consulaire</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Transmettre le dossier à un prestataire
            </h2>
            <p className="text-xs text-slate-300">
              Assignation officielle et transfert des documents voyageurs.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dossier Summary Tag */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200 text-[11px]">
              {caseReference}
            </span>
            <span className="font-semibold text-slate-800">
              {travelerName}
            </span>
          </div>
          <span className="text-slate-500 text-[11px] flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {documentsCount} pièce(s) jointe(s) incluse(s)
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-2">
              Choisir le prestataire consulaire destinataire :
            </label>
            {providers.length === 0 ? (
              <p className="text-xs text-rose-600 italic">
                Aucun prestataire actif configuré sur la plateforme.
              </p>
            ) : (
              <div className="space-y-2">
                {providers.map((p) => {
                  const isSelected = selectedProviderId === p.id;
                  return (
                    <label
                      key={p.id}
                      onClick={() => setSelectedProviderId(p.id)}
                      className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 shadow-xs ring-1 ring-brand-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{p.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {p.legal_name || p.name} • {p.country}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-700 bg-brand-100/60 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                            Sélectionné
                          </span>
                        ) : (
                          <span className="text-[11px] font-medium text-slate-400">Choisir</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Note de transmission ou instructions (optionnel) :
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Traitement express souhaité, vérification biométrique requise pour le départ du 15/10..."
              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900 resize-none"
            />
          </div>

          {/* Privacy & Isolation Notice */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-900">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Cloisonnement multi-tenant garanti</span>
            </div>
            <p className="text-sky-700 leading-relaxed">
              Une fois transmis, le dossier et l&apos;intégralité de ses pièces jointes (passeport, billets) seront visibles <strong>exclusivement par {selectedProvider?.name || 'le prestataire choisi'}</strong>. Les autres prestataires n&apos;y auront aucun accès.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || providers.length === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition-all hover:scale-102 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Transmission...' : `Confirmer la transmission à ${selectedProvider?.name || 'Prestataire'}`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
