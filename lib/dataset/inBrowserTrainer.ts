import * as tf from "@tensorflow/tfjs";
import { SignDataset, TrainingProgress } from "./types";
import { NormalizedLandmark } from "../mediapipe/types";
import { preprocessLandmarks } from "../tfjs/classifier";

export class InBrowserTrainer {
  private model: tf.LayersModel | null = null;
  private classes: string[] = [];
  private isTraining: boolean = false;

  public async train(
    dataset: SignDataset,
    epochs: number = 30,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<{ success: boolean; message: string }> {
    if (this.isTraining) {
      return { success: false, message: "A training session is already in progress." };
    }

    if (!dataset.samples || dataset.samples.length < 10) {
      return {
        success: false,
        message: "Need at least 10 samples to train. Please record more samples.",
      };
    }

    // Extract unique classes
    const uniqueClasses = Array.from(new Set(dataset.samples.map((s) => s.label))).sort();
    if (uniqueClasses.length < 2) {
      return {
        success: false,
        message: "Need at least 2 different sign classes to train a classifier.",
      };
    }

    this.classes = uniqueClasses;
    this.isTraining = true;

    try {
      await tf.ready();

      // Prepare tensors
      const rawInputs: number[][] = [];
      const rawLabels: number[] = [];

      for (const sample of dataset.samples) {
        if (sample.features && sample.features.length === 63) {
          rawInputs.push(sample.features);
          rawLabels.push(uniqueClasses.indexOf(sample.label));
        }
      }

      if (rawInputs.length === 0) {
        return { success: false, message: "No valid 63-feature landmark samples found." };
      }

      const xs = tf.tensor2d(rawInputs);
      const ys = tf.oneHot(tf.tensor1d(rawLabels, "int32"), uniqueClasses.length);

      // Build model
      const model = tf.sequential();
      model.add(
        tf.layers.dense({
          inputShape: [63],
          units: 64,
          activation: "relu",
          kernelInitializer: "heNormal",
        })
      );
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(
        tf.layers.dense({
          units: 32,
          activation: "relu",
        })
      );
      model.add(
        tf.layers.dense({
          units: uniqueClasses.length,
          activation: "softmax",
        })
      );

      model.compile({
        optimizer: tf.train.adam(0.005),
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
      });

      await model.fit(xs, ys, {
        epochs,
        batchSize: Math.min(16, rawInputs.length),
        shuffle: true,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            if (onProgress && logs) {
              onProgress({
                epoch: epoch + 1,
                totalEpochs: epochs,
                loss: Number(logs.loss?.toFixed(4) || 0),
                accuracy: Number(((logs.acc || logs.accuracy || 0) * 100).toFixed(1)),
              });
            }
          },
        },
      });

      // Cleanup input tensors
      xs.dispose();
      ys.dispose();

      this.model = model;
      this.isTraining = false;

      return {
        success: true,
        message: `Successfully trained model on ${rawInputs.length} samples across ${uniqueClasses.length} signs!`,
      };
    } catch (err: any) {
      this.isTraining = false;
      console.error("In-browser training error:", err);
      return { success: false, message: err.message || "Training failed." };
    }
  }

  /**
   * Run real-time prediction using the freshly trained in-browser model
   */
  public predict(landmarks: NormalizedLandmark[]): { label: string; confidence: number } | null {
    if (!this.model || this.classes.length === 0) return null;

    const features = preprocessLandmarks(landmarks);
    if (features.length !== 63) return null;

    return tf.tidy(() => {
      const input = tf.tensor2d([features], [1, 63]);
      const pred = this.model!.predict(input) as tf.Tensor;
      const scores = pred.dataSync();

      let maxIdx = 0;
      let maxScore = -1;
      for (let i = 0; i < scores.length; i++) {
        if (scores[i] > maxScore) {
          maxScore = scores[i];
          maxIdx = i;
        }
      }

      return {
        label: this.classes[maxIdx] || "Unknown",
        confidence: Math.round(maxScore * 100),
      };
    });
  }

  /**
   * Download the trained model artifacts (.json + weights.bin)
   */
  public async exportModel(): Promise<void> {
    if (!this.model) return;
    await this.model.save("downloads://sign_vision_custom_model");
  }

  public isReady(): boolean {
    return this.model !== null;
  }

  public getClasses(): string[] {
    return this.classes;
  }
}

export const inBrowserTrainer = new InBrowserTrainer();
