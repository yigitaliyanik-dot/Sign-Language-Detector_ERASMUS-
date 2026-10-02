"use client";

import dynamic from "next/dynamic";

const SignLanguageApp = dynamic(
  () => import("@/components/SignLanguageApp").then((mod) => mod.SignLanguageApp),
  {
    ssr: false,
    loading: () => (
      <main className="w-full h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white select-none">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-400 animate-spin" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-100">SignVision AI</h1>
        <p className="text-xs text-slate-400 mt-2 text-center max-w-xs">
          Initializing MediaPipe vision engine and camera modules...
        </p>
      </main>
    ),
  }
);

export default function HomePage() {
  return <SignLanguageApp />;
}
