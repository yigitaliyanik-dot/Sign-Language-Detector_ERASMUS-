import * as tf from "@tensorflow/tfjs";
import { NormalizedLandmark } from "../mediapipe/types";

/**
 * Preprocesses 21 MediaPipe hand landmarks (x, y, z) into a 1D feature array of 63 values,
 * normalized relative to the wrist (landmark 0).
 */
export function preprocessLandmarks(landmarks: NormalizedLandmark[]): number[] {
  if (!landmarks || landmarks.length !== 21) {
    return [];
  }

  const wrist = landmarks[0];
  const features: number[] = [];

  for (const lm of landmarks) {
    // Relative coordinates centered on wrist
    features.push(lm.x - wrist.x);
    features.push(lm.y - wrist.y);
    features.push(lm.z - wrist.z);
  }

  return features;
}

export class CustomTFSignClassifier {
  private model: tf.LayersModel | null = null;
  private labels: string[] = [];

  /**
   * Load custom model trained on hand landmark features
   */
  public async loadModel(modelUrl: string, labels: string[]): Promise<void> {
    try {
      await tf.ready();
      this.model = await tf.loadLayersModel(modelUrl);
      this.labels = labels;
      console.log("TensorFlow.js sign language model loaded successfully.");
    } catch (error) {
      console.error("Failed to load TensorFlow.js model:", error);
      throw error;
    }
  }

  /**
   * Run inference on a 21-point landmark array
   */
  public predict(landmarks: NormalizedLandmark[]): { label: string; confidence: number } | null {
    if (!this.model || this.labels.length === 0) return null;

    const features = preprocessLandmarks(landmarks);
    if (features.length !== 63) return null;

    return tf.tidy(() => {
      const inputTensor = tf.tensor2d([features], [1, 63]);
      const prediction = this.model!.predict(inputTensor) as tf.Tensor;
      const probabilities = prediction.dataSync();

      let maxIndex = 0;
      let maxScore = -1;
      for (let i = 0; i < probabilities.length; i++) {
        if (probabilities[i] > maxScore) {
          maxScore = probabilities[i];
          maxIndex = i;
        }
      }

      return {
        label: this.labels[maxIndex] || "Unknown",
        confidence: Math.round(maxScore * 100),
      };
    });
  }

  public isLoaded(): boolean {
    return this.model !== null;
  }
}
