'use client';

import { Shield, Sparkles, CheckCircle2, Clock, FileCheck, ArrowUpRight, Lock } from 'lucide-react';

export function HeroVisual() {
  return (
    <div className="relative mx-auto max-w-5xl rounded-2xl p-2 sm:p-4 bg-gradient-to-b from-slate-200/60 to-slate-300/40 border border-slate-300/80 shadow-2xl backdrop-blur-xl">
      {/* Top bar simulating browser / app frame */}
      <div className="rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
        <div className="bg-slate-900 px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="ml-3 text-xs text-slate-400 font-mono flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              app.visa-gestion.fr/dossiers/VISA-2026-00125
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium">
              Espace : Atlas Voyages
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        </div>

        {/* Dashboard inner preview */}
        <div className="p-4 sm:p-6 bg-slate-50 space-y-6">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  VISA-2026-00125
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" />
                  Visa Prêt au Téléchargement
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mt-1">
                Sarah Martin — Arabie Saoudite (Omra)
              </h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-700">Dossier n° 125/2026</span>
              <button className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                <FileCheck className="w-3.5 h-3.5" />
                Télécharger le visa officiel (PDF)
              </button>
            </div>
          </div>

          {/* Workflow step indicator */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 block">1. Reçu</span>
              <span className="text-[10px] text-emerald-600">Complet</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 block">2. Extraction IA</span>
              <span className="text-[10px] text-emerald-600">100% Validé</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-800 block">3. Consulat</span>
              <span className="text-[10px] text-emerald-600">Approuvé</span>
            </div>
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white shadow-sm text-xs font-bold">
              <span className="block">4. Délivré</span>
              <span className="text-[10px] text-emerald-100 font-normal">Disponible</span>
            </div>
          </div>

          {/* Two-column extraction demo card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Passport card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Extraction IA Passeport
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Précision 99%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Nom / Prénom</span>
                  <span className="font-semibold text-slate-800">MARTIN Sarah</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Passeport N°</span>
                  <span className="font-mono font-semibold text-slate-800">24AB12345</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Nationalité</span>
                  <span className="font-semibold text-slate-800">Française</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Expiration</span>
                  <span className="font-semibold text-slate-800">10/04/2032</span>
                </div>
              </div>
            </div>

            {/* Flight card */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-600" />
                  Extraction IA Billet / PNR
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Vols synchronisés
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Compagnie & PNR</span>
                  <span className="font-semibold text-slate-800">Saudia (SV8942)</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Itinéraire</span>
                  <span className="font-semibold text-slate-800">CDG ➔ JED</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Départ</span>
                  <span className="font-semibold text-slate-800">15/11/2026</span>
                </div>
                <div className="bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-700 block text-[10px]">Retour</span>
                  <span className="font-semibold text-slate-800">28/11/2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
