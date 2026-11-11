"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// PLACEHOLDER shape until the real logo exists.
export function HouseLogo() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <Link href="/" aria-label="Home" className="block w-fit">
      <svg
        viewBox="0 0 26 20"
        className="h-5 w-auto fill-ink"
        aria-hidden="true"
      >
        <path d="M0 0h14l12 8v12H0Z" />
      </svg>
    </Link>
  );
}
