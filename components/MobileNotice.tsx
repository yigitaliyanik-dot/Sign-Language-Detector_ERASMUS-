"use client";

import React from "react";
import { Smartphone, X, CheckCircle2 } from "lucide-react";

interface MobileNoticeProps {
  isPortrait: boolean;
  isMobileDevice: boolean;
  isGuideOpen: boolean;
  onCloseGuide: () => void;
}

const SUPPORTED_GESTURES = [
  { sign: "Open Palm", meaning: "Hello / Stop / Letter B", tr: "Merhaba / Dur" },
  { sign: "Thumb Up", meaning: "Good / Yes / Approval", tr: "İyi / Evet" },
  { sign: "Thumb Down", meaning: "Bad / Dislike / No", tr: "Kötü / Hayır" },
  { sign: "Victory (V)", meaning: "Peace / Letter V / Two", tr: "Barış / V Harfi / İki" },
  { sign: "Pointing Up", meaning: "One / You / Look", tr: "Bir / Sen" },
  { sign: "Closed Fist", meaning: "Letter S / Power / Solidarity", tr: "S Harfi / Güç" },
  { sign: "I Love You", meaning: "ASL 'I Love You' (Thumb+Index+Pinky)", tr: "Seni Seviyorum" },
];

export const MobileNotice: React.FC<MobileNoticeProps> = ({
  isPortrait,
  isMobileDevice,
  isGuideOpen,
  onCloseGuide,
}) => {
  return (
    <>
      {/* Landscape Warning Banner on Mobile screens */}
      {isMobileDevice && !isPortrait && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mb-4 animate-bounce">
            <Smartphone className="w-8 h-8 rotate-90" />
          </div>
          <h2 className="text-xl font-bold">Rotate to Portrait Mode</h2>
          <p className="text-sm text-slate-300 mt-2 max-w-xs leading-relaxed">
            This application is optimized for vertical mobile screens to ensure accurate full hand
            tracking.
          </p>
        </div>
      )}

      {/* Sign Language Reference Guide Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl p-6 text-white max-h-[85vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Sign Language Guide</h3>
                <p className="text-xs text-slate-400">Supported MediaPipe signs & gestures</p>
              </div>
              <button
                onClick={onCloseGuide}
                className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto py-3 space-y-2.5 flex-1 pr-1">
              {SUPPORTED_GESTURES.map((g) => (
                <div
                  key={g.sign}
                  className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/40 flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-sm text-sky-300 block">{g.sign}</span>
                    <span className="text-xs text-slate-300 block">{g.meaning}</span>
                    <span className="text-[11px] text-slate-400 italic block mt-0.5">TR: {g.tr}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Close Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={onCloseGuide}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold text-sm text-white transition-all shadow-lg shadow-sky-500/20 active:scale-95"
              >
                Back to Detection
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
