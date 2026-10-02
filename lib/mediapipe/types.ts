export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface HandLandmarkResult {
  landmarks: NormalizedLandmark[][];
  worldLandmarks?: NormalizedLandmark[][];
  handednesses: Array<Array<{
    index: number;
    score: number;
    categoryName: string;
    displayName: string;
  }>>;
}

export interface GestureCategory {
  categoryName: string;
  score: number;
  displayName?: string;
}

export interface GestureRecognitionResult {
  landmarks: NormalizedLandmark[][];
  worldLandmarks?: NormalizedLandmark[][];
  handednesses: Array<Array<{
    index: number;
    score: number;
    categoryName: string;
    displayName: string;
  }>>;
  gestures: GestureCategory[][];
}

export interface SignPrediction {
  sign: string;
  translatedText: string;
  confidence: number;
  handedness: "Left" | "Right" | "Unknown";
  landmarks?: NormalizedLandmark[];
  timestamp: number;
}

export interface HandLandmarkerConfig {
  numHands?: number;
  minHandDetectionConfidence?: number;
  minHandPresenceConfidence?: number;
  minTrackingConfidence?: number;
  runningMode?: "IMAGE" | "VIDEO";
}

export interface CameraConfig {
  facingMode: "user" | "environment";
  width?: number;
  height?: number;
  fps?: number;
}
