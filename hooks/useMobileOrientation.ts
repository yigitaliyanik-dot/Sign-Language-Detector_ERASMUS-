import { useState, useEffect } from "react";

export function useMobileOrientation() {
  const [isPortrait, setIsPortrait] = useState<boolean>(true);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkOrientation = () => {
      const portrait = window.innerHeight >= window.innerWidth;
      setIsPortrait(portrait);
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });

      const userAgent = navigator.userAgent || "";
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setIsMobileDevice(mobileRegex.test(userAgent) || isTouch);
    };

    checkOrientation();

    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, []);

  return {
    isPortrait,
    isMobileDevice,
    windowSize,
  };
}
