"use client";

import React, { useEffect, useRef } from "react";
import { Camera, AlertCircle, RefreshCw, Play, SwitchCamera, ShieldCheck, Focus } from "lucide-react";
import { UIAppLanguage } from "./SettingsMenuModal";
import { useTranslation } from "../hooks/useTranslation";

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  isStarting: boolean;
  hasStarted: boolean;
  facingMode: "user" | "environment";
  error: string | null;
  hasHandDetected?: boolean;
  onStartCamera: () => void;
  onRetry: () => void;
  onToggleFacingMode?: () => void;
  uiLanguage: UIAppLanguage;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  videoRef,
  isStreaming,
  isStarting,
  hasStarted,
  facingMode,
  error,
  hasHandDetected = false,
  onStartCamera,
  onRetry,
  onToggleFacingMode,
  uiLanguage,
}) => {
  const { t } = useTranslation(uiLanguage);
  
  // Mirroring for selfie camera
  const isMirrored = facingMode === "user";

  const bgVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (bgVideoRef.current && videoRef.current && videoRef.current.srcObject) {
      bgVideoRef.current.srcObject = videoRef.current.srcObject;
    }
  }, [isStreaming, videoRef]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
      {/* Background Blurred Fill Video (for object-contain empty spaces) */}
      <video
        ref={bgVideoRef}
        playsInline={true}
        autoPlay={true}
        muted={true}
        className={`absolute inset-0 w-full h-full object-cover blur-3xl scale-[1.15] pointer-events-none transition-transform duration-300 ${
          isMirrored ? "-scale-x-100" : "scale-x-100"
        } ${isStreaming ? "opacity-35" : "opacity-0"}`}
      />

      {/* Main Video Stream with object-contain to prevent crop */}
      <video
        ref={videoRef}
        playsInline={true}
        autoPlay={true}
        muted={true}
        className={`relative z-0 w-full h-full object-contain drop-shadow-2xl select-none pointer-events-none transition-transform duration-300 ${
          isMirrored ? "-scale-x-100" : "scale-x-100"
        } ${isStreaming ? "opacity-100" : "opacity-0"}`}
      />

      {/* 2. INTERACTIVE HAND DETECTION ZONE WITH NEON GLOW LOGIC */}
      {isStreaming && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 z-10">
          <div
            className={`w-full max-w-xs sm:max-w-sm h-3/4 sm:h-4/5 rounded-3xl border-2 transition-all duration-500 flex flex-col justify-between p-4 ${
              hasHandDetected
                ? "border-sky-400 bg-sky-400/5 shadow-[0_0_35px_rgba(56,189,248,0.45)] scale-[1.01]"
                : "border-dashed border-white/20 bg-black/10 opacity-60 shadow-none scale-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`text-[10px] font-bold tracking-wider uppercase px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-md border transition-all duration-300 ${
                  hasHandDetected
                    ? "bg-sky-500/20 text-sky-300 border-sky-400/40 shadow-sm"
                    : "bg-black/30 text-slate-400 border-white/10"
                }`}
              >
                <Focus className={`w-3.5 h-3.5 ${hasHandDetected ? "text-sky-400 animate-pulse" : "text-slate-400"}`} />
                {hasHandDetected ? t("handDetected") : t("handDetectionZone")}
              </span>
            </div>

            <span
              className={`text-[10px] font-medium px-3 py-1 rounded-full self-end backdrop-blur-md border transition-all duration-300 ${
                hasHandDetected
                  ? "bg-sky-500/20 text-sky-200 border-sky-400/40"
                  : "bg-black/30 text-slate-400 border-white/10"
              }`}
            >
              {hasHandDetected ? t("makingSign") : t("bringHand")}
            </span>
          </div>
        </div>
      )}

      {/* STATE 1: Initial Start Screen */}
      {!hasStarted && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-2xl text-white p-6 z-30">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-sky-500/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-2xl">
              <Camera className="w-12 h-12 text-sky-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 shadow-lg border border-white/20">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white text-center">
            {t("visionTitle")}
          </h2>
          <p className="text-sm text-slate-300 text-center mt-2 max-w-xs leading-relaxed">
            {t("visionDesc")}
          </p>

          <button
            type="button"
            onClick={onToggleFacingMode}
            className="mt-5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-lg border border-white/15 text-xs text-slate-200 flex items-center gap-2 transition-all active:scale-95 shadow-md"
            title={t("cameraChangeBeforeStart")}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              {t("cameraLabel")}{" "}
              <strong className="text-sky-400 font-bold">
                {facingMode === "environment" ? t("cameraBack") : t("cameraFront")}
              </strong>
            </span>
            <SwitchCamera className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
          </button>

          <button
            onClick={onStartCamera}
            className="mt-6 flex items-center justify-center gap-2.5 w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 active:scale-95 transition-all border border-white/20"
          >
            <Play className="w-5 h-5 fill-current" />
            {t("startCamera")}
          </button>

          <span className="text-[11px] text-slate-400 mt-4 text-center">
            {t("compatible")}
          </span>
        </div>
      )}

      {/* STATE 2: Loading / Requesting Permission */}
      {isStarting && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-2xl text-white p-6 z-30">
          <div className="relative mb-5">
            <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
            <Camera className="w-7 h-7 text-sky-400 absolute inset-0 m-auto" />
          </div>
          <h3 className="text-lg font-bold tracking-wide">{t("startingCamera")}</h3>
          <p className="text-sm text-slate-400 text-center mt-1.5 max-w-xs leading-relaxed">
            {t("allowCamera")}
          </p>
        </div>
      )}

      {/* STATE 3: Error / Permission Denied */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-2xl text-white p-6 z-30">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-lg">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-rose-400 text-center">{t("cameraPermissionRequired")}</h3>
          <p className="text-sm text-slate-300 text-center mt-2 max-w-xs leading-relaxed">
            {error}
          </p>
          <button
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/25 border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            {t("retry")}
          </button>
        </div>
      )}
    </div>
  );
};
