"use client";

import React from "react";
import { SwitchCamera, Play, Pause, Menu } from "lucide-react";
import { UIAppLanguage } from "./SettingsMenuModal";
import { useTranslation } from "../hooks/useTranslation";

interface ControlBarProps {
  facingMode: "user" | "environment";
  isPaused: boolean;
  onToggleFacingMode: () => void;
  onTogglePause: () => void;
  onOpenSettingsMenu: () => void;
  uiLanguage: UIAppLanguage;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  facingMode,
  isPaused,
  onToggleFacingMode,
  onTogglePause,
  onOpenSettingsMenu,
  uiLanguage,
}) => {
  const { t } = useTranslation(uiLanguage);

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 px-4 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent pointer-events-none">
      <div className="max-w-xs mx-auto flex items-center justify-between bg-black/20 backdrop-blur-2xl border border-white/15 rounded-full p-2.5 shadow-2xl pointer-events-auto">
        {/* Left: Camera Flip Button */}
        <div className="flex flex-col items-center justify-center gap-1 w-16">
          <button
            onClick={onToggleFacingMode}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            title={t("flipCamera")}
            aria-label={t("flipCamera")}
          >
            <SwitchCamera className="w-5 h-5 text-sky-400" />
          </button>
          <span className="text-[9px] font-medium text-slate-300">{t("flipCamera")}</span>
        </div>

        {/* Center Primary Action: Play / Pause Button */}
        <button
          onClick={onTogglePause}
          className={`w-14 h-14 rounded-full flex items-center justify-center font-bold transition-all shadow-xl active:scale-90 border border-white/20 ${
            isPaused
              ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-emerald-500/30"
              : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-amber-500/30"
          }`}
          title={isPaused ? "Başlat" : "Duraklat"}
          aria-label={isPaused ? "Başlat" : "Duraklat"}
        >
          {isPaused ? (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          ) : (
            <Pause className="w-6 h-6 fill-current" />
          )}
        </button>

        {/* Right: Drawer Menu Button */}
        <div className="flex flex-col items-center justify-center gap-1 w-16">
          <button
            onClick={onOpenSettingsMenu}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-all active:scale-90"
            title={t("menu")}
            aria-label={t("menu")}
          >
            <Menu className="w-5 h-5 text-sky-400" />
          </button>
          <span className="text-[9px] font-medium text-slate-300">{t("menu")}</span>
        </div>
      </div>
    </div>
  );
};
