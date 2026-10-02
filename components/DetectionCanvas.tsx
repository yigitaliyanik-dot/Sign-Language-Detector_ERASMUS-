"use client";

import React, { useEffect, useRef } from "react";
import { NormalizedLandmark } from "../lib/mediapipe/types";
import { drawHandLandmarks } from "../lib/mediapipe/drawing";

interface DetectionCanvasProps {
  landmarks: NormalizedLandmark[][];
  videoRef: React.RefObject<HTMLVideoElement>;
  isMirrored?: boolean;
  showSkeleton?: boolean;
}

export const DetectionCanvas: React.FC<DetectionCanvasProps> = ({
  landmarks,
  videoRef,
  isMirrored = false,
  showSkeleton = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Canvas internal resolution must match CSS client size
    const clientW = video.clientWidth;
    const clientH = video.clientHeight;

    if (clientW === 0 || clientH === 0) return;

    if (canvas.width !== clientW || canvas.height !== clientH) {
      canvas.width = clientW;
      canvas.height = clientH;
    }

    // Clear previous frame
    ctx.clearRect(0, 0, clientW, clientH);

    if (!showSkeleton || landmarks.length === 0) return;

    // Calculate auto-scaling parameters for object-cover to prevent aspect ratio distortion
    const videoW = video.videoWidth || clientW;
    const videoH = video.videoHeight || clientH;

    const scale = Math.max(clientW / videoW, clientH / videoH);
    const renderW = videoW * scale;
    const renderH = videoH * scale;
    const offsetX = (clientW - renderW) / 2;
    const offsetY = (clientH - renderH) / 2;

    // Draw all detected hands with matching scale and offset
    for (const handLandmarks of landmarks) {
      drawHandLandmarks(ctx, handLandmarks, clientW, clientH, {
        isMirrored,
        scaleX: renderW,
        scaleY: renderH,
        offsetX,
        offsetY,
        connectorColor: "rgba(56, 189, 248, 0.85)", // Tailwind sky-400
        landmarkColor: "#38bdf8",
        landmarkRadius: 4.5,
        connectorLineWidth: 3,
      });
    }
  }, [landmarks, videoRef, isMirrored, showSkeleton]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
};
