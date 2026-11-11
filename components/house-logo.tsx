"use client";

import { usePathname } from "next/navigation";
import { DoorLink } from "./door-link";

// PLACEHOLDER shape until the real logo exists.
export function HouseLogo() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <DoorLink href="/" aria-label="Home" className="block w-fit">
      <svg
        viewBox="0 0 26 20"
        className="block h-5 w-auto fill-ink"
        aria-hidden="true"
      >
        <path d="M0 0h14l12 8v12H0Z" />
      </svg>
    </DoorLink>
  );
}
