"use client";

import React, { useState, useEffect } from "react";
import { Download, Share, PlusSquare, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export const InstallPromptBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(true);
  const [showIosGuide, setShowIosGuide] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if app is already running in standalone mode (installed PWA)
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // Check if user previously dismissed the banner
    const dismissedTime = localStorage.getItem("signvision_pwa_dismissed");
    if (dismissedTime && Date.now() - parseInt(dismissedTime, 10) < 1000 * 60 * 60 * 24 * 3) {
      // Dismissed within last 3 days
      return;
    }
    setIsDismissed(false);

    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIosDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari =
      /Safari/.test(ua) &&
      !/CriOS|FxiOS|OPiOS|mercury/i.test(ua) &&
      !/Chrome/i.test(ua);

    setIsIos(isIosDevice && isSafari);

    // Listen for Chromium PWA install prompt (Android Chrome, Edge, etc.)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Hide if user successfully installs
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setIsDismissed(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("signvision_pwa_dismissed", Date.now().toString());
    }
  };

  // Do not show if already in standalone mode, dismissed, or neither iOS nor Android prompt is available
  if (isStandalone || isDismissed) return null;
  if (!deferredPrompt && !isIos) return null;

  return (
    <aside
      aria-label="PWA Installation Banner"
      className="fixed bottom-20 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300 pointer-events-auto"
    >
      <div className="bg-slate-900/95 backdrop-blur-xl border border-sky-500/40 rounded-2xl p-4 shadow-2xl text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Install SignVision</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Install as a full-screen app for faster camera access & gesture recognition.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0"
            title="Dismiss installation banner"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ANDROID / CHROMIUM: 1-Click Install Button */}
        {deferredPrompt && (
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              Add to Home Screen
            </button>
            <button
              onClick={handleDismiss}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Later
            </button>
          </div>
        )}

        {/* IOS SAFARI: Instructions Guide */}
        {isIos && !deferredPrompt && (
          <div className="mt-3 pt-3 border-t border-slate-800">
            {!showIosGuide ? (
              <button
                onClick={() => setShowIosGuide(true)}
                className="w-full py-2.5 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-sky-500/30 transition-all"
              >
                <PlusSquare className="w-4 h-4" />
                How to Install on iPhone / iPad
              </button>
            ) : (
              <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    1
                  </span>
                  <span>
                    Tap the <strong className="text-white">Share</strong> button{" "}
                    <Share className="w-3.5 h-3.5 inline text-sky-400 -mt-0.5" /> in the Safari toolbar.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    2
                  </span>
                  <span>
                    Scroll down and tap{" "}
                    <strong className="text-white">&quot;Add to Home Screen&quot;</strong>{" "}
                    <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 -mt-0.5" />.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    3
                  </span>
                  <span>
                    Tap <strong className="text-white">&quot;Add&quot;</strong> in the top-right corner.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
