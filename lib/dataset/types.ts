import { NormalizedLandmark } from "../mediapipe/types";

export interface LandmarkSample {
  id: string;
  label: string;
  features: number[]; // 63 features: normalized (x, y, z) relative to wrist
  rawLandmarks?: NormalizedLandmark[];
  handedness?: "Left" | "Right" | "Unknown";
  timestamp: number;
}

export interface SignDataset {
  version: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  samples: LandmarkSample[];
}

export interface DatasetStats {
  totalSamples: number;
  classes: string[];
  classCounts: Record<string, number>;
}

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  loss: number;
  accuracy: number;
}
