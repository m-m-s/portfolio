"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { foodMapCredit, foodMapDescription } from "@/content/about";
import foodMap from "../public/about/food-map.png";
import { InlineButton } from "./inline-button";

const OPEN_FOR = 4000;

/** A link phrase that briefly shows the food map: over the window on wide screens, centred on a phone. */
export function FoodMapButton({ children }: { children: React.ReactNode }) {
  // 0 while closed; a new number on every click, so a repeat click restarts the timer.
  const [opened, setOpened] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const open = opened !== 0;
  const card = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!opened) return;
    const leave = () => {
      setOpened(0);
      setLeaving(true);
    };
    const timer = setTimeout(leave, OPEN_FOR);
    const close = (e: Event) => {
      if (e instanceof KeyboardEvent && e.key !== "Escape") return;
      if (e.target instanceof Node && card.current?.contains(e.target)) return;
      leave();
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
        onClick={() => {
          setLeaving(false);
          setOpened((n) => n + 1);
        }}
        className="font-bold hover:underline"
      >
        {children}
      </InlineButton>
      {(open || leaving) &&
        createPortal(
          <div
            ref={card}
            onAnimationEnd={(e) => {
              if (e.animationName === "leave-fade") setLeaving(false);
            }}
            className={`fixed inset-x-4 top-1/2 z-20 overflow-hidden mx-auto -translate-y-1/2 ${leaving ? "animate-[leave-fade_var(--fade)_ease-in_both]" : "animate-[fade-in_300ms_ease-out]"} bg-glass shadow-lg sm:inset-x-auto sm:top-[22%] sm:right-[10%] sm:w-96 sm:translate-y-0 lg:w-[28rem]`}
          >
            <Image
              src={foodMap}
              alt={foodMapDescription}
              sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 100vw"
              placeholder="blur"
              loading="eager"
              className="block h-auto w-full"
            />
            {/* Google requires its credit beside the map, legible, where it prints it itself. */}
            <p className="absolute right-0 bottom-0 bg-glass/80 px-1.5 py-0.5 font-grotesk text-xs text-ink/70">
              {foodMapCredit}
            </p>
          </div>,
          document.body,
        )}
    </>
  );
}
