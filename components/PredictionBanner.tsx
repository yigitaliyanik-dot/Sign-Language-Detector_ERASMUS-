"use client";

import React, { useEffect, useState } from "react";
import { SignPrediction } from "../lib/mediapipe/types";
import { SignLanguage, SignItem } from "../lib/signLibrary";
import { Volume2, VolumeX, Trash2, Sparkles, Activity, X } from "lucide-react";

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
  fps,
  isPaused,
  isLoadingModel,
  activeLanguage = "TID",
  onToggleLanguage,
  practiceSign,
  onClearPracticeSign,
}) => {
  const [history, setHistory] = useState<string[]>([]);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);
  const [lastSpoken, setLastSpoken] = useState<string>("");

  const topPrediction = predictions[0];

  // Text to speech and history tracking for new predictions
  useEffect(() => {
    if (!topPrediction || topPrediction.confidence < 70 || isPaused) return;

    const signName = topPrediction.sign;

    // Add to history if different from recent or if paused
    setHistory((prev) => {
      if (prev.length === 0 || prev[prev.length - 1] !== signName) {
        // Speak using Web Speech Synthesis API in active language voice
        if (speechEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
          if (lastSpoken !== signName) {
            const utterance = new SpeechSynthesisUtterance(signName);
            utterance.lang = activeLanguage === "ASL" ? "en-US" : "tr-TR";
            utterance.rate = 1.0;
            window.speechSynthesis.speak(utterance);
            setLastSpoken(signName);
          }
        }
        return [...prev.slice(-6), signName]; // Keep last 7 signs
      }
      return prev;
    });
  }, [topPrediction, speechEnabled, lastSpoken, isPaused, activeLanguage]);

  return (
    <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 pt-[calc(env(safe-area-inset-top)+12px)] flex flex-col gap-2.5 max-w-xl mx-auto pointer-events-none">
      {/* Top Header Row: Status, Language Switcher & FPS */}
      <div className="flex items-center justify-between pointer-events-auto">
        {/* App Title, Status & Language Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900/40 backdrop-blur-xl border border-white/15 px-3.5 py-1.5 rounded-full shadow-lg">
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
            <span className="text-xs font-bold tracking-tight text-slate-100">
              {isLoadingModel ? "Yükleniyor..." : isPaused ? "Duraklatıldı" : "TİD Vision AI"}
            </span>
          </div>

          {/* Quick Language Toggle Pill */}
          {onToggleLanguage && (
            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1.5 bg-slate-900/40 backdrop-blur-xl border border-white/15 hover:border-sky-400/40 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg transition-all active:scale-95"
              title="Dili / Alfabeyi Değiştir"
            >
              <span>{activeLanguage === "ASL" ? "🇺🇸 ASL" : "🇹🇷 TİD"}</span>
            </button>
          )}
        </div>

        {/* FPS Indicator & Speech Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900/40 backdrop-blur-xl border border-white/15 px-3 py-1.5 rounded-full text-[11px] font-mono font-medium text-slate-200 shadow-lg">
            <Activity className="w-3.5 h-3.5 text-sky-400" />
            <span>{fps} FPS</span>
          </div>

          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className="p-2 rounded-full bg-slate-900/40 backdrop-blur-xl border border-white/15 text-slate-200 hover:text-white transition-all active:scale-95 shadow-lg pointer-events-auto"
            title={speechEnabled ? "Sesli okumayı kapat" : "Sesli okumayı aç"}
          >
            {speechEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Target Practice Banner (when a sign is chosen from library) */}
      {practiceSign && (
        <div className="bg-sky-950/40 backdrop-blur-xl border border-sky-400/30 rounded-2xl p-3 px-4 shadow-xl flex items-center justify-between pointer-events-auto animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-sky-300 bg-slate-900/50 backdrop-blur-md w-9 h-9 rounded-xl flex items-center justify-center border border-white/15 shadow-inner">
              {practiceSign.letter}
            </span>
            <div>
              <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider block">
                🎯 Hedef Pratik: {practiceSign.name} ({practiceSign.language})
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
              title="Pratik modundan çık"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Main Detected Sign Liquid Glass Card */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/15 rounded-3xl p-4 sm:p-5 shadow-2xl pointer-events-auto transition-all">
        {topPrediction ? (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs uppercase tracking-wider font-bold text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Algılanan İşaret
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 backdrop-blur-md">
                {topPrediction.handedness === "Left" ? "Sol El" : "Sağ El"}
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">
                {topPrediction.sign}
              </h1>
              <span className="text-base font-bold text-emerald-400">
                %{topPrediction.confidence}
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-medium">
              {topPrediction.translatedText}
            </p>

            {/* Confidence Progress Bar */}
            <div className="w-full bg-slate-950/40 border border-white/10 rounded-full h-2 mt-3 overflow-hidden p-0.5">
              <div
                className="bg-gradient-to-r from-sky-400 via-blue-500 to-emerald-400 h-full rounded-full transition-all duration-200 shadow-sm"
                style={{ width: `${topPrediction.confidence}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="py-2.5 text-center">
            <p className="text-sm font-semibold text-slate-300/90">
              {isLoadingModel ? "Yapay zeka modelleri hazırlanıyor..." : "Kameraya elinizi gösterin"}
            </p>
          </div>
        )}
      </div>

      {/* Sentence Accumulator / History Breadcrumbs */}
      {history.length > 0 && (
        <div className="flex items-center justify-between bg-slate-900/40 backdrop-blur-xl border border-white/15 px-3.5 py-2 rounded-2xl pointer-events-auto shadow-lg">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 flex-1 mr-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Geçmiş:
            </span>
            {history.map((item, idx) => (
              <span
                key={`${item}-${idx}`}
                className="text-xs bg-white/10 text-sky-200 px-2.5 py-1 rounded-xl font-semibold shrink-0 border border-white/15 shadow-sm"
              >
                {item}
              </span>
            ))}
          </div>
          <button
            onClick={() => setHistory([])}
            className="text-slate-400 hover:text-rose-400 transition-colors p-1"
            title="Geçmişi temizle"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

