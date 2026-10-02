import { GestureCategory, NormalizedLandmark, SignPrediction } from "./types";

// Common sign language gestures and contextual translations including new TİD words
export const SIGN_DICTIONARY: Record<string, { en: string; tr: string; description: string }> = {
  Thumb_Up: { en: "Good / Fine / Yes", tr: "İyiyim / Evet", description: "Thumbs Up approval or good state" },
  Thumb_Down: { en: "Bad / No", tr: "Kötü / Hayır", description: "Thumbs Down disapproval" },
  Victory: { en: "Peace / Letter V / Two", tr: "Barış / V Harfi / İki", description: "Index and middle finger up" },
  Open_Palm: { en: "Open Palm / Stop", tr: "Açık El / Dur", description: "Static open 5 fingers palm" },
  Closed_Fist: { en: "Letter S / Power", tr: "S Harfi / Güç", description: "Closed fist" },
  Pointing_Up: { en: "Number One / Above", tr: "Bir / Yukarı", description: "Single index pointing up" },
  ILoveYou: { en: "I Love You (ASL)", tr: "Seni Seviyorum", description: "Thumb, index, and pinky extended" },
  Merhaba: { en: "Hello / Wave", tr: "Merhaba (El Sallama)", description: "Open hand waving side to side" },
  Ben: { en: "Me / I", tr: "Ben", description: "Index finger pointing towards self / chest" },
  Sen: { en: "You", tr: "Sen", description: "Index finger pointing forward to camera / viewer" },
  İyiyim: { en: "I am fine / Good", tr: "İyiyim", description: "Thumb up / TİD Good gesture" },
  Nasılsın: { en: "How are you?", tr: "Nasılsın?", description: "Questioning hand motion / rocking palm" },
};

interface HistorySample {
  time: number;
  wristX: number;
  wristY: number;
  wristZ: number;
  middleTipX: number;
  middleTipY: number;
  middleTipZ: number;
  indexTipX: number;
  indexTipY: number;
  indexTipZ: number;
}

class HandMotionTracker {
  private history: HistorySample[] = [];
  private readonly maxWindowMs = 1100; // 1.1s tracking window

  public addSample(landmarks: NormalizedLandmark[], now: number = performance.now()): void {
    if (!landmarks || landmarks.length < 21) return;

    this.history.push({
      time: now,
      wristX: landmarks[0].x,
      wristY: landmarks[0].y,
      wristZ: landmarks[0].z || 0,
      middleTipX: landmarks[12].x,
      middleTipY: landmarks[12].y,
      middleTipZ: landmarks[12].z || 0,
      indexTipX: landmarks[8].x,
      indexTipY: landmarks[8].y,
      indexTipZ: landmarks[8].z || 0,
    });

    const cutoff = now - this.maxWindowMs;
    this.history = this.history.filter((s) => s.time >= cutoff);
  }

  /**
   * Detects waving motion (repetitive left-right horizontal oscillation)
   */
  public isWaving(): boolean {
    if (this.history.length < 6) return false;

    const samples = this.history;
    let reversals = 0;
    let lastDirection = 0; // -1: left, +1: right
    let lastExtremumX = samples[0].middleTipX;
    let totalSignificantTravel = 0;

    const minStroke = 0.028; // ~2.8% of screen width

    for (let i = 1; i < samples.length; i++) {
      const dx = samples[i].middleTipX - samples[i - 1].middleTipX;
      if (Math.abs(dx) > 0.002) {
        const dir = dx > 0 ? 1 : -1;
        if (lastDirection !== 0 && dir !== lastDirection) {
          const stroke = Math.abs(samples[i - 1].middleTipX - lastExtremumX);
          if (stroke >= minStroke) {
            reversals++;
            totalSignificantTravel += stroke;
            lastExtremumX = samples[i - 1].middleTipX;
          }
        }
        lastDirection = dir;
      }
    }

    return reversals >= 2 && totalSignificantTravel >= 0.055;
  }

  /**
   * Detects rocking motion (side-to-side tilting or twisting)
   */
  public isRocking(): boolean {
    if (this.history.length < 6) return false;

    let yReversals = 0;
    let lastDir = 0;
    let lastExtremumY = this.history[0].middleTipY;

    for (let i = 1; i < this.history.length; i++) {
      const dy = this.history[i].middleTipY - this.history[i - 1].middleTipY;
      if (Math.abs(dy) > 0.002) {
        const cur = dy > 0 ? 1 : -1;
        if (lastDir !== 0 && cur !== lastDir) {
          const stroke = Math.abs(this.history[i - 1].middleTipY - lastExtremumY);
          if (stroke >= 0.02) {
            yReversals++;
            lastExtremumY = this.history[i - 1].middleTipY;
          }
        }
        lastDir = cur;
      }
    }

    return yReversals >= 2;
  }
}

// Track motion per hand index (0: primary, 1: secondary)
const handTrackers: HandMotionTracker[] = [new HandMotionTracker(), new HandMotionTracker()];

function dist3d(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z || 0) - (b.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function areFingersExtended(landmarks: NormalizedLandmark[]): {
  thumb: boolean;
  index: boolean;
  middle: boolean;
  ring: boolean;
  pinky: boolean;
} {
  const wrist = landmarks[0];
  const mcpMiddle = landmarks[9];

  const thumbExt = dist3d(landmarks[4], mcpMiddle) > dist3d(landmarks[2], mcpMiddle) * 1.15;
  const indexExt = dist3d(landmarks[8], wrist) > dist3d(landmarks[6], wrist) * 1.2;
  const middleExt = dist3d(landmarks[12], wrist) > dist3d(landmarks[10], wrist) * 1.2;
  const ringExt = dist3d(landmarks[16], wrist) > dist3d(landmarks[14], wrist) * 1.2;
  const pinkyExt = dist3d(landmarks[20], wrist) > dist3d(landmarks[18], wrist) * 1.2;

  return { thumb: thumbExt, index: indexExt, middle: middleExt, ring: ringExt, pinky: pinkyExt };
}

/**
 * Maps MediaPipe gesture categories and hand landmarks to recognized sign language concepts,
 * distinguishing dynamic gestures (waving "Merhaba") from static gestures ("Open Palm", "Ben", "Sen", "İyiyim", "Nasılsın").
 */
export function interpretSignLanguage(
  gestures: GestureCategory[][],
  landmarks: NormalizedLandmark[][],
  handednesses: any[]
): SignPrediction[] {
  const predictions: SignPrediction[] = [];
  const now = performance.now();

  for (let i = 0; i < landmarks.length; i++) {
    const handLandmarks = landmarks[i];
    if (!handLandmarks || handLandmarks.length < 21) continue;

    const handGestures = gestures[i] || [];
    const handInfo = handednesses[i]?.[0];
    const topGesture = handGestures[0];

    const handedness =
      handInfo?.categoryName === "Left" || handInfo?.categoryName === "Right"
        ? handInfo.categoryName
        : "Unknown";

    const tracker = handTrackers[i] || handTrackers[0];
    tracker.addSample(handLandmarks, now);

    const ext = areFingersExtended(handLandmarks);
    const isOpenHand =
      (ext.index && ext.middle && ext.ring && ext.pinky) ||
      topGesture?.categoryName === "Open_Palm";

    const isSingleIndex = ext.index && !ext.middle && !ext.ring && !ext.pinky;
    const isThumbOnly = ext.thumb && !ext.index && !ext.middle && !ext.ring && !ext.pinky;

    // 1. DYNAMIC VS STATIC OPEN PALM SEPARATION:
    // If the hand is open, check if it's waving (Merhaba) vs static (Open Palm)
    if (isOpenHand) {
      if (tracker.isWaving()) {
        predictions.push({
          sign: "Merhaba",
          translatedText: "Merhaba (El Sallama)",
          confidence: 94,
          handedness,
          landmarks: handLandmarks,
          timestamp: Date.now(),
        });
        continue;
      } else {
        predictions.push({
          sign: "Open Palm",
          translatedText: "Açık El / Dur (Open Palm)",
          confidence: topGesture?.score ? Math.round(topGesture.score * 100) : 90,
          handedness,
          landmarks: handLandmarks,
          timestamp: Date.now(),
        });
        continue;
      }
    }

    // 2. "BEN" (ME) VS "SEN" (YOU) VS "POINTING UP" (BIR):
    if (isSingleIndex || topGesture?.categoryName === "Pointing_Up") {
      const vz = (handLandmarks[8].z || 0) - (handLandmarks[5].z || 0);
      const vy = handLandmarks[8].y - handLandmarks[5].y;

      // Pointing towards self / chest: positive Z (away from camera / towards signer) or pointing down toward chest
      if (vz > 0.03 || (vy > 0.05 && (handLandmarks[8].z || 0) > (handLandmarks[6].z || 0))) {
        predictions.push({
          sign: "Ben",
          translatedText: "Ben (Me / I)",
          confidence: 90,
          handedness,
          landmarks: handLandmarks,
          timestamp: Date.now(),
        });
        continue;
      }

      // Pointing forward toward camera / viewer: negative Z (closer to camera than MCP)
      if (vz < -0.035 || ((handLandmarks[8].z || 0) < (handLandmarks[6].z || 0) - 0.02)) {
        predictions.push({
          sign: "Sen",
          translatedText: "Sen (You)",
          confidence: 90,
          handedness,
          landmarks: handLandmarks,
          timestamp: Date.now(),
        });
        continue;
      }

      // Otherwise pointing straight up
      predictions.push({
        sign: "Pointing Up",
        translatedText: "Bir / Yukarı (Number One)",
        confidence: topGesture?.score ? Math.round(topGesture.score * 100) : 85,
        handedness,
        landmarks: handLandmarks,
        timestamp: Date.now(),
      });
      continue;
    }

    // 3. "İYİYİM" (GOOD / FINE): Thumbs Up gesture in TİD
    if (topGesture?.categoryName === "Thumb_Up" || isThumbOnly) {
      predictions.push({
        sign: "İyiyim",
        translatedText: "İyiyim / İyi (Fine / Good)",
        confidence: topGesture?.score ? Math.round(topGesture.score * 100) : 92,
        handedness,
        landmarks: handLandmarks,
        timestamp: Date.now(),
      });
      continue;
    }

    // 4. "NASILSIN": Rocking / questioning palm gesture
    if (tracker.isRocking() && (ext.index || ext.middle)) {
      predictions.push({
        sign: "Nasılsın",
        translatedText: "Nasılsın? (How are you?)",
        confidence: 86,
        handedness,
        landmarks: handLandmarks,
        timestamp: Date.now(),
      });
      continue;
    }

    // 5. STANDARD MEDIAPIPE GESTURES FALLBACK
    if (topGesture && topGesture.categoryName !== "None") {
      const dictEntry = SIGN_DICTIONARY[topGesture.categoryName];
      const signLabel = topGesture.categoryName.replace(/_/g, " ");
      const translated = dictEntry ? `${dictEntry.en} (${dictEntry.tr})` : signLabel;

      predictions.push({
        sign: signLabel,
        translatedText: translated,
        confidence: Math.round(topGesture.score * 100),
        handedness,
        landmarks: handLandmarks,
        timestamp: Date.now(),
      });
    }
  }

  return predictions;
}

