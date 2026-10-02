"use client";

import React, { useState, useMemo } from "react";
import { useCamera } from "../hooks/useCamera";
import { useHandDetection } from "../hooks/useHandDetection";
import { useMobileOrientation } from "../hooks/useMobileOrientation";
import { useSentenceBuilder } from "../hooks/useSentenceBuilder";
import { inBrowserTrainer } from "../lib/dataset/inBrowserTrainer";
import { SignLanguage, SignItem } from "../lib/signLibrary";
import { CameraFeed } from "./CameraFeed";
import { DetectionCanvas } from "./DetectionCanvas";
import { PredictionBanner } from "./PredictionBanner";
import { SentenceOutputBox } from "./SentenceOutputBox";
import { ControlBar } from "./ControlBar";
import { SettingsMenuModal, UIAppLanguage } from "./SettingsMenuModal";
import { MobileNotice } from "./MobileNotice";
import { DatasetStudio } from "./dataset/DatasetStudio";
import { SignLibraryModal } from "./SignLibraryModal";
import { InstallPromptBanner } from "./InstallPromptBanner";

export const SignLanguageApp: React.FC = () => {
  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState<boolean>(false);
  const [isDatasetStudioOpen, setIsDatasetStudioOpen] = useState<boolean>(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState<boolean>(false);
  const [isCustomModelActive, setIsCustomModelActive] = useState<boolean>(false);

  // Active sign language (TID = Turkish Sign Language, ASL = American Sign Language)
  const [activeLanguage, setActiveLanguage] = useState<SignLanguage>("TID");
  // UI App Language (tr = Türkçe, en = English, de = Deutsch, it = Italiano)
  const [uiLanguage, setUiLanguage] = useState<UIAppLanguage>("tr");

  const [practiceSign, setPracticeSign] = useState<SignItem | null>(null);

  // Mobile orientation detection
  const { isPortrait, isMobileDevice } = useMobileOrientation();

  // Camera management hook (defaults to rear camera: 'environment')
  const {
    videoRef,
    isStreaming,
    isStarting,
    hasStarted,
    facingMode,
    error: cameraError,
    startCamera,
    toggleFacingMode,
  } = useCamera("environment");

  // MediaPipe hand detection hook
  const {
    landmarks,
    predictions,
    fps,
    isLoadingModel,
    isPaused,
    togglePause,
  } = useHandDetection(videoRef, isStreaming);

  // Hand detection presence check for neon glow logic
  const hasHandDetected = landmarks.length > 0 && landmarks[0]?.length === 21;

  // Prioritize custom trained in-browser model when active
  const activePredictions = useMemo(() => {
    if (
      isCustomModelActive &&
      inBrowserTrainer.isReady() &&
      hasHandDetected
    ) {
      const customPred = inBrowserTrainer.predict(landmarks[0]);
      if (customPred) {
        return [
          {
            sign: customPred.label,
            translatedText: `Özel Model: ${customPred.label}`,
            confidence: customPred.confidence,
            handedness: "Right" as const,
            timestamp: Date.now(),
          },
        ];
      }
    }
    return predictions;
  }, [isCustomModelActive, landmarks, predictions, hasHandDetected]);

  // Sentence Accumulator with 1.2s Debounce Hold-to-Commit & Smart Spacing with i18n
  const sentenceBuilder = useSentenceBuilder(activePredictions, isPaused, activeLanguage, uiLanguage);

  return (
    <main className="relative w-full h-screen max-h-screen overflow-hidden bg-slate-950 flex flex-col select-none touch-none">
      {/* Real-time Video Stream with Interactive Neon Hand Detection Zone */}
      <CameraFeed
        videoRef={videoRef}
        isStreaming={isStreaming}
        isStarting={isStarting}
        hasStarted={hasStarted}
        facingMode={facingMode}
        error={cameraError}
        hasHandDetected={hasHandDetected}
        onStartCamera={() => startCamera(facingMode)}
        onRetry={() => startCamera(facingMode)}
        onToggleFacingMode={toggleFacingMode}
        uiLanguage={uiLanguage}
      />

      {/* MediaPipe 21 Hand Landmarks Skeleton Overlay Canvas */}
      {hasStarted && (
        <DetectionCanvas
          landmarks={landmarks}
          videoRef={videoRef}
          isMirrored={facingMode === "user"}
          showSkeleton={showSkeleton && !isPaused}
        />
      )}

      {/* Floating Minimalist Top Bar: Logo Slot (Left) & Audio Toggle (Right) */}
      {hasStarted && (
        <PredictionBanner
          predictions={activePredictions}
          isPaused={isPaused}
          isLoadingModel={isLoadingModel}
          activeLanguage={activeLanguage}
          uiLanguage={uiLanguage}
          practiceSign={practiceSign}
          onClearPracticeSign={() => setPracticeSign(null)}
        />
      )}

      {/* Liquid Glass Floating Sentence / Word Bar */}
      {hasStarted && (
        <SentenceOutputBox
          builder={sentenceBuilder}
          activeLanguage={activeLanguage}
          uiLanguage={uiLanguage}
        />
      )}

      {/* Streamlined Bottom Dock: Camera Flip, Pause/Play, Drawer Menu */}
      {hasStarted && (
        <ControlBar
          facingMode={facingMode}
          isPaused={isPaused}
          onToggleFacingMode={toggleFacingMode}
          onTogglePause={togglePause}
          onOpenSettingsMenu={() => setIsSettingsMenuOpen(true)}
          uiLanguage={uiLanguage}
        />
      )}

      {/* New Liquid Glass Drawer / Settings Modal */}
      <SettingsMenuModal
        isOpen={isSettingsMenuOpen}
        onClose={() => setIsSettingsMenuOpen(false)}
        showSkeleton={showSkeleton}
        onToggleSkeleton={() => setShowSkeleton((prev) => !prev)}
        onOpenDatasetStudio={() => setIsDatasetStudioOpen(true)}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        activeSignLanguage={activeLanguage}
        onSelectSignLanguage={setActiveLanguage}
        uiLanguage={uiLanguage}
        onSelectUiLanguage={setUiLanguage}
        isCustomModelActive={isCustomModelActive}
      />

      {/* Permanent ASL & TID Sign Alphabet Library Modal */}
      <SignLibraryModal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        activeLanguage={activeLanguage}
        onSelectLanguage={setActiveLanguage}
        onSelectPracticeSign={(sign) => setPracticeSign(sign)}
      />

      {/* Dataset & In-Browser Model Training Studio */}
      <DatasetStudio
        isOpen={isDatasetStudioOpen}
        onClose={() => setIsDatasetStudioOpen(false)}
        landmarks={landmarks}
        isCustomModelActive={isCustomModelActive}
        onCustomModelToggled={setIsCustomModelActive}
      />

      {/* Orientation Notice */}
      <MobileNotice
        isPortrait={isPortrait}
        isMobileDevice={isMobileDevice}
        isGuideOpen={isGuideOpen}
        onCloseGuide={() => setIsGuideOpen(false)}
      />

      {/* PWA Home Screen Installation Banner */}
      <InstallPromptBanner />
    </main>
  );
};
