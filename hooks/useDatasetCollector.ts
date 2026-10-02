import { useState, useEffect, useRef, useCallback } from "react";
import { datasetStorage } from "../lib/dataset/datasetStorage";
import { inBrowserTrainer } from "../lib/dataset/inBrowserTrainer";
import { DatasetStats, LandmarkSample, TrainingProgress } from "../lib/dataset/types";
import { NormalizedLandmark } from "../lib/mediapipe/types";
import { preprocessLandmarks } from "../lib/tfjs/classifier";

export function useDatasetCollector(currentLandmarks: NormalizedLandmark[][]) {
  const [stats, setStats] = useState<DatasetStats>({ totalSamples: 0, classes: [], classCounts: {} });
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeLabel, setActiveLabel] = useState<string>("");
  const [targetCount, setTargetCount] = useState<number>(50);
  const [recordedCount, setRecordedCount] = useState<number>(0);

  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingProgress, setTrainingProgress] = useState<TrainingProgress | null>(null);
  const [trainingResult, setTrainingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isModelReady, setIsModelReady] = useState<boolean>(false);

  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const samplesBufferRef = useRef<LandmarkSample[]>([]);

  // Refresh stats
  const refreshStats = useCallback(() => {
    setStats(datasetStorage.getStats());
  }, []);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  // Record incoming hand landmarks when isRecording is active
  useEffect(() => {
    if (!isRecording || !activeLabel || currentLandmarks.length === 0) return;

    const hand = currentLandmarks[0];
    if (!hand || hand.length !== 21) return;

    const features = preprocessLandmarks(hand);
    if (features.length !== 63) return;

    const sample: LandmarkSample = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      label: activeLabel.trim(),
      features,
      rawLandmarks: hand,
      timestamp: Date.now(),
    };

    datasetStorage.addSample(sample);
    samplesBufferRef.current.push(sample);

    setRecordedCount((prev) => {
      const next = prev + 1;
      if (next >= targetCount) {
        setIsRecording(false);
        refreshStats();
      }
      return next;
    });
  }, [isRecording, activeLabel, currentLandmarks, targetCount, refreshStats]);

  // Start burst recording with 3-second countdown
  const startBurstRecording = useCallback(
    (label: string, count: number = 50) => {
      if (!label.trim()) return;

      setActiveLabel(label.trim());
      setTargetCount(count);
      setRecordedCount(0);
      samplesBufferRef.current = [];
      setCountdown(3);

      let currentSec = 3;
      countdownTimerRef.current = setInterval(() => {
        currentSec -= 1;
        if (currentSec <= 0) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setCountdown(null);
          setIsRecording(true);
        } else {
          setCountdown(currentSec);
        }
      }, 1000);
    },
    []
  );

  // Stop recording manually
  const stopRecording = useCallback(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setCountdown(null);
    setIsRecording(false);
    refreshStats();
  }, [refreshStats]);

  // Capture single frame
  const captureSingleFrame = useCallback(
    (label: string) => {
      if (!label.trim() || currentLandmarks.length === 0) return false;

      const hand = currentLandmarks[0];
      if (!hand || hand.length !== 21) return false;

      const features = preprocessLandmarks(hand);
      if (features.length !== 63) return false;

      const sample: LandmarkSample = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        label: label.trim(),
        features,
        rawLandmarks: hand,
        timestamp: Date.now(),
      };

      datasetStorage.addSample(sample);
      refreshStats();
      return true;
    },
    [currentLandmarks, refreshStats]
  );

  // Delete all samples of a sign class
  const deleteClass = useCallback(
    (label: string) => {
      datasetStorage.deleteClass(label);
      refreshStats();
    },
    [refreshStats]
  );

  // Clear entire dataset
  const clearDataset = useCallback(() => {
    datasetStorage.clear();
    refreshStats();
  }, [refreshStats]);

  // Export functions
  const exportJSON = useCallback(() => datasetStorage.exportJSON(), []);
  const exportCSV = useCallback(() => datasetStorage.exportCSV(), []);

  // Train in-browser model on collected dataset
  const trainModel = useCallback(async (epochs: number = 30) => {
    setIsTraining(true);
    setTrainingResult(null);
    setTrainingProgress(null);

    const dataset = datasetStorage.getDataset();
    const result = await inBrowserTrainer.train(dataset, epochs, (progress) => {
      setTrainingProgress(progress);
    });

    setIsTraining(false);
    setTrainingResult(result);
    setIsModelReady(result.success);
  }, []);

  return {
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
    refreshStats,
  };
}
