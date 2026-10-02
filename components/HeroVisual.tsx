'use client';

import { Shield, Sparkles, CheckCircle2, Clock, FileCheck, ArrowUpRight, Lock, Plane, Bot } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl p-2 sm:p-4 bg-gradient-to-b from-slate-900/10 via-brand-600/5 to-sky-600/15 border border-sky-400/25 shadow-2xl backdrop-blur-xl">
      {/* Outer ambient glow */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-r from-sky-500/20 via-cyan-400/25 to-blue-600/20 blur-2xl pointer-events-none rounded-full"></div>

      {/* Top bar simulating browser / app frame */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-aero relative z-10">
        <div className="bg-slate-950 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-cyan-400" />
              visa-gestion.vercel.app/dossiers/VISA-2026-OMRA001
            </span>
          </div>
          <div className="flex items-center gap-2.5 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-900 text-sky-300 font-mono text-[11px] border border-sky-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Agence : Omrayanair
            </span>
          </div>
        </div>

        {/* Dashboard inner preview */}
        <div className="p-4 sm:p-6 bg-slate-50 aero-radial-glow space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="aero-pnr-badge text-xs">
                  VISA-2026-OMRA001
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300 shadow-2xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Visa Prêt (Délivré par France Elite)
                </span>
              </div>
              <h4 className="text-lg font-extrabold text-slate-900 mt-1">
                Youssef EL ALAMI — Arabie Saoudite (Omra & Hajj)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Télécharger le visa officiel (PDF)</span>
              </button>
            </div>
          </div>

          {/* Workflow step indicator (Aero-Tech laser track) */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
              <span className="font-bold text-slate-800 block">1. Pièces cumulées</span>
              <span className="text-[10px] text-emerald-600 font-semibold font-mono">Passeport + 2 Billets</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-sky-200 text-xs shadow-2xs">
              <span className="font-bold text-brand-700 block">2. Scanner OCR IA</span>
              <span className="text-[10px] text-sky-600 font-semibold font-mono">100% Extrait Réel</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-blue-200 text-xs shadow-2xs">
              <span className="font-bold text-blue-900 block">3. France Elite</span>
              <span className="text-[10px] text-blue-600 font-semibold font-mono">Traitement Consulat</span>
            </div>
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md text-xs font-bold">
              <span className="block">4. Visa Disponible</span>
              <span className="text-[10px] text-emerald-100 font-mono font-normal">Téléchargeable J-10</span>
            </div>
          </div>

          {/* Two-column extraction demo card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passport card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-aero-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Bot className="w-3.5 h-3.5 text-brand-600" />
                  Extraction OACI 9303 (Passeport)
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  MRZ Détectée
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Nom / Prénom</span>
                  <span className="font-bold text-slate-900">EL ALAMI Youssef</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">N° Passeport</span>
                  <span className="font-mono font-bold text-sky-800">24AB98142</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Nationalité</span>
                  <span className="font-semibold text-slate-800">Française</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Expiration</span>
                  <span className="font-mono font-semibold text-slate-800">18/09/2034</span>
                </div>
              </div>
            </div>

            {/* Flight card with split tickets */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-aero-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                  <Plane className="w-3.5 h-3.5 text-sky-600" />
                  Billets Séparés Détectés (Aller / Retour)
                </span>
                <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  2 PNR Distincts
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50/70 p-2 rounded-lg border border-blue-200">
                  <span className="text-blue-700 block text-[10px] font-bold">Vol Aller (Billet 1)</span>
                  <span className="font-bold text-slate-800">Saudia (SV142)</span>
                  <span className="font-mono text-[10px] text-blue-900 block">PNR: SV142</span>
                </div>
                <div className="bg-purple-50/70 p-2 rounded-lg border border-purple-200">
                  <span className="text-purple-700 block text-[10px] font-bold">Vol Retour (Billet 2)</span>
                  <span className="font-bold text-slate-800">EgyptAir (MS892)</span>
                  <span className="font-mono text-[10px] text-purple-900 block">PNR: MS892</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Date de départ</span>
                  <span className="font-mono font-semibold text-slate-800">20/11/2026</span>
                </div>
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-500 block text-[10px]">Date de retour</span>
                  <span className="font-mono font-semibold text-slate-800">05/12/2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
