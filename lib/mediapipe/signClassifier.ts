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
  handSize2D: number;
}

class HandMotionTracker {
  private history: HistorySample[] = [];
  private readonly maxWindowMs = 1400; // 1.4s tracking window
  private lastForwardStrokeTime: number = 0;

  public addSample(landmarks: NormalizedLandmark[], now: number = performance.now()): void {
    if (!landmarks || landmarks.length < 21) return;

    const wrist = landmarks[0];
    const middleTip = landmarks[12];
    const handSize2D = Math.sqrt(
      Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2)
    );

    this.history.push({
      time: now,
      wristX: wrist.x,
      wristY: wrist.y,
      wristZ: wrist.z || 0,
      middleTipX: middleTip.x,
      middleTipY: middleTip.y,
      middleTipZ: middleTip.z || 0,
      indexTipX: landmarks[8].x,
      indexTipY: landmarks[8].y,
      indexTipZ: landmarks[8].z || 0,
      handSize2D,
    });

    const cutoff = now - this.maxWindowMs;
    this.history = this.history.filter((s) => s.time >= cutoff);

    // Evaluate forward push trajectory from chest area
    this.evaluateForwardPushTrajectory(now);
  }

  private evaluateForwardPushTrajectory(now: number): void {
    if (this.history.length < 5) return;
    const newest = this.history[this.history.length - 1];

    // Search for a start point in the chest area within the last 200ms - 850ms
    for (let i = 0; i < this.history.length - 2; i++) {
      const start = this.history[i];
      const dt = newest.time - start.time;
      if (dt < 180 || dt > 850) continue;

      // Check if start position was in the chest region (Y > 0.36)
      const startedInChest = start.wristY > 0.36;
      if (!startedInChest) continue;

      // Check forward movement towards camera:
      // 1. Depth change in MediaPipe coordinates (negative delta Z)
      const deltaWristZ = newest.wristZ - start.wristZ;
      const deltaTipZ = newest.middleTipZ - start.middleTipZ;
      const isDepthForward = (deltaWristZ < -0.028 || deltaTipZ < -0.034);

      // 2. Perspective scale expansion as hand moves forward
      const scaleRatio = newest.handSize2D / (start.handSize2D || 0.001);
      const isScaleForward = scaleRatio > 1.14;

      // 3. Hand moves forward / level (not just dropping to floor)
      const notFalling = newest.wristY <= start.wristY + 0.12;

      if ((isDepthForward || isScaleForward) && notFalling && !this.isWaving()) {
        this.lastForwardStrokeTime = now;
        break;
      }
    }
  }

  /**
   * Detects waving motion (repetitive left-right horizontal oscillation) -> Merhaba
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
   * Returns true if hands were pushed forward from the chest area in an open forward trajectory -> Nasılsın
   */
  public isForwardPushFromChest(now: number = performance.now()): boolean {
    return (now - this.lastForwardStrokeTime) < 950;
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
 * distinguishing dynamic gestures ("Merhaba", "Nasılsın") from static gestures ("Open Palm", "Ben", "Sen", "İyiyim").
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
    // - "Merhaba": Open hands waving side-to-side (horizontal oscillation)
    // - "Nasılsın": Open hands pushed forward from the chest towards the camera (forward trajectory)
    // - "Open Palm": Hands held steady/static in the air without forward stroke from chest
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
      }

      if (tracker.isForwardPushFromChest(now)) {
        predictions.push({
          sign: "Nasılsın",
          translatedText: "Nasılsın? (How are you?)",
          confidence: 93,
          handedness,
          landmarks: handLandmarks,
          timestamp: Date.now(),
        });
        continue;
      }

      // Static and stationary open hand held in air -> Strictly "Open Palm"
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

    // 2. "BEN" (ME) VS "SEN" (YOU) VS "POINTING UP" (BIR) - VECTOR ORIENTATION:
    if (isSingleIndex || (topGesture?.categoryName === "Pointing_Up" && !ext.middle)) {
      const vx = handLandmarks[8].x - handLandmarks[5].x;
      const vy = handLandmarks[8].y - handLandmarks[5].y;
      const vz = (handLandmarks[8].z || 0) - (handLandmarks[5].z || 0);

      const len = Math.sqrt(vx * vx + vy * vy + vz * vz) || 0.001;
      const nx = vx / len;
      const ny = vy / len;
      const nz = vz / len;

      const pip_tip_z = (handLandmarks[8].z || 0) - (handLandmarks[6].z || 0);

      // "SEN" (YOU): Index finger points forward toward camera/viewer (strongly negative Z)
      if (nz < -0.38 || (vz < -0.032 && pip_tip_z < -0.012)) {
        predictions.push({
          sign: "Sen",
          translatedText: "Sen (You)",
          confidence: Math.min(96, Math.round(86 + Math.abs(nz) * 14)),
          handedness,
          landmarks: handLandmarks,
          timestamp: Date.now(),
        });
        continue;
      }

      // "BEN" (ME / I): Index finger points towards self / chest (positive Z or downward toward chest)
      const isPointingInwardDepth = nz > 0.18 || (vz > 0.022 && pip_tip_z > 0.008);
      const isPointingDownChest = ny > 0.32 && (handLandmarks[8].y > handLandmarks[0].y - 0.05) && vz > -0.02;

      if (isPointingInwardDepth || isPointingDownChest) {
        predictions.push({
          sign: "Ben",
          translatedText: "Ben (Me / I)",
          confidence: Math.min(96, Math.round(86 + Math.max(nz, ny) * 14)),
          handedness,
          landmarks: handLandmarks,
          timestamp: Date.now(),
        });
        continue;
      }

      // Otherwise pointing straight up into air
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

    // 4. STANDARD MEDIAPIPE GESTURES FALLBACK
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


