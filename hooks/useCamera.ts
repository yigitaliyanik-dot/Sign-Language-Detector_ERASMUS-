import { useState, useRef, useCallback, useEffect } from "react";

export interface CameraState {
  isStreaming: boolean;
  isStarting: boolean;
  hasStarted: boolean;
  facingMode: "user" | "environment";
  error: string | null;
  hasPermission: boolean | null;
  videoDimensions: { width: number; height: number };
}

/**
 * Mobile-first Camera hook:
 * - Defaults to rear camera with `facingMode: { ideal: "environment" }`
 * - Requires explicit user interaction before requesting permissions (compliance with iOS Safari & Android Chrome)
 * - Sets playsInline, autoPlay, and muted for iOS Safari compliance
 * - Auto-scales resolution constraints dynamically for portrait screens
 */
export function useCamera(initialFacingMode: "user" | "environment" = "environment") {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [facingMode, setFacingMode] = useState<"user" | "environment">(initialFacingMode);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  // Stop active camera stream and release media tracks
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsStreaming(false);
    setIsStarting(false);
  }, []);

  // Start camera stream on explicit user action
  const startCamera = useCallback(
    async (mode: "user" | "environment" = facingMode) => {
      stopStream();
      setError(null);
      setIsStarting(true);
      setHasStarted(true);

      if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
        setError("Camera API is not supported on this browser.");
        setIsStarting(false);
        return;
      }

      try {
        const isPortrait =
          typeof window !== "undefined" ? window.innerHeight >= window.innerWidth : true;

        // Resolution auto-scaling constraints optimized for mobile portrait without distortion
        const constraints: MediaStreamConstraints = {
          audio: false,
          video: {
            // Requirement 1: Ideal facingMode prevents OverconstrainedError on varied devices
            facingMode: { ideal: mode },
            // Requirement 4: Resolution auto-scaling for mobile screens
            width: { ideal: isPortrait ? 720 : 1280, min: 480 },
            height: { ideal: isPortrait ? 1280 : 720, min: 480 },
            aspectRatio: { ideal: isPortrait ? 9 / 16 : 16 / 9 },
          },
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = mediaStream;

        const video = videoRef.current;
        if (video) {
          // Requirement 2: iOS Safari constraints programmatic enforcement
          video.setAttribute("playsinline", "true");
          video.setAttribute("webkit-playsinline", "true");
          video.setAttribute("muted", "true");
          video.setAttribute("autoplay", "true");
          video.playsInline = true;
          video.muted = true;
          video.autoplay = true;

          video.srcObject = mediaStream;

          await new Promise<void>((resolve) => {
            const handleMetadata = async () => {
              video.removeEventListener("loadedmetadata", handleMetadata);

              const actualWidth = video.videoWidth || 1280;
              const actualHeight = video.videoHeight || 720;
              setVideoDimensions({ width: actualWidth, height: actualHeight });

              try {
                // Ensure play() is called directly within the execution chain
                await video.play();
                setIsStreaming(true);
                setIsStarting(false);
                setHasPermission(true);
                setFacingMode(mode);
                resolve();
              } catch (playErr) {
                console.warn("Video playback promise blocked by browser autoplay policy:", playErr);
                // Allow stream but notify
                setIsStreaming(true);
                setIsStarting(false);
                setHasPermission(true);
                resolve();
              }
            };

            if (video.readyState >= 1) {
              handleMetadata();
            } else {
              video.addEventListener("loadedmetadata", handleMetadata);
            }
          });
        }
      } catch (err: any) {
        console.error("Camera acquisition failed:", err);
        setIsStarting(false);
        setIsStreaming(false);

        let userMsg = "Failed to start camera.";
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          userMsg =
            "Camera permission was denied. Please allow camera access in your browser or system settings.";
          setHasPermission(false);
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          userMsg = `No camera found matching the requested mode (${mode}).`;
        } else if (err.name === "OverconstrainedError") {
          // Fallback retry with basic video constraints if strict resolution failed
          console.warn("Retrying with minimal camera constraints...");
          try {
            const fallbackStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: mode } },
            });
            streamRef.current = fallbackStream;
            if (videoRef.current) {
              videoRef.current.srcObject = fallbackStream;
              await videoRef.current.play();
              setIsStreaming(true);
              setHasPermission(true);
              setFacingMode(mode);
              return;
            }
          } catch (fallbackErr: any) {
            userMsg = fallbackErr.message || "Failed to initialize camera.";
          }
        } else {
          userMsg = err.message || userMsg;
        }

        setError(userMsg);
      }
    },
    [facingMode, stopStream]
  );

  // Toggle between front ('user') and rear ('environment') cameras
  const toggleFacingMode = useCallback(() => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (hasStarted) {
      startCamera(nextMode);
    }
  }, [facingMode, hasStarted, startCamera]);

  // Clean up media tracks on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    isStreaming,
    isStarting,
    hasStarted,
    facingMode,
    error,
    hasPermission,
    videoDimensions,
    startCamera,
    stopStream,
    toggleFacingMode,
  };
}
