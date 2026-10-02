import { FilesetResolver, GestureRecognizer, HandLandmarker } from "@mediapipe/tasks-vision";
import { GestureRecognitionResult, HandLandmarkResult } from "./types";

const WASM_CDN_PATH = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm";
const DEFAULT_GESTURE_MODEL = "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task";

class MediaPipeDetectorManager {
  private static instance: MediaPipeDetectorManager | null = null;
  private gestureRecognizer: GestureRecognizer | null = null;
  private handLandmarker: HandLandmarker | null = null;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): MediaPipeDetectorManager {
    if (!MediaPipeDetectorManager.instance) {
      MediaPipeDetectorManager.instance = new MediaPipeDetectorManager();
    }
    return MediaPipeDetectorManager.instance;
  }

  /**
   * Initializes the MediaPipe Gesture Recognizer (includes 21 hand landmarks + gesture detection)
   */
  public async initialize(modelPath: string = DEFAULT_GESTURE_MODEL): Promise<void> {
    if (typeof window === "undefined") {
      return;
    }

    if (this.gestureRecognizer) {
      return;
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN_PATH);

        this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: modelPath,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        console.log("MediaPipe GestureRecognizer initialized successfully with GPU delegate.");
      } catch (error) {
        console.warn("GPU delegate initialization failed, attempting fallback to CPU...", error);
        try {
          const vision = await FilesetResolver.forVisionTasks(WASM_CDN_PATH);
          this.gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: modelPath,
              delegate: "CPU",
            },
            runningMode: "VIDEO",
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
          console.log("MediaPipe GestureRecognizer initialized successfully with CPU fallback.");
        } catch (fallbackError) {
          console.error("Failed to initialize MediaPipe GestureRecognizer:", fallbackError);
          throw fallbackError;
        }
      } finally {
        this.isInitializing = false;
      }
    })();

    return this.initPromise;
  }

  /**
   * Processes a video frame in real time and returns recognized gestures and 21 hand landmarks.
   */
  public detectGestures(video: HTMLVideoElement, timestamp: number): GestureRecognitionResult | null {
    if (!this.gestureRecognizer) {
      return null;
    }

    try {
      const results = this.gestureRecognizer.recognizeForVideo(video, timestamp);
      return {
        landmarks: results.landmarks || [],
        worldLandmarks: results.worldLandmarks || [],
        handednesses: (results.handednesses as any) || [],
        gestures: (results.gestures as any) || [],
      };
    } catch (err) {
      console.error("Error recognizing gestures in video frame:", err);
      return null;
    }
  }

  /**
   * Check if the detector has finished loading and is ready for inference
   */
  public isReady(): boolean {
    return this.gestureRecognizer !== null;
  }

  /**
   * Release and clean up MediaPipe resources
   */
  public close(): void {
    if (this.gestureRecognizer) {
      this.gestureRecognizer.close();
      this.gestureRecognizer = null;
    }
    this.isInitializing = false;
    this.initPromise = null;
  }
}

export const mediaPipeManager = MediaPipeDetectorManager.getInstance();
