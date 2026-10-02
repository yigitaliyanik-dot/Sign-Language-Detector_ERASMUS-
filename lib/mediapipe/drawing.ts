import { NormalizedLandmark } from "./types";

// MediaPipe 21 Hand Landmark connections
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index finger
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle finger
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring finger
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17],
];

export interface DrawOptions {
  connectorColor?: string;
  landmarkColor?: string;
  landmarkRadius?: number;
  connectorLineWidth?: number;
  isMirrored?: boolean;
  scaleX?: number;
  scaleY?: number;
  offsetX?: number;
  offsetY?: number;
}

const DEFAULT_OPTIONS = {
  connectorColor: "rgba(59, 130, 246, 0.8)", // Bright Tailwind blue
  landmarkColor: "#38bdf8", // Sky blue glow
  landmarkRadius: 4,
  connectorLineWidth: 2.5,
  isMirrored: false,
};

/**
 * Draws hand landmarks and skeletal connections on an HTML canvas,
 * with full support for mobile resolution auto-scaling and letterbox/crop offsets.
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  options: DrawOptions = {}
) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const renderWidth = opts.scaleX ?? width;
  const renderHeight = opts.scaleY ?? height;
  const offsetX = opts.offsetX ?? 0;
  const offsetY = opts.offsetY ?? 0;

  // Helper to map normalized coordinates to canvas pixels without aspect ratio distortion
  const getCoords = (lm: NormalizedLandmark) => {
    const normX = opts.isMirrored ? 1 - lm.x : lm.x;
    const x = offsetX + normX * renderWidth;
    const y = offsetY + lm.y * renderHeight;
    return { x, y };
  };

  // 1. Draw connections
  ctx.save();
  ctx.strokeStyle = opts.connectorColor;
  ctx.lineWidth = opts.connectorLineWidth;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = opts.connectorColor;
  ctx.shadowBlur = 6;

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end) continue;

    const p1 = getCoords(start);
    const p2 = getCoords(end);

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  }
  ctx.restore();

  // 2. Draw landmark points
  ctx.save();
  for (let i = 0; i < landmarks.length; i++) {
    const lm = landmarks[i];
    const p = getCoords(lm);

    // Differentiate fingertips (4, 8, 12, 16, 20) with accent color
    const isFingertip = [4, 8, 12, 16, 20].includes(i);
    const isWrist = i === 0;

    ctx.beginPath();
    ctx.arc(
      p.x,
      p.y,
      isFingertip ? opts.landmarkRadius * 1.4 : opts.landmarkRadius,
      0,
      2 * Math.PI
    );

    if (isFingertip) {
      ctx.fillStyle = "#ec4899"; // Pink highlight for fingertips
      ctx.shadowColor = "#f43f5e";
      ctx.shadowBlur = 8;
    } else if (isWrist) {
      ctx.fillStyle = "#10b981"; // Emerald for wrist base
      ctx.shadowColor = "#10b981";
      ctx.shadowBlur = 6;
    } else {
      ctx.fillStyle = opts.landmarkColor;
      ctx.shadowColor = opts.landmarkColor;
      ctx.shadowBlur = 4;
    }

    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  ctx.restore();
}
