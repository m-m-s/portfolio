"use client";

import { usePathname } from "next/navigation";
import { DoorLink } from "./door-link";

/** The homepage house's outline at desktop size, rounded. app/icon.svg is the same shape. It stays put while the page scrolls, at the header's inset, so the way home is always at hand. */
export function HouseLogo() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    // A wrapper, since a door's own position is relative.
    <div className="fixed top-6 left-4 z-30 sm:top-8 sm:left-8 lg:top-10 lg:left-12 2xl:top-12 2xl:left-16">
      <DoorLink href="/" aria-label="Home" className="door-house block w-fit">
        <svg
          viewBox="0 0 46 34"
          className="halo block h-5 w-auto overflow-visible"
          aria-hidden="true"
        >
          <path className="fill-ink" d="M0 0H18V7H39L46 20V34H0Z" />
        </svg>
      </DoorLink>
    </div>
  );
}
