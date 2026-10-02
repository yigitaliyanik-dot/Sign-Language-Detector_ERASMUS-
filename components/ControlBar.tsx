"use client";

import React from "react";
import { FlipHorizontal, Play, Pause, Eye, EyeOff, Languages, Database } from "lucide-react";

interface ControlBarProps {
  facingMode: "user" | "environment";
  isPaused: boolean;
  showSkeleton: boolean;
  onToggleFacingMode: () => void;
  onTogglePause: () => void;
  onToggleSkeleton: () => void;
  onOpenGuide: () => void;
  onOpenLibrary: () => void;
  onOpenDatasetStudio: () => void;
  isCustomModelActive?: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  facingMode,
  isPaused,
  showSkeleton,
  onToggleFacingMode,
  onTogglePause,
  onToggleSkeleton,
  onOpenLibrary,
  onOpenDatasetStudio,
  isCustomModelActive = false,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 px-4 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto flex items-center justify-around bg-slate-900/40 backdrop-blur-2xl border border-white/15 rounded-full p-2 shadow-2xl pointer-events-auto">
        {/* Toggle Landmark Mesh */}
        <button
          onClick={onToggleSkeleton}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-95 ${
            showSkeleton
              ? "text-sky-300 bg-sky-500/20 border border-sky-400/40 shadow-inner"
              : "text-slate-300 hover:text-white hover:bg-white/10"
          }`}
          title="El İskeletini Göster/Gizle"
          aria-label="El İskeleti"
        >
          {showSkeleton ? <Eye className="w-5 h-5 text-sky-400" /> : <EyeOff className="w-5 h-5 text-slate-400" />}
          <span className="text-[9px] font-bold mt-0.5">İskelet</span>
        </button>

        {/* Alphabet & Sign Library Button (ASL & TID) */}
        <button
          onClick={onOpenLibrary}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title="TİD ve ASL El Harf Kütüphanesi"
          aria-label="El Harf Kütüphanesi"
        >
          <Languages className="w-5 h-5 text-sky-400" />
          <span className="text-[9px] font-bold mt-0.5">Alfabe</span>
        </button>

        {/* Primary Play / Pause Action Button */}
        <button
          onClick={onTogglePause}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold transition-all shadow-xl active:scale-90 border border-white/20 ${
            isPaused
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30"
          }`}
          title={isPaused ? "Algılamayı Başlat" : "Algılamayı Duraklat"}
          aria-label={isPaused ? "Başlat" : "Duraklat"}
        >
          {isPaused ? (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          ) : (
            <Pause className="w-6 h-6 fill-current" />
          )}
        </button>

        {/* Flip Front / Back Camera */}
        <button
          onClick={onToggleFacingMode}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          title={`Kamerayı Çevir (${facingMode === "user" ? "Ön" : "Arka"})`}
          aria-label="Kamerayı Çevir"
        >
          <FlipHorizontal className="w-5 h-5 text-sky-400" />
          <span className="text-[9px] font-bold mt-0.5">Çevir</span>
        </button>

        {/* Dataset & Model Studio Button */}
        <button
          onClick={onOpenDatasetStudio}
          className={`relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-95 ${
            isCustomModelActive
              ? "text-emerald-300 bg-emerald-500/20 border border-emerald-400/40"
              : "text-slate-200 hover:text-white hover:bg-white/10"
          }`}
          title="Özel İşaret Eğitme Stüdyosu"
          aria-label="Stüdyo"
        >
          <Database className="w-5 h-5 text-sky-400" />
          <span className="text-[9px] font-bold mt-0.5">Stüdyo</span>
          {isCustomModelActive && (
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse border border-white" />
          )}
        </button>
      </div>
    </div>
  );
};

