"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { SentenceBuilderState } from "../hooks/useSentenceBuilder";
import { SignLanguage } from "../lib/signLibrary";
import { UIAppLanguage } from "./SettingsMenuModal";
import { useTranslation } from "../hooks/useTranslation";

interface SentenceOutputBoxProps {
  builder: SentenceBuilderState;
  activeLanguage?: SignLanguage;
  uiLanguage: UIAppLanguage;
}

export const SentenceOutputBox: React.FC<SentenceOutputBoxProps> = ({
  builder,
  uiLanguage,
}) => {
  const { t } = useTranslation(uiLanguage);
  const {
    sentence,
    holdingSign,
    holdProgress,
  } = builder;

  return (
    <div className="absolute bottom-28 left-4 right-4 z-30 max-w-lg mx-auto pointer-events-auto select-none animate-in slide-in-from-bottom duration-300 flex flex-col items-center">
      {/* Live Hold-to-Commit Subtle Indicator */}
      {holdingSign && (
        <div className="mb-2 inline-flex items-center gap-2 bg-black/30 backdrop-blur-xl border border-sky-400/30 px-3.5 py-1.5 rounded-full shadow-lg">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          <span className="text-xs font-semibold text-white">
            {t("detecting")}: <strong className="text-sky-300 font-bold">{holdingSign}</strong>
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

      {/* Floating Minimalist Ultra Liquid Glass Sentence Bar */}
      <div className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl border border-white/15 rounded-full px-5 py-3 shadow-2xl flex items-center justify-center max-w-full overflow-hidden">
        {sentence ? (
          <p className="text-base sm:text-lg font-bold text-white tracking-wide whitespace-nowrap overflow-x-auto no-scrollbar">
            {sentence}
            <span className="inline-block w-1.5 h-4 ml-1 bg-sky-400 animate-pulse align-middle rounded-full" />
          </p>
        ) : (
          <p className="text-xs sm:text-sm text-slate-300/80 italic flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
            {t("makeSign")}
          </p>
        )}
      </div>
    </div>
  );
};


