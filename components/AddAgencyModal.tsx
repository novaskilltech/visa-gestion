'use client';

import { useState } from 'react';
import { 
  Building, 
  X, 
  KeyRound, 
  User, 
  Mail, 
  Phone, 
  Globe, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Plus, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { UserSession, Organization } from '@/types';
import { createOrganizationWithAccount } from '@/lib/store';

interface AddAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newOrg: Organization) => void;
  session: UserSession;
}

export function AddAgencyModal({ isOpen, onClose, onCreated, session }: AddAgencyModalProps) {
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [role, setRole] = useState<'PRESTATAIRE' | 'AGENCY_ADMIN'>('AGENCY_ADMIN');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('France');
  const [address, setAddress] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    orgName: string;
    username: string;
    password: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    // Suggestion automatique d'identifiant en minuscules sans espaces
    if (!username || username === name.toLowerCase().replace(/[^a-z0-9]/g, '')) {
      setUsername(val.toLowerCase().replace(/[^a-z0-9]/g, ''));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Veuillez renseigner le nom de l\'agence.');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Veuillez définir un identifiant de connexion.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMsg('Le mot de passe doit comporter au moins 4 caractères.');
      return;
    }

    setIsLoading(true);

    try {
      const res = createOrganizationWithAccount(
        {
          name: name.trim(),
          legal_name: legalName.trim() || name.trim(),
          email: email.trim() || `${username.trim()}@visa-gestion.fr`,
          phone: phone.trim(),
          country: country.trim() || 'France',
          address: address.trim(),
          role: role,
          username: username.trim(),
          password: password.trim(),
        },
        session
      );

      if (!res.success || !res.organization || !res.account) {
        setErrorMsg(res.error || 'Erreur lors de la création.');
        setIsLoading(false);
        return;
      }

      setSuccessInfo({
        orgName: res.organization.name,
        username: res.account.username,
        password: res.account.password,
      });

      onCreated(res.organization);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur inattendue est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setName('');
    setLegalName('');
    setEmail('');
    setPhone('');
    setUsername('');
    setPassword('');
    setErrorMsg(null);
    setSuccessInfo(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Ajouter une Agence / Partenaire</h3>
              <p className="text-[11px] text-slate-400">Création du tenant et attribution des identifiants d&apos;accès</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetAndClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {successInfo ? (
            /* Écran de confirmation avec identifiants créés */
            <div className="space-y-4 py-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>Agence & Compte créés avec succès !</span>
                </div>
                <p className="text-xs text-emerald-700">
                  L&apos;agence <strong>{successInfo.orgName}</strong> peut désormais se connecter directement à la plateforme avec les identifiants ci-dessous :
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200 text-xs">
                  <span className="text-slate-500 font-sans font-medium">Identifiant (Login) :</span>
                  <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded border border-slate-300">
                    {successInfo.username}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-sans font-medium">Mot de passe :</span>
                  <span className="font-bold text-brand-700 bg-white px-2 py-1 rounded border border-slate-300">
                    {successInfo.password}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                💡 <strong>Transmission sécurisée :</strong> Vous pouvez communiquer ces accès à votre agence ou prestataire pour qu&apos;il se connecte sur <em>/login</em>.
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all"
              >
                Fermer et actualiser la liste
              </button>
            </div>
          ) : (
            /* Formulaire de création */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Bloc 1 : Informations Organisation */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <Building className="w-3.5 h-3.5 text-brand-600" />
                  <span>1. Informations de l&apos;Organisation</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Nom de l&apos;agence / enseigne *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Al Madina Voyages"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Type de structure
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as 'PRESTATAIRE' | 'AGENCY_ADMIN')}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-brand-500 text-slate-900 bg-white font-medium"
                    >
                      <option value="AGENCY_ADMIN">Agence de voyage cliente (B2B)</option>
                      <option value="PRESTATAIRE">Prestataire consulaire / Traitement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Téléphone / WhatsApp
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ex: +33 6 12 34 56 78"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Pays de résidence
                    </label>
                    <div className="relative">
                      <Globe className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ex: France, Maroc, Belgique..."
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloc 2 : Identifiants de connexion */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-100">
                  <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                  <span>2. Identifiants d&apos;Accès Plateforme</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Identifiant (Login / Username) *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Ex: almadina"
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                        required
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs font-mono lowercase text-slate-900 bg-white"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400">Sera utilisé pour se connecter</span>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Définir le mot de passe"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-8 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400">Min. 4 caractères</span>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">
                      Email de contact / administratif (optionnel)
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        placeholder="contact@agence.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center gap-1.5 transition-all hover:scale-102 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Création en cours...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Créer l&apos;agence & attribuer l&apos;accès</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
