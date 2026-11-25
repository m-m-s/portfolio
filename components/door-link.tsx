"use client";

import Link from "next/link";
import { useLayoutEffect, useRef } from "react";
import { prepareNavigation, ROOM_WALK } from "@/features/transitions/direction";
import { usePath } from "@/features/transitions/use-path";

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
  const pathname = usePath();
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

        const root = document.documentElement;
        const box = el.parentElement?.getBoundingClientRect();
        const slab = getComputedStyle(el);
        const ajar =
          matchMedia("(hover: hover)").matches &&
          el.parentElement?.matches(":hover");
        root.style.setProperty(
          "--door-from",
          ajar ? "var(--door-ajar)" : "0deg",
        );
        root.style.setProperty("--door-font", slab.fontSize);
        if (ajar) {
          // Until the transition starts, the door holds its hover angle. Its
          // layer would inherit that angle too, so it's placed by the unrotated
          // link box instead (the slab extends past it by its padding). The
          // browser's own placement is only left alone otherwise, because on a
          // phone it also allows for the address bar, which this can't see.
          const padX = Number.parseFloat(slab.paddingLeft);
          const padY = Number.parseFloat(slab.paddingTop);
          root.style.setProperty("--door-x", `${(box?.left ?? 0) - padX}px`);
          root.style.setProperty("--door-y", `${(box?.top ?? 0) - padY}px`);
          root.dataset.doorAjar = "";
          el.style.transform = slab.transform;
        } else {
          delete root.dataset.doorAjar;
          el.style.transform = "none";
        }
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
      <span aria-hidden="true" className="door-frame" />
      <span ref={door} data-door="" className="door-panel">
        {children}
      </span>
    </Link>
  );
}
