"use client";

import React, { useEffect, useState } from "react";
import { SignPrediction } from "../lib/mediapipe/types";
import { SignLanguage, SignItem } from "../lib/signLibrary";
import { Volume2, VolumeX, X } from "lucide-react";

interface PredictionBannerProps {
  predictions: SignPrediction[];
  fps: number;
  isPaused: boolean;
  isLoadingModel: boolean;
  activeLanguage?: SignLanguage;
  onToggleLanguage?: () => void;
  practiceSign?: SignItem | null;
  onClearPracticeSign?: () => void;
}

export const PredictionBanner: React.FC<PredictionBannerProps> = ({
  predictions,
  isPaused,
  isLoadingModel,
  activeLanguage = "TID",
  onToggleLanguage,
  practiceSign,
  onClearPracticeSign,
}) => {
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [lastSpoken, setLastSpoken] = useState<string>("");

  const topPrediction = predictions[0];

  // Text to speech for new predictions
  useEffect(() => {
    if (!topPrediction || topPrediction.confidence < 70 || isPaused) return;

    const signName = topPrediction.sign;

    if (speechEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      if (lastSpoken !== signName) {
        const utterance = new SpeechSynthesisUtterance(signName);
        utterance.lang = activeLanguage === "ASL" ? "en-US" : "tr-TR";
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
        setLastSpoken(signName);
      }
    }
  }, [topPrediction, speechEnabled, lastSpoken, isPaused, activeLanguage]);

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-4 pt-[calc(env(safe-area-inset-top)+14px)] flex flex-col gap-3 pointer-events-none">
      {/* 1. MINIMALIST TOP BAR: Minimal status dot & language toggle */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Minimal Glowing Active Status Indicator */}
        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-full shadow-lg">
          <span className="flex h-2.5 w-2.5 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isLoadingModel ? "bg-amber-400" : isPaused ? "bg-slate-400" : "bg-emerald-400"
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isLoadingModel ? "bg-amber-500" : isPaused ? "bg-slate-500" : "bg-emerald-500"
              }`}
            />
          </span>
          <span className="text-[11px] font-medium tracking-wide text-slate-200">
            {isLoadingModel ? "Yükleniyor" : isPaused ? "Duraklatıldı" : "TİD Canlı"}
          </span>
        </div>

        {/* Minimal Controls: Language Switcher & Mute */}
        <div className="flex items-center gap-2">
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 bg-black/20 backdrop-blur-xl border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg transition-all active:scale-95"
              title="Dili Değiştir"
            >
              <span>{activeLanguage === "ASL" ? "🇺🇸 ASL" : "🇹🇷 TİD"}</span>
            </button>
          )}

          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="p-2 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 text-slate-200 hover:text-white transition-all active:scale-95 shadow-lg"
            title={speechEnabled ? "Sesli okumayı kapat" : "Sesli okumayı aç"}
          >
            {speechEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-sky-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Target Practice Banner (when a sign is chosen from library) */}
      {practiceSign && (
        <div className="bg-sky-950/30 backdrop-blur-2xl border border-sky-400/30 rounded-2xl p-2.5 px-4 shadow-xl flex items-center justify-between pointer-events-auto animate-in slide-in-from-top duration-200 max-w-md mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-black text-sky-300 bg-black/30 backdrop-blur-md w-8 h-8 rounded-xl flex items-center justify-center border border-white/15">
              {practiceSign.letter}
            </span>
            <div>
              <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                Hedef: {practiceSign.name}
              </span>
              <span className="text-xs text-slate-200 block line-clamp-1">
                {practiceSign.visualTip}
              </span>
            </div>
          </div>
          {onClearPracticeSign && (
            <button
              onClick={onClearPracticeSign}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
              title="Çıkış"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Real-time Floating Detection Pill (Non-intrusive) */}
      {topPrediction && (
        <div className="self-center bg-black/30 backdrop-blur-2xl border border-white/15 px-4 py-1.5 rounded-full text-center shadow-2xl animate-in zoom-in-95 pointer-events-auto flex items-center gap-2.5">
          <span className="text-xs font-black tracking-wide text-white">
            {topPrediction.sign}
          </span>
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
            %{topPrediction.confidence}
          </span>
        </div>
      )}
    </div>
  );
};


