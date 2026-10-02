"use client";

import React, { useState } from "react";
import {
  Volume2,
  Copy,
  Check,
  Trash2,
  Sparkles,
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
    <div className="absolute bottom-20 left-4 right-4 z-30 max-w-lg mx-auto pointer-events-auto select-none animate-in slide-in-from-bottom duration-300">
      {/* Live Hold-to-Commit Subtle Indicator */}
      {holdingSign && (
        <div className="mb-2 self-center inline-flex items-center gap-2 bg-black/30 backdrop-blur-xl border border-sky-400/30 px-3.5 py-1.5 rounded-full shadow-lg mx-auto">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="text-xs font-semibold text-white">
            Algılanıyor: <strong className="text-sky-300 font-bold">{holdingSign}</strong>
          </span>
          <div className="w-12 bg-white/10 rounded-full h-1.5 overflow-hidden ml-1 border border-white/10">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                holdProgress >= 100 ? "bg-emerald-400" : "bg-sky-400"
              }`}
              style={{ width: `${holdProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Floating iOS-style Ultra Liquid Glass Sentence Bar */}
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/15 rounded-full px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3">
        {/* Dynamic Text Stream */}
        <div className="flex-1 overflow-x-auto no-scrollbar py-0.5 flex items-center">
          {sentence ? (
            <p className="text-sm font-bold text-white tracking-wide whitespace-nowrap">
              {sentence}
              <span className="inline-block w-1.5 h-3.5 ml-1 bg-sky-400 animate-pulse align-middle rounded-full" />
            </p>
          ) : (
            <p className="text-xs text-slate-300/80 italic flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              İşaret yapın, cümle otomatik oluşturulsun...
            </p>
          )}
        </div>

        {/* Minimal Control Actions */}
        <div className="flex items-center gap-1 shrink-0 border-l border-white/10 pl-2">
          <button
            disabled={!sentence.trim()}
            onClick={() => speakSentence(activeLanguage)}
            className="p-1.5 rounded-full text-slate-200 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Seslendir"
          >
            <Volume2 className="w-4 h-4 text-sky-400" />
          </button>

          <button
            disabled={!sentence.trim()}
            onClick={handleCopy}
            className="p-1.5 rounded-full text-slate-200 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Kopyala"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4 text-slate-300" />
            )}
          </button>

          <button
            disabled={!sentence}
            onClick={clearSentence}
            className="p-1.5 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


