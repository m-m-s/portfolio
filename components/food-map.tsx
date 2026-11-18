"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { InlineButton } from "./inline-button";

const OPEN_FOR = 4000;

/** A link phrase that briefly shows the food map: over the window on wide screens, centred on a phone. */
export function FoodMapButton({ children }: { children: React.ReactNode }) {
  // 0 while closed; a new number on every click, so a repeat click restarts the timer.
  const [opened, setOpened] = useState(0);
  const open = opened !== 0;
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!opened) return;
    const timer = setTimeout(() => setOpened(0), OPEN_FOR);
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e.target instanceof Node && card.current?.contains(e.target)) return;
      setOpened(0);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", close);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", close);
    };
  }, [opened]);

  return (
    <>
      <InlineButton
        aria-expanded={open}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setOpened((n) => n + 1)}
        className="font-bold hover:underline"
      >
        {children}
      </InlineButton>
      {open &&
        createPortal(
          <div
            ref={card}
            role="img"
            aria-label="[COPY: food map description]"
            className="fixed inset-x-0 top-1/2 z-20 mx-auto flex aspect-square w-64 -translate-y-1/2 animate-[fade-in_300ms_ease-out] items-center justify-center bg-glass text-sm text-ink/50 shadow-lg sm:inset-x-auto sm:top-[22%] sm:right-[10%] sm:w-72 sm:translate-y-0"
          >
            [IMAGE: food map]
          </div>,
          document.body,
        )}
    </>
  );
}
