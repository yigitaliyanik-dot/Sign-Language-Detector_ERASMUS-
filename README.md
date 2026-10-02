# SignVision - Real-Time Mobile Sign Language Detection

A mobile-first web application for real-time Sign Language detection and interpretation built with **Next.js App Router**, **MediaPipe Tasks Vision**, **TensorFlow.js**, and **Tailwind CSS**.

---

## 📱 Features

- **Progressive Web App (PWA)**: Full standalone app support (`manifest.json`, dark `#0f172a` theme, portrait lock, iOS splash meta tags, and `InstallPromptBanner` for iOS/Android).
- **Mobile-First Layout**: Full viewport height (`100dvh`), locked overflow, safe-area inset adaptation, touch and swipe optimizations.
- **MediaPipe Tasks Vision**: Real-time 21 3D hand landmark tracking and gesture recognition powered by GPU/WebGL acceleration.
- **Front & Rear Camera Switch**: Instant toggling between selfie mode (with mirrored landmarks) and back camera mode.
- **Visual Skeleton Overlay**: Glowing neon landmark connections with fingertip highlights rendered on an HTML5 canvas overlay.
- **Speech Synthesis (TTS)**: Automatic vocalization of recognized signs using the Web Speech API.
- **Custom Sign Dataset Studio**: Record custom sign landmarks via 3s burst mode or single snapshots directly from the camera.
- **In-Browser TensorFlow.js Trainer**: Train a custom neural network right in the browser in seconds and activate it for live recognition.
- **Export to JSON & CSV**: Download datasets with 63 normalized coordinates ready for external Python/PyTorch or TFJS models.
- **Continuous Detection HUD**: Live FPS counter, confidence gauge, hand identification (Left/Right), and sentence history breadcrumbs.
- **Modular Architecture**: Clean separation of UI components, MediaPipe engines, dataset storage, and custom hooks.

---

## 🗂️ Project Directory Structure

```text
├── public/
│   ├── manifest.json            # PWA manifest with standalone display, dark theme, and icons
│   └── icons/                   # 192x192, 512x512, apple-touch-icon, and SVG vector app icons
├── app/
│   ├── globals.css              # Mobile viewport reset, dvh lock, and safe-area utilities
│   ├── layout.tsx               # Mobile viewport meta (no-zoom, cover) and root layout
│   └── page.tsx                 # Dynamic client-only entry point (bypasses SSR for WASM)
├── components/
│   ├── dataset/
│   │   └── DatasetStudio.tsx    # Modal sheet for recording signs, training models & exporting
│   ├── CameraFeed.tsx           # Fullscreen video feed with framing zone and retry fallbacks
│   ├── DetectionCanvas.tsx      # Canvas overlay rendering 21 hand keypoints & skeletal connections
│   ├── PredictionBanner.tsx     # Floating HUD displaying current sign, confidence & audio toggle
│   ├── ControlBar.tsx           # Bottom mobile dock (camera flip, pause/resume, studio, guide)
│   ├── MobileNotice.tsx         # Portrait orientation helper & gesture reference guide modal
│   └── SignLanguageApp.tsx      # Main application orchestrator
├── hooks/
│   ├── useCamera.ts             # Camera stream lifecycle & front/back camera toggling
│   ├── useDatasetCollector.ts   # Burst recording, countdowns, and dataset management
│   ├── useHandDetection.ts      # RAF inference loop, FPS counter, and sign interpretation
│   └── useMobileOrientation.ts  # Device orientation and portrait/landscape tracking
├── lib/
│   ├── dataset/
│   │   ├── datasetStorage.ts    # LocalStorage cache, CSV/JSON file export & import
│   │   ├── inBrowserTrainer.ts  # In-browser TensorFlow.js neural network training engine
│   │   └── types.ts             # LandmarkSample, SignDataset, TrainingProgress types
│   ├── mediapipe/
│   │   ├── detector.ts          # Singleton MediaPipe GestureRecognizer & HandLandmarker manager
│   │   ├── drawing.ts           # Hand skeletal drawing utilities with neon glow
│   │   ├── signClassifier.ts    # Sign language dictionary and translation interpreter
│   │   └── types.ts             # TypeScript definitions for landmarks, gestures, camera state
│   ├── tfjs/
│   │   └── classifier.ts        # TensorFlow.js model runner for custom 63-feature landmark vectors
│   └── utils.ts                 # Tailwind CSS class merging helper (cn)
├── next.config.mjs              # Webpack client fallback configuration for WASM/Node dependencies
├── tailwind.config.ts           # Mobile dvh utilities, custom colors, and shadow extensions
├── tsconfig.json                # TypeScript path alias configuration (@/*)
└── package.json                 # Dependencies and build scripts
```

---

## 🚀 Getting Started

### 1. Development Server
Run the local development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your mobile browser or open Chrome DevTools in device emulation mode (iPhone 14 / Pixel 7).

### 2. Production Build
```bash
npm run build
npm run start
```

---

## 🖐️ Supported Gestures & Extensibility

The application includes built-in recognition for standard MediaPipe gestures mapped to sign language concepts:
- **Open Palm**: Hello / Stop / Letter B
- **Thumb Up**: Good / Yes / Approval
- **Thumb Down**: Bad / No / Disapproval
- **Victory (V)**: Peace / Letter V / Number Two
- **Pointing Up**: Number One / You / Above
- **Closed Fist**: Letter S / Power / Solidarity
- **I Love You (ASL)**: Thumb, index, and pinky extended

### Plugging in a Custom TensorFlow.js Model
Use `lib/tfjs/classifier.ts` to feed the 63 normalized coordinates `(21 landmarks × [x, y, z])` into your custom trained neural network (e.g., ASL alphabet A–Z or Turkish Sign Language words).
