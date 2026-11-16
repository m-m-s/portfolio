"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { prepareNavigation, ROOM_WALK } from "@/features/transitions/direction";

type DoorLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
};

export function DoorLink({
  href,
  children,
  className = "",
  ...rest
}: DoorLinkProps) {
  const pathname = usePathname();
  const door = useRef<HTMLSpanElement>(null);

  // Next keeps visited pages alive but hidden, so this runs when the page is
  // left: its door mustn't still be open when the page is shown again.
  useLayoutEffect(() => {
    const el = door.current;
    return () => {
      if (!el) return;
      el.dataset.door = "";
      el.style.viewTransitionName = "";
      el.style.transform = "";
    };
  }, []);

  return (
    <Link
      href={href}
      transitionTypes={[ROOM_WALK]}
      className={`door ${className}`}
      onNavigate={() => {
        const el = door.current;
        if (!el) return;

        // The swing plays inside the page transition (see globals.css), with the
        // door as its own layer. Until that starts, the door holds its current
        // angle. The layer would inherit that angle too, so it's placed by the
        // unrotated link box instead and the CSS does one turn from the hover angle.
        const root = document.documentElement;
        const box = el.parentElement?.getBoundingClientRect();
        const ajar = el.parentElement?.matches(":hover");
        root.style.setProperty(
          "--door-from",
          ajar ? "var(--door-ajar)" : "0deg",
        );
        // The slab extends past the link box by its padding.
        const slab = getComputedStyle(el);
        const padX = Number.parseFloat(slab.paddingLeft);
        const padY = Number.parseFloat(slab.paddingTop);
        root.style.setProperty("--door-x", `${(box?.left ?? 0) - padX}px`);
        root.style.setProperty("--door-y", `${(box?.top ?? 0) - padY}px`);
        root.style.setProperty("--door-font", slab.fontSize);
        el.style.transform = getComputedStyle(el).transform;
        el.dataset.door = "leaving";
        el.style.viewTransitionName = "door";
        if (box) {
          prepareNavigation(pathname, href, {
            x: box.left + box.width / 2,
            y: box.top + box.height / 2,
          });
        } else {
          prepareNavigation(pathname, href);
        }
      }}
      {...rest}
    >
      <span aria-hidden="true" className="door-frame">
        {children}
      </span>
      <span ref={door} data-door="" className="door-panel">
        {children}
      </span>
    </Link>
  );
}
