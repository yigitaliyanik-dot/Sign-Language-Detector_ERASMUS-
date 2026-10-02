"use client";

import React from "react";
import { FlipHorizontal, Play, Pause, Menu } from "lucide-react";

interface ControlBarProps {
  facingMode: "user" | "environment";
  isPaused: boolean;
  onToggleFacingMode: () => void;
  onTogglePause: () => void;
  onOpenSettingsMenu: () => void;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  facingMode,
  isPaused,
  onToggleFacingMode,
  onTogglePause,
  onOpenSettingsMenu,
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 px-4 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none">
      <div className="max-w-xs mx-auto flex items-center justify-between bg-black/20 backdrop-blur-2xl border border-white/15 rounded-full p-2.5 shadow-2xl pointer-events-auto">
        {/* Left: Camera Flip Button */}
        <button
          onClick={onToggleFacingMode}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          title={`Kamerayı Çevir (${facingMode === "user" ? "Ön" : "Arka"})`}
          aria-label="Kamerayı Çevir"
        >
          <FlipHorizontal className="w-5 h-5 text-sky-400" />
        </button>

        {/* Center Primary Action: Play / Pause Button */}
        <button
          onClick={onTogglePause}
          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all shadow-xl active:scale-90 border border-white/20 ${
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

        {/* Right: Drawer Menu Button */}
        <button
          onClick={onOpenSettingsMenu}
          className="flex flex-col items-center justify-center w-12 h-12 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-all active:scale-90"
          title="Menü & Ayarlar"
          aria-label="Menü"
        >
          <Menu className="w-5 h-5 text-sky-400" />
        </button>
      </div>
    </div>
  );
};
