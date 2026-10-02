import { useState, useEffect, useRef, useCallback } from "react";
import { mediaPipeManager } from "../lib/mediapipe/detector";
import { interpretSignLanguage } from "../lib/mediapipe/signClassifier";
import { NormalizedLandmark, SignPrediction } from "../lib/mediapipe/types";

export interface DetectionState {
  landmarks: NormalizedLandmark[][];
  predictions: SignPrediction[];
  fps: number;
  isLoadingModel: boolean;
  modelError: string | null;
  isPaused: boolean;
}

export function useHandDetection(
  videoRef: React.RefObject<HTMLVideoElement>,
  isStreaming: boolean
) {
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[][]>([]);
  const [predictions, setPredictions] = useState<SignPrediction[]>([]);
  const [fps, setFps] = useState<number>(0);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const frameCountRef = useRef<number>(0);
  const fpsTimerRef = useRef<number>(performance.now());
  const isPausedRef = useRef<boolean>(false);

  // Sync ref with state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Initialize MediaPipe detector
  useEffect(() => {
    let isCancelled = false;

    async function loadModel() {
      setIsLoadingModel(true);
      setModelError(null);
      try {
        await mediaPipeManager.initialize();
        if (!isCancelled) {
          setIsLoadingModel(false);
        }
      } catch (err: any) {
        console.error("Failed to initialize MediaPipe:", err);
        if (!isCancelled) {
          setModelError(err.message || "Failed to download MediaPipe vision models.");
          setIsLoadingModel(false);
        }
      }
    }

    loadModel();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Main real-time detection frame loop
  const processFrame = useCallback(() => {
    if (!videoRef.current || !isStreaming || isPausedRef.current) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const video = videoRef.current;
    if (video.readyState >= 2 && mediaPipeManager.isReady()) {
      const now = performance.now();

      // Run inference
      const result = mediaPipeManager.detectGestures(video, now);

      if (result) {
        setLandmarks(result.landmarks || []);

        // Interpret gestures into sign language vocabulary
        const interpreted = interpretSignLanguage(
          result.gestures || [],
          result.landmarks || [],
          result.handednesses || []
        );
        setPredictions(interpreted);
      } else {
        setLandmarks([]);
        setPredictions([]);
      }

      // Calculate real-time FPS
      frameCountRef.current++;
      if (now - fpsTimerRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - fpsTimerRef.current)));
        frameCountRef.current = 0;
        fpsTimerRef.current = now;
      }
    }

    requestRef.current = requestAnimationFrame(processFrame);
  }, [videoRef, isStreaming]);

  // Start/stop loop when streaming starts
  useEffect(() => {
    if (isStreaming && !isLoadingModel) {
      requestRef.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isStreaming, isLoadingModel, processFrame]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return {
    landmarks,
    predictions,
    fps,
    isLoadingModel,
    modelError,
    isPaused,
    togglePause,
  };
}
