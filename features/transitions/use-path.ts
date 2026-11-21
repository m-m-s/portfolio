"use client";

import { usePathname } from "next/navigation";

export function usePath() {
  const pathname = usePathname();
  // Vercel's background regeneration renders the homepage as "/index".
  return pathname === "/index" ? "/" : pathname;
}
