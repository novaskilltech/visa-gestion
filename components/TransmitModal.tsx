'use client';

import { useState } from 'react';
import { Organization } from '@/types';
import { getWhatsAppTransmissionUrl } from '@/lib/whatsapp';
import { 
  Send, 
  X, 
  ShieldCheck, 
  Building, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare,
  ExternalLink,
  Phone
} from 'lucide-react';

interface TransmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTransmit: (providerId: string, providerName: string, notes: string) => void;
  providers: Organization[];
  caseId?: string;
  caseReference: string;
  travelerName: string;
  destinationCountry?: string;
  travelType?: string;
  currentProviderId?: string;
  documentsCount?: number;
}

export function TransmitModal({
  isOpen,
  onClose,
  onTransmit,
  providers,
  caseId,
  caseReference,
  travelerName,
  destinationCountry,
  travelType,
  currentProviderId,
  documentsCount = 0,
}: TransmitModalProps) {
  const [selectedProviderId, setSelectedProviderId] = useState<string>(
    currentProviderId || (providers[0]?.id || '')
  );
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [sendWhatsApp, setSendWhatsApp] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedProvider = providers.find((p) => p.id === selectedProviderId);

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

    // Si la case WhatsApp est cochée, ouvrir wa.me avec le numéro du prestataire et le message pré-rempli
    if (sendWhatsApp) {
      const whatsappUrl = getWhatsAppTransmissionUrl({
        phone: provider.phone,
        caseId,
        caseReference,
        travelerName,
        destinationCountry,
        travelType,
        documentsCount,
        notes,
        providerName: provider.name,
      });
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }

    setTimeout(() => {
      onTransmit(provider.id, provider.name, notes);
      setIsSubmitting(false);
      onClose();
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex justify-between items-start shrink-0">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-sky-400/30">
              <Send className="w-3 h-3" />
              <span>Transmission Consulaire</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              Transmettre le dossier à un prestataire
            </h2>
            <p className="text-xs text-slate-300">
              Assignation officielle, transfert des documents et notification WhatsApp.
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
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto">
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
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/60 shadow-xs ring-1 ring-brand-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                        }`}>
                          <Building className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-slate-900">{p.name}</p>
                            {p.phone && (
                              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-mono font-medium flex items-center gap-0.5">
                                <Phone className="w-2.5 h-2.5" />
                                {p.phone}
                              </span>
                            )}
                          </div>
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

          {/* Option WhatsApp Notification */}
          <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="send-whatsapp-check" className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  id="send-whatsapp-check"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Notifier par WhatsApp lors de la transmission
                </span>
              </label>
              {selectedProvider?.phone && (
                <span className="text-[11px] font-mono font-semibold text-emerald-800">
                  {selectedProvider.phone}
                </span>
              )}
            </div>
            {sendWhatsApp && (
              <p className="text-[11px] text-emerald-700 leading-relaxed pl-6">
                Un message WhatsApp pré-formaté avec la référence <strong>{caseReference}</strong>, l&apos;identité du voyageur, le nombre de pièces jointes et le lien sécurisé vers la plateforme sera automatiquement généré et ouvert pour <strong>{selectedProvider?.name || 'le prestataire'}</strong> ({selectedProvider?.phone || 'aucun numéro configuré'}).
              </p>
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
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 focus:border-transparent text-slate-900 resize-none"
            />
          </div>

          {/* Privacy & Isolation Notice */}
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-[11px] text-sky-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-sky-900">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600 shrink-0" />
              <span>Cloisonnement multi-tenant garanti</span>
            </div>
            <p className="text-sky-700 leading-relaxed">
              Une fois transmis, le dossier et ses pièces jointes seront visibles <strong>exclusivement par {selectedProvider?.name || 'le prestataire choisi'}</strong>. Les autres prestataires n&apos;y auront aucun accès.
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 hover:from-emerald-700 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all hover:scale-102 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>
                {isSubmitting 
                  ? 'Transmission...' 
                  : sendWhatsApp 
                  ? `Transmettre + Notifier WhatsApp (${selectedProvider?.name || 'Prestataire'})`
                  : `Confirmer la transmission à ${selectedProvider?.name || 'Prestataire'}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
