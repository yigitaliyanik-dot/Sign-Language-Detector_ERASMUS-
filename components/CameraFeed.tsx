"use client";

import React from "react";
import { Camera, AlertCircle, RefreshCw, Play, FlipHorizontal, ShieldCheck, Focus } from "lucide-react";

interface CameraFeedProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isStreaming: boolean;
  isStarting: boolean;
  hasStarted: boolean;
  facingMode: "user" | "environment";
  error: string | null;
  onStartCamera: () => void;
  onRetry: () => void;
  onToggleFacingMode?: () => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  videoRef,
  isStreaming,
  isStarting,
  hasStarted,
  facingMode,
  error,
  onStartCamera,
  onRetry,
  onToggleFacingMode,
}) => {
  // Only mirror if using front/selfie camera ('user')
  const isMirrored = facingMode === "user";

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 flex items-center justify-center">
      {/* Full Viewport Background Video Element (No outer frame limits or black letterboxing) */}
      <video
        ref={videoRef}
        playsInline={true}
        autoPlay={true}
        muted={true}
        className={`w-full h-full object-cover select-none pointer-events-none transition-transform duration-300 ${
          isMirrored ? "-scale-x-100" : "scale-x-100"
        } ${isStreaming ? "opacity-100" : "opacity-0"}`}
      />

      {/* Floating HUD Target Overlay Guideline (Ultra-light, non-intrusive) */}
      {isStreaming && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
          <div className="w-full max-w-sm h-3/4 sm:h-4/5 border border-dashed border-sky-400/20 rounded-3xl flex flex-col justify-between p-4 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-sky-300/70 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/10">
                <Focus className="w-3 h-3 text-sky-400" />
                El Algılama Alanı
              </span>
            </div>
            <span className="text-[10px] text-slate-300/60 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full self-end border border-white/10">
              Kameraya rahat açıda durun
            </span>
          </div>
        </div>
      )}

      {/* Floating Quick Flip Camera Button */}
      {isStreaming && onToggleFacingMode && (
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <button
            onClick={onToggleFacingMode}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/30 backdrop-blur-xl border border-white/15 text-slate-200 hover:text-white hover:bg-black/50 active:scale-95 transition-all shadow-lg"
            title={`Kamerayı Değiştir: ${facingMode === "environment" ? "Ön Kamera" : "Arka Kamera"}`}
            aria-label="Kamerayı Değiştir"
          >
            <FlipHorizontal className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold">
              {facingMode === "environment" ? "Arka" : "Ön"}
            </span>
          </button>
        </div>
      )}

      {/* STATE 1: Initial Start Screen (Transparent Liquid Glass Overlay) */}
      {!hasStarted && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/75 backdrop-blur-2xl text-white p-6 z-30">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-sky-500/10 border border-white/20 flex items-center justify-center backdrop-blur-md shadow-2xl">
              <Camera className="w-12 h-12 text-sky-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5 shadow-lg border border-white/20">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-3xl font-black tracking-tight text-white text-center">
            Türk İşaret Dili Vision
          </h2>
          <p className="text-sm text-slate-300 text-center mt-2 max-w-xs leading-relaxed">
            MediaPipe ve TensorFlow.js ile anlık, yerel işaret dili çevirisi.
          </p>

          {/* Pre-start camera toggle option */}
          <button
            type="button"
            onClick={onToggleFacingMode}
            className="mt-5 px-4 py-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-lg border border-white/15 text-xs text-slate-200 flex items-center gap-2 transition-all active:scale-95 shadow-md"
            title="Başlamadan önce kamerayı değiştir"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>
              Kamera:{" "}
              <strong className="text-sky-400 font-bold">
                {facingMode === "environment" ? "Arka (Çevre)" : "Ön (Selfie)"}
              </strong>
            </span>
            <FlipHorizontal className="w-3.5 h-3.5 text-slate-300 ml-0.5" />
          </button>

          <button
            onClick={onStartCamera}
            className="mt-6 flex items-center justify-center gap-2.5 w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-sky-500/25 active:scale-95 transition-all border border-white/20"
          >
            <Play className="w-5 h-5 fill-current" />
            Kamerayı Başlat
          </button>

          <span className="text-[11px] text-slate-400 mt-4 text-center">
            iOS Safari ve Android Chrome ile %100 Uyumlu
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
          <h3 className="text-lg font-bold tracking-wide">Kamera Başlatılıyor</h3>
          <p className="text-sm text-slate-400 text-center mt-1.5 max-w-xs leading-relaxed">
            Lütfen tarayıcınızın kamera iznine onay verin...
          </p>
        </div>
      )}

      {/* STATE 3: Error / Permission Denied */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-2xl text-white p-6 z-30">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-lg">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-rose-400 text-center">Kamera İzni Gerekiyor</h3>
          <p className="text-sm text-slate-300 text-center mt-2 max-w-xs leading-relaxed">
            {error}
          </p>
          <button
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white font-semibold text-sm transition-all shadow-lg shadow-sky-500/25 border border-white/10"
          >
            <RefreshCw className="w-4 h-4" />
            Yeniden Deneyin
          </button>
        </div>
      )}
    </div>
  );
};


