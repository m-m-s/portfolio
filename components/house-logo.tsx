"use client";

import { usePathname } from "next/navigation";
import { DoorLink } from "./door-link";

/** The homepage house's outline at desktop size, rounded. app/icon.svg is the same shape. */
export function HouseLogo() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  return (
    <DoorLink href="/" aria-label="Home" className="door-house block w-fit">
      <svg
        viewBox="0 0 46 34"
        className="block h-5 w-auto overflow-visible"
        aria-hidden="true"
      >
        <path
          className="door-slab fill-page"
          d="M-4 -4H22V3H41.4L50 19V38H-4Z"
        />
        <path className="fill-ink" d="M0 0H18V7H39L46 20V34H0Z" />
      </svg>
    </DoorLink>
  );
}
