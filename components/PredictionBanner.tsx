"use client";

import React, { useEffect, useState } from "react";
import { SignPrediction } from "../lib/mediapipe/types";
import { SignLanguage, SignItem } from "../lib/signLibrary";
import { Volume2, VolumeX, X, Sparkles } from "lucide-react";

interface PredictionBannerProps {
  predictions: SignPrediction[];
  isPaused: boolean;
  isLoadingModel: boolean;
  activeLanguage?: SignLanguage;
  practiceSign?: SignItem | null;
  onClearPracticeSign?: () => void;
  logoSrc?: string;
}

export const PredictionBanner: React.FC<PredictionBannerProps> = ({
  predictions,
  isPaused,
  activeLanguage = "TID",
  practiceSign,
  onClearPracticeSign,
  logoSrc,
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
      {/* 3. MINIMALIST TOP BAR: Logo Slot (Left) & Audio Toggle (Right) */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* Left: Custom Logo Placeholder / App Badge */}
        <div className="flex items-center gap-2">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="App Logo"
              className="h-8 w-auto object-contain drop-shadow-md rounded-lg"
            />
          ) : (
            <div className="flex items-center gap-2 bg-black/20 backdrop-blur-2xl border border-white/15 px-3 py-1.5 rounded-full shadow-lg">
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-3 h-3" />
              </div>
              <span className="text-xs font-black tracking-tight text-white">
                SignVision
              </span>
            </div>
          )}
        </div>

        {/* Right: Minimalist Audio Toggle Button */}
        <button
          onClick={() => setSpeechEnabled(!speechEnabled)}
          className="p-2.5 rounded-full bg-black/20 backdrop-blur-2xl border border-white/15 text-slate-200 hover:text-white active:scale-95 transition-all shadow-lg"
          title={speechEnabled ? "Sesli okumayı kapat" : "Sesli okumayı aç"}
          aria-label="Ses Ayarı"
        >
          {speechEnabled ? (
            <Volume2 className="w-4 h-4 text-sky-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>
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

      {/* Real-time Floating Detection Pill */}
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
