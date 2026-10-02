"use client";

import React, { useState } from "react";
import {
  X,
  Camera,
  Play,
  Square,
  Download,
  Trash2,
  Cpu,
  Database,
  Layers,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useDatasetCollector } from "../../hooks/useDatasetCollector";
import { NormalizedLandmark } from "../../lib/mediapipe/types";

interface DatasetStudioProps {
  isOpen: boolean;
  onClose: () => void;
  landmarks: NormalizedLandmark[][];
  onCustomModelToggled?: (enabled: boolean) => void;
  isCustomModelActive?: boolean;
}

export const DatasetStudio: React.FC<DatasetStudioProps> = ({
  isOpen,
  onClose,
  landmarks,
  onCustomModelToggled,
  isCustomModelActive = false,
}) => {
  const [activeTab, setActiveTab] = useState<"record" | "dataset" | "train">("record");
  const [signLabel, setSignLabel] = useState<string>("");
  const [sampleTarget, setSampleTarget] = useState<number>(50);

  const {
    stats,
    isRecording,
    countdown,
    activeLabel,
    targetCount,
    recordedCount,
    isTraining,
    trainingProgress,
    trainingResult,
    isModelReady,
    startBurstRecording,
    stopRecording,
    captureSingleFrame,
    deleteClass,
    clearDataset,
    exportJSON,
    exportCSV,
    trainModel,
  } = useDatasetCollector(landmarks);

  if (!isOpen) return null;

  const isHandInView = landmarks.length > 0 && landmarks[0]?.length === 21;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl text-white max-h-[92vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Dataset & Model Studio</h2>
              <p className="text-xs text-slate-400">
                {stats.totalSamples} samples across {stats.classes.length} signs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 px-4 pt-2">
          <button
            onClick={() => setActiveTab("record")}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === "record"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Camera className="w-4 h-4" />
            Record Signs
          </button>
          <button
            onClick={() => setActiveTab("dataset")}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === "dataset"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Dataset ({stats.classes.length})
          </button>
          <button
            onClick={() => setActiveTab("train")}
            className={`flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-all ${
              activeTab === "train"
                ? "border-sky-500 text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-4 h-4" />
            Train & Export
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: RECORD SIGNS */}
          {activeTab === "record" && (
            <div className="space-y-4">
              {/* Hand Detection Status Pill */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium ${
                  isHandInView
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-amber-500/10 border-amber-500/30 text-amber-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      isHandInView ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    }`}
                  />
                  <span>
                    {isHandInView
                      ? "Hand detected in camera view (21 landmarks ready)"
                      : "No hand in view — show your hand to the camera"}
                  </span>
                </div>
              </div>

              {/* Countdown Overlay */}
              {countdown !== null && (
                <div className="p-6 rounded-2xl bg-sky-950/80 border border-sky-500/40 text-center animate-in zoom-in-95">
                  <span className="text-xs font-semibold uppercase text-sky-400 tracking-wider">
                    Get Ready To Sign: &quot;{activeLabel}&quot;
                  </span>
                  <div className="text-6xl font-black text-white mt-2 animate-bounce">
                    {countdown}
                  </div>
                  <p className="text-xs text-sky-200 mt-2">Hold your hand steady in position</p>
                </div>
              )}

              {/* Active Recording Progress */}
              {isRecording && (
                <div className="p-5 rounded-2xl bg-slate-800/90 border border-sky-500/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
                      <span className="text-sm font-bold text-white">
                        Recording &quot;{activeLabel}&quot;
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-sky-400">
                      {recordedCount} / {targetCount} frames
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-sky-400 to-emerald-400 h-2.5 rounded-full transition-all duration-100"
                      style={{ width: `${Math.min(100, (recordedCount / targetCount) * 100)}%` }}
                    />
                  </div>

                  <button
                    onClick={stopRecording}
                    className="w-full py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Square className="w-4 h-4 fill-current" />
                    Stop Recording
                  </button>
                </div>
              )}

              {!isRecording && countdown === null && (
                <div className="space-y-4">
                  {/* Sign Label Input */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Sign / Gesture Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Merhaba, Ben, Sen, Nasılsın, İyiyim"
                      value={signLabel}
                      onChange={(e) => setSignLabel(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 text-sm"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {["Merhaba", "Nasılsın", "Ben", "İyiyim", "Sen"].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setSignLabel(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                            signLabel === preset
                              ? "bg-sky-500/20 border-sky-400 text-sky-300"
                              : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white"
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Frame Count */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Target Burst Samples
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[30, 50, 100].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setSampleTarget(count)}
                          className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                            sampleTarget === count
                              ? "bg-sky-500/20 border-sky-500 text-sky-300"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {count} Frames
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 space-y-2.5">
                    <button
                      disabled={!signLabel.trim()}
                      onClick={() => startBurstRecording(signLabel, sampleTarget)}
                      className="w-full py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-500/25 active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      Start 3s Burst Record ({sampleTarget} frames)
                    </button>

                    <button
                      disabled={!signLabel.trim() || !isHandInView}
                      onClick={() => captureSingleFrame(signLabel)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      Capture Single Snapshot
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DATASET EXPLORER */}
          {activeTab === "dataset" && (
            <div className="space-y-4">
              {stats.classes.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Database className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm font-semibold">No signs recorded yet</p>
                  <p className="text-xs mt-1">Go to the &quot;Record Signs&quot; tab to record your first gesture.</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Recorded Classes
                    </span>
                    <button
                      onClick={clearDataset}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {stats.classes.map((cls) => (
                      <div
                        key={cls}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/60"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-white">{cls}</h4>
                          <span className="text-xs text-sky-400 font-medium">
                            {stats.classCounts[cls]} samples recorded
                          </span>
                        </div>
                        <button
                          onClick={() => deleteClass(cls)}
                          className="p-2 text-slate-400 hover:text-rose-400 transition-colors rounded-lg hover:bg-slate-700/50"
                          title={`Delete ${cls}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: TRAIN & EXPORT */}
          {activeTab === "train" && (
            <div className="space-y-4">
              {/* Training section */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-sky-400" />
                  <h3 className="font-bold text-sm text-white">In-Browser Neural Network</h3>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Train a lightweight TensorFlow.js model directly on this device using your recorded
                  landmarks (63 features per sample).
                </p>

                {/* Training progress */}
                {isTraining && trainingProgress && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-sky-500/40 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-sky-400 font-semibold">
                        Epoch {trainingProgress.epoch} / {trainingProgress.totalEpochs}
                      </span>
                      <span className="text-emerald-400 font-bold">
                        Acc: {trainingProgress.accuracy}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-sky-400 h-2 rounded-full transition-all"
                        style={{
                          width: `${(trainingProgress.epoch / trainingProgress.totalEpochs) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Training result banner */}
                {trainingResult && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                      trainingResult.success
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/15 border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {trainingResult.success ? (
                      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{trainingResult.message}</span>
                  </div>
                )}

                <button
                  disabled={isTraining || stats.classes.length < 2 || stats.totalSamples < 10}
                  onClick={() => trainModel(30)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <Cpu className="w-4 h-4" />
                  {isTraining ? "Training in Browser..." : "Train Model Now (30 Epochs)"}
                </button>

                {stats.classes.length < 2 && (
                  <p className="text-[11px] text-amber-400 italic">
                    * Need at least 2 different sign classes to train a classifier.
                  </p>
                )}

                {/* Model Activation Toggle */}
                {isModelReady && onCustomModelToggled && (
                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">
                        Use Custom Model in Live Detection
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Override default gestures with trained model
                      </span>
                    </div>
                    <button
                      onClick={() => onCustomModelToggled(!isCustomModelActive)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCustomModelActive
                          ? "bg-sky-500 text-white"
                          : "bg-slate-700 text-slate-300 hover:text-white"
                      }`}
                    >
                      {isCustomModelActive ? "Active" : "Activate"}
                    </button>
                  </div>
                )}
              </div>

              {/* Export dataset section */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Export Dataset Files
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    disabled={stats.totalSamples === 0}
                    onClick={exportJSON}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-sky-400" />
                    Export JSON
                  </button>
                  <button
                    disabled={stats.totalSamples === 0}
                    onClick={exportCSV}
                    className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
