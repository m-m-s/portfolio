"use client";

import { usePathname } from "next/navigation";

/** The current page's path, with the homepage always "/". */
export function usePath() {
  const pathname = usePathname();
  // Vercel regenerates the cached homepage as "/index", and that page carries the name to the browser.
  return pathname === "/index" ? "/" : pathname;
}
