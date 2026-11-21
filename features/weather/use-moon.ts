"use client";

import { useEffect, useState } from "react";
import { isNight, moonPosition, nextSunChange } from "./sun-and-moon";

export type Moon = { lit: number; waxing: boolean };

export function useMoon() {
  const [moon, setMoon] = useState<Moon | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const check = () => {
      clearTimeout(timer);
      const now = new Date();
      if (isNight(now)) {
        const { lit, waxing } = moonPosition(now);
        setMoon({ lit, waxing });
      } else {
        setMoon(null);
      }
      timer = setTimeout(
        check,
        nextSunChange(now).getTime() - now.getTime() + 1000,
      );
    };
    check();
    // Background tabs hold timers back, so a tab coming back checks again.
    const onVisible = () => {
      if (!document.hidden) check();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return moon;
}
