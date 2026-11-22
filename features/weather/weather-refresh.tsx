"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const MAX_AGE = 60 * 60 * 1000;

export function WeatherRefresh() {
  const router = useRouter();

  useEffect(() => {
    let loadedAt = Date.now();
    let timer: ReturnType<typeof setTimeout>;

    const refreshIfOld = () => {
      clearTimeout(timer);
      // A hidden tab waits: coming back to it checks again.
      if (document.hidden) return;
      if (Date.now() - loadedAt >= MAX_AGE) {
        loadedAt = Date.now();
        router.refresh();
      }
      timer = setTimeout(refreshIfOld, loadedAt + MAX_AGE - Date.now());
    };

    refreshIfOld();
    document.addEventListener("visibilitychange", refreshIfOld);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshIfOld);
    };
  }, [router]);

  return null;
}
