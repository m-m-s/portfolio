"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const MAX_AGE = 60 * 60 * 1000;
const CHECK_EVERY = 60 * 1000;

export function WeatherRefresh() {
  const router = useRouter();

  useEffect(() => {
    let loadedAt = Date.now();

    const refreshIfOld = () => {
      if (document.hidden || Date.now() - loadedAt < MAX_AGE) return;
      loadedAt = Date.now();
      router.refresh();
    };

    const interval = setInterval(refreshIfOld, CHECK_EVERY);
    document.addEventListener("visibilitychange", refreshIfOld);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfOld);
    };
  }, [router]);

  return null;
}
