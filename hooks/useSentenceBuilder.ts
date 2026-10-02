import { useState, useEffect, useRef, useCallback } from "react";
import { SignPrediction } from "../lib/mediapipe/types";
import { SignLanguage } from "../lib/signLibrary";

export interface SentenceBuilderState {
  sentence: string;
  holdingSign: string | null;
  holdProgress: number; // 0 to 100 percentage
  lastCommittedSign: string | null;
  addSpace: () => void;
  backspace: () => void;
  clearSentence: () => void;
  speakSentence: (lang?: SignLanguage) => void;
  copyToClipboard: () => Promise<boolean>;
  manualAppend: (char: string) => void;
}

const HOLD_DURATION_MS = 1200; // 1.2 seconds hold time required to commit

// Helper to extract a single letter / word from gesture name
function cleanSignChar(sign: string): string {
  const s = sign.trim();
  // Check if it's "Letter X" or "X Harfi"
  const letterMatch = s.match(/(?:Letter|Harfi|Harf)\s*([A-Za-zÇĞİÖŞÜçğıöşü])/i);
  if (letterMatch && letterMatch[1]) {
    return letterMatch[1].toUpperCase();
  }

  // Common gesture mapping
  const commonMap: Record<string, string> = {
    Victory: "V",
    Peace: "V",
    Thumb_Up: "👍",
    Thumb_Down: "👎",
    Open_Palm: " ",
    Closed_Fist: "S",
    Pointing_Up: "1",
    ILoveYou: "❤️",
  };

  if (commonMap[s]) {
    return commonMap[s];
  }

  // If already a single character or short word
  if (s.length <= 2) {
    return s.toUpperCase();
  }

  return s;
}

export function useSentenceBuilder(
  predictions: SignPrediction[],
  isPaused: boolean,
  activeLanguage: SignLanguage = "TID"
): SentenceBuilderState {
  const [sentence, setSentence] = useState<string>("");
  const [holdingSign, setHoldingSign] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [lastCommittedSign, setLastCommittedSign] = useState<string | null>(null);

  const holdStartTimeRef = useRef<number | null>(null);
  const isCommittedForCurrentHoldRef = useRef<boolean>(false);
  const animFrameRef = useRef<number | null>(null);

  const topPrediction = predictions[0];
  const currentSign = topPrediction && topPrediction.confidence >= 65 ? topPrediction.sign : null;

  // Append character to sentence
  const appendChar = useCallback((char: string) => {
    if (!char) return;

    // Haptic feedback for mobile
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      navigator.vibrate([45, 30, 45]);
    }

    setSentence((prev) => prev + char);
  }, []);

  // Real-time gesture hold & commit loop
  useEffect(() => {
    if (isPaused || !currentSign) {
      holdStartTimeRef.current = null;
      isCommittedForCurrentHoldRef.current = false;
      setHoldingSign(null);
      setHoldProgress(0);
      return;
    }

    const cleaned = cleanSignChar(currentSign);

    // If holding a new/different sign
    if (holdingSign !== cleaned) {
      setHoldingSign(cleaned);
      holdStartTimeRef.current = performance.now();
      isCommittedForCurrentHoldRef.current = false;
      setHoldProgress(0);
      return;
    }

    // Still holding the same sign
    if (holdStartTimeRef.current !== null && !isCommittedForCurrentHoldRef.current) {
      const updateProgress = () => {
        if (!holdStartTimeRef.current) return;
        const elapsed = performance.now() - holdStartTimeRef.current;
        const progress = Math.min(100, Math.round((elapsed / HOLD_DURATION_MS) * 100));
        setHoldProgress(progress);

        if (elapsed >= HOLD_DURATION_MS && !isCommittedForCurrentHoldRef.current) {
          isCommittedForCurrentHoldRef.current = true;
          setLastCommittedSign(cleaned);
          appendChar(cleaned);
          setHoldProgress(100);
        } else if (!isCommittedForCurrentHoldRef.current) {
          animFrameRef.current = requestAnimationFrame(updateProgress);
        }
      };

      animFrameRef.current = requestAnimationFrame(updateProgress);
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [currentSign, holdingSign, isPaused, appendChar]);

  // Space button
  const addSpace = useCallback(() => {
    setSentence((prev) => (prev.endsWith(" ") ? prev : prev + " "));
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(25);
  }, []);

  // Backspace button
  const backspace = useCallback(() => {
    setSentence((prev) => prev.slice(0, -1));
    if (typeof window !== "undefined" && navigator.vibrate) navigator.vibrate(25);
  }, []);

  // Clear sentence
  const clearSentence = useCallback(() => {
    setSentence("");
    setLastCommittedSign(null);
  }, []);

  // Speak entire composed sentence
  const speakSentence = useCallback(
    (lang: SignLanguage = activeLanguage) => {
      if (!sentence.trim() || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(sentence.trim());
      utterance.lang = lang === "ASL" ? "en-US" : "tr-TR";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    },
    [sentence, activeLanguage]
  );

  // Copy sentence to clipboard
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    if (!sentence || typeof navigator === "undefined" || !navigator.clipboard) return false;
    try {
      await navigator.clipboard.writeText(sentence);
      return true;
    } catch {
      return false;
    }
  }, [sentence]);

  return {
    sentence,
    holdingSign,
    holdProgress,
    lastCommittedSign,
    addSpace,
    backspace,
    clearSentence,
    speakSentence,
    copyToClipboard,
    manualAppend: appendChar,
  };
}
