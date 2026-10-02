"use client";

import React from "react";
import {
  X,
  Database,
  Eye,
  EyeOff,
  Globe,
  Languages,
  BookOpen,
  Sparkles,
  Check,
} from "lucide-react";
import { SignLanguage } from "../lib/signLibrary";

export type UIAppLanguage = "tr" | "en" | "de" | "it";

interface SettingsMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  showSkeleton: boolean;
  onToggleSkeleton: () => void;
  onOpenDatasetStudio: () => void;
  onOpenLibrary: () => void;
  activeSignLanguage: SignLanguage;
  onSelectSignLanguage: (lang: SignLanguage) => void;
  uiLanguage: UIAppLanguage;
  onSelectUiLanguage: (lang: UIAppLanguage) => void;
  isCustomModelActive?: boolean;
}

const UI_LANGUAGES: { code: UIAppLanguage; label: string; flag: string }[] = [
  { code: "tr", label: "Türkçe", flag: "🇹🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
];

export const SettingsMenuModal: React.FC<SettingsMenuModalProps> = ({
  isOpen,
  onClose,
  showSkeleton,
  onToggleSkeleton,
  onOpenDatasetStudio,
  onOpenLibrary,
  activeSignLanguage,
  onSelectSignLanguage,
  uiLanguage,
  onSelectUiLanguage,
  isCustomModelActive = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-2xl border border-white/15 rounded-t-3xl sm:rounded-3xl p-6 text-white shadow-2xl space-y-5 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-white/10 border border-white/15 text-sky-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Uygulama Menüsü</h3>
              <p className="text-xs text-slate-400">Ayarlar & Görsel Modeller</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
            title="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Dataset Studio Action */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Veri Seti & Eğitim
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenDatasetStudio();
            }}
            className="w-full p-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-between transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-400/30">
                <Database className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold text-white block">Dataset Studio</span>
                <span className="text-xs text-slate-300">Kendi işaret modelinizi eğitin</span>
              </div>
            </div>
            {isCustomModelActive && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Aktif
              </span>
            )}
          </button>
        </div>

        {/* 2. Skeleton Toggle */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Görsel İskelet (MediaPipe Hand Mesh)
          </span>
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30">
                {showSkeleton ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-sm font-bold text-white block">El İskelet Çizimi</span>
                <span className="text-xs text-slate-300">21 eklem noktasını ekranda göster</span>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={onToggleSkeleton}
              className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${
                showSkeleton ? "bg-sky-500" : "bg-slate-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  showSkeleton ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* 3. Sign Alphabet & UI Language Options */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Arayüz Dili (UI Language)
          </span>
          <div className="grid grid-cols-2 gap-2">
            {UI_LANGUAGES.map((lang) => {
              const isSelected = uiLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => onSelectUiLanguage(lang.code)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-between transition-all ${
                    isSelected
                      ? "bg-sky-500/20 border-sky-400 text-sky-300 shadow-md"
                      : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <span>{lang.label}</span>
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Alphabet Library Access */}
        <div className="pt-2">
          <button
            onClick={() => {
              onClose();
              onOpenLibrary();
            }}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
          >
            <Languages className="w-4 h-4" />
            TİD & ASL El Harfleri Kütüphanesi
          </button>
        </div>
      </div>
    </div>
  );
};
