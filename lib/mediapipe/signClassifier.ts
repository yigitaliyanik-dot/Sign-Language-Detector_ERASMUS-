import { GestureCategory, NormalizedLandmark, SignPrediction } from "./types";

// Common sign language gestures and contextual translations
const SIGN_DICTIONARY: Record<string, { en: string; tr: string; description: string }> = {
  Thumb_Up: { en: "Good / Yes", tr: "İyi / Evet", description: "Thumbs Up approval" },
  Thumb_Down: { en: "Bad / No", tr: "Kötü / Hayır", description: "Thumbs Down disapproval" },
  Victory: { en: "Peace / Letter V / Two", tr: "Barış / V Harfi / İki", description: "Index and middle finger up" },
  Open_Palm: { en: "Hello / Stop / Letter B", tr: "Merhaba / Dur / B Harfi", description: "Open 5 fingers palm" },
  Closed_Fist: { en: "Letter S / Power", tr: "S Harfi / Güç", description: "Closed fist" },
  Pointing_Up: { en: "Number One / You / Above", tr: "Bir / Sen / Yukarı", description: "Single index pointing up" },
  ILoveYou: { en: "I Love You (ASL)", tr: "Seni Seviyorum", description: "Thumb, index, and pinky extended" },
};

/**
 * Maps MediaPipe gesture categories and hand landmarks to recognized sign language concepts.
 */
export function interpretSignLanguage(
  gestures: GestureCategory[][],
  landmarks: NormalizedLandmark[][],
  handednesses: any[]
): SignPrediction[] {
  const predictions: SignPrediction[] = [];

  for (let i = 0; i < gestures.length; i++) {
    const handGestures = gestures[i];
    const handLandmarks = landmarks[i];
    const handInfo = handednesses[i]?.[0];

    const topGesture = handGestures?.[0];
    const handedness = (handInfo?.categoryName === "Left" || handInfo?.categoryName === "Right")
      ? handInfo.categoryName
      : "Unknown";

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
