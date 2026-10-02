import { UIAppLanguage } from "../components/SettingsMenuModal";

type Translations = {
  [key in UIAppLanguage]: {
    [key: string]: string;
  };
};

export const translations: Translations = {
  tr: {
    appMenu: "Uygulama Menüsü",
    settingsVisuals: "Ayarlar & Görsel Modeller",
    datasetStudio: "Veri Seti & Eğitim",
    datasetStudioTitle: "Dataset Studio",
    datasetStudioDesc: "Kendi işaret modelinizi eğitin",
    active: "Aktif",
    visualSkeleton: "Görsel İskelet (MediaPipe Hand Mesh)",
    skeletonTitle: "El İskelet Çizimi",
    skeletonDesc: "21 eklem noktasını ekranda göster",
    uiLanguage: "Arayüz Dili (UI Language)",
    confirmChanges: "Değişiklikleri Onaylıyorum",
    alphabetLibrary: "TİD & ASL El Harfleri Kütüphanesi",
    flipCamera: "Kamera Çevir",
    menu: "Menü",
    startCamera: "Kamerayı Başlat",
    detecting: "Algılanıyor",
    makeSign: "İşaret yapın, cümle otomatik oluşturulsun...",
    handDetected: "El Algılandı (Aktif)",
    handDetectionZone: "El Algılama Alanı",
    makingSign: "İşaret yapılıyor...",
    bringHand: "Elinizi çerçeveye getirin",
    startingCamera: "Kamera Başlatılıyor",
    allowCamera: "Lütfen tarayıcınızın kamera iznine onay verin...",
    cameraPermissionRequired: "Kamera İzni Gerekiyor",
    retry: "Yeniden Deneyin",
    visionTitle: "Türk İşaret Dili Vision",
    visionDesc: "MediaPipe ve TensorFlow.js ile anlık, yerel işaret dili çevirisi.",
    cameraFront: "Ön",
    cameraBack: "Arka",
    cameraChangeBeforeStart: "Başlamadan önce kamerayı değiştir",
    cameraLabel: "Kamera:",
    compatible: "iOS Safari ve Android Chrome ile %100 Uyumlu"
  },
  en: {
    appMenu: "App Menu",
    settingsVisuals: "Settings & Visual Models",
    datasetStudio: "Dataset & Training",
    datasetStudioTitle: "Dataset Studio",
    datasetStudioDesc: "Train your own sign model",
    active: "Active",
    visualSkeleton: "Visual Skeleton (MediaPipe Hand Mesh)",
    skeletonTitle: "Hand Skeleton Drawing",
    skeletonDesc: "Show 21 joint points on screen",
    uiLanguage: "UI Language",
    confirmChanges: "I Confirm Changes",
    alphabetLibrary: "TID & ASL Alphabet Library",
    flipCamera: "Flip Camera",
    menu: "Menu",
    startCamera: "Start Camera",
    detecting: "Detecting",
    makeSign: "Make a sign, sentence will be generated...",
    handDetected: "Hand Detected (Active)",
    handDetectionZone: "Hand Detection Zone",
    makingSign: "Making sign...",
    bringHand: "Bring your hand into frame",
    startingCamera: "Starting Camera",
    allowCamera: "Please allow camera permission in your browser...",
    cameraPermissionRequired: "Camera Permission Required",
    retry: "Retry",
    visionTitle: "Turkish Sign Language Vision",
    visionDesc: "Real-time, local sign language translation with MediaPipe and TensorFlow.js.",
    cameraFront: "Front",
    cameraBack: "Back",
    cameraChangeBeforeStart: "Change camera before starting",
    cameraLabel: "Camera:",
    compatible: "100% Compatible with iOS Safari and Android Chrome"
  },
  de: {
    appMenu: "App-Menü",
    settingsVisuals: "Einstellungen & visuelle Modelle",
    datasetStudio: "Datensatz & Training",
    datasetStudioTitle: "Datensatz Studio",
    datasetStudioDesc: "Trainieren Sie Ihr eigenes Zeichenmodell",
    active: "Aktiv",
    visualSkeleton: "Visuelles Skelett (MediaPipe Hand Mesh)",
    skeletonTitle: "Hand-Skelett Zeichnung",
    skeletonDesc: "21 Gelenkpunkte auf dem Bildschirm anzeigen",
    uiLanguage: "Benutzeroberflächensprache",
    confirmChanges: "Änderungen bestätigen",
    alphabetLibrary: "TID & ASL Alphabet Bibliothek",
    flipCamera: "Kamera drehen",
    menu: "Menü",
    startCamera: "Kamera starten",
    detecting: "Erkennen",
    makeSign: "Machen Sie ein Zeichen, der Satz wird erstellt...",
    handDetected: "Hand erkannt (Aktiv)",
    handDetectionZone: "Hand-Erkennungszone",
    makingSign: "Zeichen machen...",
    bringHand: "Bringen Sie Ihre Hand in den Rahmen",
    startingCamera: "Kamera startet",
    allowCamera: "Bitte erlauben Sie die Kameraberechtigung in Ihrem Browser...",
    cameraPermissionRequired: "Kamera-Berechtigung erforderlich",
    retry: "Wiederholen",
    visionTitle: "Türkische Gebärdensprache Vision",
    visionDesc: "Echtzeit, lokale Gebärdensprachübersetzung mit MediaPipe und TensorFlow.js.",
    cameraFront: "Vorne",
    cameraBack: "Hinten",
    cameraChangeBeforeStart: "Kamera vor dem Start ändern",
    cameraLabel: "Kamera:",
    compatible: "100% kompatibel mit iOS Safari und Android Chrome"
  },
  it: {
    appMenu: "Menu App",
    settingsVisuals: "Impostazioni e Modelli Visivi",
    datasetStudio: "Dataset & Allenamento",
    datasetStudioTitle: "Dataset Studio",
    datasetStudioDesc: "Allena il tuo modello di segni",
    active: "Attivo",
    visualSkeleton: "Scheletro Visivo (MediaPipe Hand Mesh)",
    skeletonTitle: "Disegno Scheletro Mano",
    skeletonDesc: "Mostra 21 punti articolari sullo schermo",
    uiLanguage: "Lingua dell'Interfaccia (UI)",
    confirmChanges: "Confermo le Modifiche",
    alphabetLibrary: "Libreria Alfabeto TID & ASL",
    flipCamera: "Ruota Fotocamera",
    menu: "Menu",
    startCamera: "Avvia Fotocamera",
    detecting: "Rilevamento in corso",
    makeSign: "Fai un segno, la frase verrà generata...",
    handDetected: "Mano Rilevata (Attivo)",
    handDetectionZone: "Zona di Rilevamento Mano",
    makingSign: "Facendo il segno...",
    bringHand: "Porta la mano nell'inquadratura",
    startingCamera: "Avvio Fotocamera",
    allowCamera: "Si prega di consentire i permessi della fotocamera nel browser...",
    cameraPermissionRequired: "Permesso Fotocamera Richiesto",
    retry: "Riprova",
    visionTitle: "Visione Lingua dei Segni Turca",
    visionDesc: "Traduzione locale e in tempo reale con MediaPipe e TensorFlow.js.",
    cameraFront: "Fronte",
    cameraBack: "Retro",
    cameraChangeBeforeStart: "Cambia fotocamera prima di iniziare",
    cameraLabel: "Fotocamera:",
    compatible: "Compatibile al 100% con iOS Safari e Android Chrome"
  },
};

export const SIGN_TRANSLATIONS: Record<string, Record<UIAppLanguage, string>> = {
  Merhaba: { tr: "Merhaba", en: "Hello", de: "Hallo", it: "Ciao" },
  Nasilsin: { tr: "Nasılsın", en: "How are you", de: "Wie geht's", it: "Come stai" },
  Nasılsın: { tr: "Nasılsın", en: "How are you", de: "Wie geht's", it: "Come stai" },
  Ben: { tr: "Ben", en: "Me / I", de: "Ich", it: "Io" },
  Sen: { tr: "Sen", en: "You", de: "Du", it: "Tu" },
  İyiyim: { tr: "İyiyim", en: "I'm fine", de: "Mir geht's gut", it: "Sto bene" },
  Iyiyim: { tr: "İyiyim", en: "I'm fine", de: "Mir geht's gut", it: "Sto bene" },
  Open_Palm: { tr: "Açık El", en: "Open Palm", de: "Offene Hand", it: "Palmo Aperto" },
  "Open Palm": { tr: "Açık El", en: "Open Palm", de: "Offene Hand", it: "Palmo Aperto" },
  Thumb_Up: { tr: "İyiyim / Evet", en: "Good / Yes", de: "Gut / Ja", it: "Bene / Sì" },
  Thumb_Down: { tr: "Hayır", en: "No", de: "Nein", it: "No" },
  Victory: { tr: "Barış / V", en: "Peace / V", de: "Frieden / V", it: "Pace / V" },
  Closed_Fist: { tr: "Yumruk / S", en: "Fist / S", de: "Faust / S", it: "Pugno / S" },
  Pointing_Up: { tr: "Bir / Yukarı", en: "One / Pointing Up", de: "Eins / Nach oben", it: "Uno / In alto" },
  "Pointing Up": { tr: "Bir / Yukarı", en: "One / Pointing Up", de: "Eins / Nach oben", it: "Uno / In alto" },
  ILoveYou: { tr: "Seni Seviyorum", en: "I Love You", de: "Ich liebe dich", it: "Ti amo" },
};

export function translateSign(sign: string, lang: UIAppLanguage = "tr"): string {
  if (!sign) return "";
  const key = sign.trim();
  const direct = SIGN_TRANSLATIONS[key];
  if (direct && direct[lang]) return direct[lang];

  // Try checking clean version without underscores
  const normalizedKey = key.replace(/_/g, " ");
  const normDirect = SIGN_TRANSLATIONS[normalizedKey];
  if (normDirect && normDirect[lang]) return normDirect[lang];

  return sign;
}

export const useTranslation = (lang: UIAppLanguage) => {
  const t = (key: keyof typeof translations["tr"]): string => {
    const value = translations[lang]?.[key] || translations["tr"]?.[key] || key;
    return String(value);
  };
  return { t, translateSign: (sign: string) => translateSign(sign, lang) };
};


