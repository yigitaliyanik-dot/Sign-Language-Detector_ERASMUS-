"use client";

import React, { useState } from "react";
import {
  Space,
  Delete,
  Trash2,
  Volume2,
  Copy,
  Check,
  Sparkles,
  Type,
} from "lucide-react";
import { SentenceBuilderState } from "../hooks/useSentenceBuilder";
import { SignLanguage } from "../lib/signLibrary";

interface SentenceOutputBoxProps {
  builder: SentenceBuilderState;
  activeLanguage?: SignLanguage;
}

export const SentenceOutputBox: React.FC<SentenceOutputBoxProps> = ({
  builder,
  activeLanguage = "TID",
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const {
    sentence,
    holdingSign,
    holdProgress,
    addSpace,
    backspace,
    clearSentence,
    speakSentence,
    copyToClipboard,
  } = builder;

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="absolute bottom-24 left-3 right-3 z-30 max-w-lg mx-auto pointer-events-auto select-none animate-in slide-in-from-bottom duration-300">
      {/* Live Hold-to-Commit Progress Indicator (Debounce) */}
      {holdingSign && (
        <div className="mb-2.5 flex items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-sky-400/35 px-4 py-2 rounded-2xl shadow-xl animate-in zoom-in-95">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
            <span className="text-xs font-bold text-white">
              Harf Sabitleniyor: <strong className="text-sky-300 text-sm font-black">{holdingSign}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Progress Bar */}
            <div className="w-20 bg-slate-950/50 rounded-full h-2 overflow-hidden border border-white/10 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  holdProgress >= 100
                    ? "bg-emerald-400"
                    : "bg-gradient-to-r from-sky-400 to-blue-500"
                }`}
                style={{ width: `${holdProgress}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-sky-300 w-8 text-right">
              %{holdProgress}
            </span>
          </div>
        </div>
      )}

      {/* Main Sentence Output Box Card */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/15 rounded-3xl p-4 shadow-2xl space-y-3">
        {/* Header Label */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-4 h-4 text-sky-400" />
            Metin / Cümle Kutusu ({activeLanguage})
          </span>

          <div className="flex items-center gap-1">
            {/* Speak Sentence Button */}
            <button
              disabled={!sentence.trim()}
              onClick={() => speakSentence(activeLanguage)}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Cümleyi Seslendir"
              aria-label="Cümleyi Oku"
            >
              <Volume2 className="w-4 h-4 text-sky-400" />
            </button>

            {/* Copy Button */}
            <button
              disabled={!sentence.trim()}
              onClick={handleCopy}
              className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Metni Kopyala"
              aria-label="Kopyala"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Clear Button */}
            <button
              disabled={!sentence}
              onClick={clearSentence}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Tüm Metni Temizle"
              aria-label="Temizle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Text View Area */}
        <div className="min-h-[48px] max-h-24 overflow-y-auto bg-slate-950/40 border border-white/10 rounded-2xl p-3 flex items-center shadow-inner backdrop-blur-md">
          {sentence ? (
            <p className="text-base font-bold text-white tracking-wide break-words leading-relaxed">
              {sentence}
              <span className="inline-block w-1.5 h-4 ml-1 bg-sky-400 animate-pulse align-middle rounded-full" />
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              İşaretleri 1.2 sn sabit tuttuğunuzda harfler buraya eklenir...
            </p>
          )}
        </div>

        {/* Text Manipulation Buttons: Space & Backspace */}
        <div className="grid grid-cols-2 gap-2.5 pt-0.5">
          <button
            onClick={addSpace}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Space className="w-4 h-4 text-sky-400" />
            Boşluk Bırak (Space)
          </button>

          <button
            disabled={!sentence}
            onClick={backspace}
            className="py-2.5 px-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 disabled:opacity-40 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Delete className="w-4 h-4 text-rose-400" />
            Sil (Backspace)
          </button>
        </div>
      </div>
    </div>
  );
};

