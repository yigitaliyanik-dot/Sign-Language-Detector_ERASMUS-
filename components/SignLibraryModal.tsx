"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  BookOpen,
  Volume2,
  Sparkles,
  Layers,
  CheckCircle,
  HelpCircle,
} from "lucide-react";
import {
  SignLanguage,
  SignItem,
  ASL_ALPHABET,
  TID_ALPHABET,
  COMMON_PHRASES,
  searchSigns,
} from "../lib/signLibrary";

interface SignLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: SignLanguage;
  onSelectLanguage: (lang: SignLanguage) => void;
  onSelectPracticeSign?: (sign: SignItem) => void;
}

export const SignLibraryModal: React.FC<SignLibraryModalProps> = ({
  isOpen,
  onClose,
  activeLanguage,
  onSelectLanguage,
  onSelectPracticeSign,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<"all" | "alphabet" | "common">("all");
  const [selectedSign, setSelectedSign] = useState<SignItem | null>(null);

  const filteredSigns = useMemo(() => {
    let list: SignItem[] = [];
    if (searchQuery.trim()) {
      list = searchSigns(activeLanguage, searchQuery);
    } else {
      if (activeCategory === "all") {
        list = [...(activeLanguage === "ASL" ? ASL_ALPHABET : TID_ALPHABET), ...COMMON_PHRASES];
      } else if (activeCategory === "alphabet") {
        list = activeLanguage === "ASL" ? ASL_ALPHABET : TID_ALPHABET;
      } else {
        list = COMMON_PHRASES;
      }
    }
    return list;
  }, [activeLanguage, activeCategory, searchQuery]);

  // Audio Pronunciation using Web Speech API
  const speakText = (text: string, lang: SignLanguage) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === "ASL" ? "en-US" : "tr-TR";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl text-white max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                İşaret Dili El Harf Kütüphanesi
              </h2>
              <p className="text-xs text-slate-400">
                Yerleşik ASL & TİD El Alfabeleri ve Günlük İşaretler
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
            title="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Selector: ASL vs TID */}
        <div className="p-3 px-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">
            Aktif Alfabe:
          </span>
          <div className="flex items-center gap-2 flex-1 max-w-xs">
            <button
              onClick={() => onSelectLanguage("ASL")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeLanguage === "ASL"
                  ? "bg-sky-500 text-white shadow-md shadow-sky-500/25 border border-sky-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>🇺🇸</span> ASL (Amerikan)
            </button>
            <button
              onClick={() => onSelectLanguage("TID")}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeLanguage === "TID"
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/25 border border-rose-400"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <span>🇹🇷</span> TİD (Türkçe)
            </button>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-800 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Harf veya kelime ara (örn: A, B, Ç, Merhaba, Hello)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-sky-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory("all")}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeCategory === "all"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200"
              }`}
            >
              Tüm Liste ({filteredSigns.length})
            </button>
            <button
              onClick={() => setActiveCategory("alphabet")}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeCategory === "alphabet"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200"
              }`}
            >
              Harfler (A-Z)
            </button>
            <button
              onClick={() => setActiveCategory("common")}
              className={`py-1.5 px-3 rounded-lg text-xs font-medium transition-all shrink-0 ${
                activeCategory === "common"
                  ? "bg-slate-700 text-white"
                  : "bg-slate-800/70 text-slate-400 hover:text-slate-200"
              }`}
            >
              Günlük İşaretler
            </button>
          </div>
        </div>

        {/* Content Body: Grid of Signs */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {filteredSigns.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <HelpCircle className="w-10 h-10 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-semibold">Aranan işaret bulunamadı</p>
              <p className="text-xs text-slate-500 mt-1">Farklı bir harf veya kelime arayabilirsiniz.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredSigns.map((item) => {
                const isSelected = selectedSign?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedSign(isSelected ? null : item)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-sky-950/60 border-sky-500 ring-1 ring-sky-500/40"
                        : "bg-slate-800/60 border-slate-700/60 hover:bg-slate-800/90"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {/* Letter Icon Badge */}
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-slate-900 to-slate-800 border border-slate-700 flex items-center justify-center text-lg font-black text-sky-400 shadow-inner">
                          {item.letter}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {item.name}
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/80 text-slate-300 font-normal">
                              {item.handsRequired === 1 ? "Tek El" : "Çift El"}
                            </span>
                          </h4>
                          <span className="text-xs text-slate-400 block font-mono mt-0.5">
                            {item.handShape}
                          </span>
                        </div>
                      </div>

                      {/* Voice button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakText(item.name, item.language);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-700/60 transition-colors"
                        title="Sesli Dinle"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed bg-slate-950/40 p-2 rounded-lg border border-slate-800/60">
                      {activeLanguage === "TID" && item.turkishDescription
                        ? item.turkishDescription
                        : item.description}
                    </p>

                    {/* Visual Tip */}
                    <div className="mt-2 flex items-center justify-between text-[11px] text-sky-400/90">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" />
                        {item.visualTip}
                      </span>
                    </div>

                    {/* Practice button */}
                    {onSelectPracticeSign && (
                      <div className="mt-3 pt-2.5 border-t border-slate-700/50 flex justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectPracticeSign(item);
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/20 active:scale-95"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Kamerada Pratik Yap
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Toplam {filteredSigns.length} işaret kütüphanede kayıtlı</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
