"use client";

import { usePath } from "@/features/transitions/use-path";
import { DoorLink } from "./door-link";

/** app/icon.svg is the same shape: change both together. */
export function HouseLogo() {
  const pathname = usePath();
  if (pathname === "/") return null;

  return (
    // A wrapper, since a door's own position is relative.
    <nav className="fixed top-6 left-4 z-30 sm:top-8 sm:left-8 lg:top-10 lg:left-12 2xl:top-12 2xl:left-16">
      <DoorLink href="/" aria-label="Home" className="door-house block w-fit">
        <svg
          viewBox="0 0 46 34"
          className="halo block h-5 w-auto overflow-visible 2xl:h-6"
          aria-hidden="true"
        >
          <path className="fill-ink" d="M0 0H18V7H39L46 20V34H0Z" />
        </svg>
      </DoorLink>
    </nav>
  );
}
