import { useState, useEffect, useRef, useCallback } from "react";
import { SignPrediction } from "../lib/mediapipe/types";
import { SignLanguage } from "../lib/signLibrary";
import { UIAppLanguage } from "../components/SettingsMenuModal";
import { translateSign } from "./useTranslation";

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

// Helper to extract and translate a single letter / word from gesture name based on active UI language
function cleanSignChar(sign: string, uiLang: UIAppLanguage = "tr"): string {
  const s = sign.trim();
  // Check if it's "Letter X" or "X Harfi"
  const letterMatch = s.match(/(?:Letter|Harfi|Harf)\s*([A-Za-zÇĞİÖŞÜçğıöşü])/i);
  if (letterMatch && letterMatch[1]) {
    return letterMatch[1].toUpperCase();
  }

  // Use dynamic i18n sign translation
  const translated = translateSign(s, uiLang);
  if (translated && translated !== s) {
    return translated;
  }

  // If already a single character or short word
  if (s.length <= 2) {
    return s.toUpperCase();
  }

  return translated || s;
}

/**
 * Intelligent Multilingual Grammar Refinement Helper
 * Cleans up raw sign sequences into natural, coherent sentences with proper spacing across TR, EN, DE, IT
 */
function refineSentenceByLanguage(raw: string, uiLang: UIAppLanguage = "tr"): string {
  if (!raw) return "";

  let text = raw.trim();

  // 1. TURKISH RULES
  if (uiLang === "tr") {
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
  }

  // 2. ENGLISH RULES
  if (uiLang === "en") {
    const enGrammarRules: [RegExp, string][] = [
      [/\bHELLO\s+HOW ARE YOU\b/gi, "Hello, how are you?"],
      [/\bYOU\s+HOW ARE YOU\b/gi, "How are you?"],
      [/\b(?:ME|I)\s+I'M FINE\b/gi, "I am fine"],
      [/\bI'M FINE\s+YOU\b/gi, "I'm fine, and you?"],
      [/\b(?:ME|I)\s+YOU\b/gi, "You and me"],
    ];

    for (const [pattern, replacement] of enGrammarRules) {
      text = text.replace(pattern, replacement);
    }
  }

  // 3. GERMAN RULES
  if (uiLang === "de") {
    const deGrammarRules: [RegExp, string][] = [
      [/\bHALLO\s+WIE GEHT'S\b/gi, "Hallo, wie geht's?"],
      [/\bDU\s+WIE GEHT'S\b/gi, "Wie geht's dir?"],
      [/\bICH\s+MIR GEHT'S GUT\b/gi, "Mir geht's gut"],
      [/\bMIR GEHT'S GUT\s+DU\b/gi, "Mir geht's gut, und dir?"],
      [/\bICH\s+DU\b/gi, "Du und ich"],
    ];

    for (const [pattern, replacement] of deGrammarRules) {
      text = text.replace(pattern, replacement);
    }
  }

  // 4. ITALIAN RULES
  if (uiLang === "it") {
    const itGrammarRules: [RegExp, string][] = [
      [/\bCIAO\s+COME STAI\b/gi, "Ciao, come stai?"],
      [/\bTU\s+COME STAI\b/gi, "Come stai?"],
      [/\bIO\s+STO BENE\b/gi, "Sto bene"],
      [/\bSTO BENE\s+TU\b/gi, "Sto bene, e tu?"],
      [/\bIO\s+TU\b/gi, "Tu ed io"],
    ];

    for (const [pattern, replacement] of itGrammarRules) {
      text = text.replace(pattern, replacement);
    }
  }

  return text;
}

export function useSentenceBuilder(
  predictions: SignPrediction[],
  isPaused: boolean,
  activeLanguage: SignLanguage = "TID",
  uiLanguage: UIAppLanguage = "tr"
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

  // Append character or word to sentence with smart auto-spacing and grammar
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
      return refineSentenceByLanguage(updated, uiLanguage);
    });
  }, [uiLanguage]);

  // Real-time gesture hold & commit loop
  useEffect(() => {
    if (isPaused || !currentSign) {
      holdStartTimeRef.current = null;
      isCommittedForCurrentHoldRef.current = false;
      setHoldingSign(null);
      setHoldProgress(0);
      return;
    }

    const cleaned = cleanSignChar(currentSign, uiLanguage);

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
      const langCodes: Record<UIAppLanguage, string> = {
        tr: "tr-TR",
        en: "en-US",
        de: "de-DE",
        it: "it-IT",
      };
      utterance.lang = langCodes[uiLanguage] || (lang === "ASL" ? "en-US" : "tr-TR");
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    },
    [sentence, uiLanguage, activeLanguage]
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

