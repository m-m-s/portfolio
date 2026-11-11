"use client";

import { useEffect } from "react";

const HEALTH_URL = "https://filmjousting.onrender.com/api/health";
const FLAG = "film-jousting-woken";

export function FilmJoustingWake() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem(FLAG)) return;
      sessionStorage.setItem(FLAG, "1");
    } catch {
      // Storage blocked: wake anyway.
    }
    fetch(HEALTH_URL, { mode: "no-cors", keepalive: true }).catch(() => {});
  }, []);

  return null;
}
