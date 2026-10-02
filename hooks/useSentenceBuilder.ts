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

  // Common gesture mapping with natural Turkish vocabulary
  const commonMap: Record<string, string> = {
    Victory: "V",
    Peace: "Barış",
    Thumb_Up: "İyiyim",
    Thumb_Down: "Hayır",
    Open_Palm: "Açık El",
    "Open Palm": "Açık El",
    Closed_Fist: "S",
    Pointing_Up: "Bir",
    "Pointing Up": "Bir",
    ILoveYou: "Seni Seviyorum",
    Merhaba: "Merhaba",
    Nasilsin: "Nasılsın",
    Nasılsın: "Nasılsın",
    Ben: "Ben",
    Sen: "Sen",
    İyiyim: "İyiyim",
    Iyiyim: "İyiyim",
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

/**
 * Intelligent Turkish Grammar Refinement Helper
 * Cleans up raw sign sequences into natural, coherent sentences with proper spacing
 */
function refineTurkishSentence(raw: string): string {
  if (!raw) return "";

  let text = raw.trim();

  // Word replacement dictionary for TİD -> Natural Turkish sentence flow
  const tidGrammarRules: [RegExp, string][] = [
    [/\bMERHABA\s+NASILSIN\b/gi, "Merhaba, nasılsın?"],
    [/\bSEN\s+NASILSIN\b/gi, "Sen nasılsın?"],
    [/\bNASILSIN\s+SEN\b/gi, "Nasılsın?"],
    [/\bBEN\s+İYİYİM\b/gi, "Ben iyiyim"],
    [/\bBEN\s+İYİ\b/gi, "Ben iyiyim"],
    [/\bBEN\s+SEN\b/gi, "Ben ve sen"],
    [/\bİYİYİM\s+SEN\b/gi, "İyiyim, sen?"],
    [/\bBEN\s+GİTMEK\b/gi, "Ben gidiyorum"],
    [/\bSEN\s+GELMEK\b/gi, "Sen geliyor musun?"],
    [/\bBEN\s+SEVMEK\s+SENI\b/gi, "Seni seviyorum"],
    [/\bTEŞEKKÜR\s+EDERİM\b/gi, "Teşekkür ederim"],
    [/\bSAĞ\s+OL\b/gi, "Sağ ol"],
  ];

  for (const [pattern, replacement] of tidGrammarRules) {
    text = text.replace(pattern, replacement);
  }

  return text;
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

  // Append character or word to sentence with smart auto-spacing
  const appendChar = useCallback((token: string) => {
    if (!token) return;

    // Haptic feedback for mobile
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      navigator.vibrate([45, 30, 45]);
    }

    setSentence((prev) => {
      if (!prev) return token;

      const isPrevSingleChar = prev.trim().split(" ").pop()?.length === 1;
      const isCurrentSingleChar = token.length === 1;

      // If spelling out single letters (e.g. A, B, C), join without spaces unless space is explicit
      if (isPrevSingleChar && isCurrentSingleChar) {
        return prev + token;
      }

      // Automatically insert space before adding full words or multi-char tokens
      const needsSpace = !prev.endsWith(" ");
      const updated = needsSpace ? `${prev} ${token}` : prev + token;
      return activeLanguage === "TID" ? refineTurkishSentence(updated) : updated;
    });
  }, [activeLanguage]);

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

