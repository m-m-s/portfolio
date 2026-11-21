"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { foodMapCredit, foodMapDescription } from "@/content/about";
import foodMap from "../public/about/food-map.png";
import { InlineButton } from "./inline-button";

export function FoodMapButton({ children }: { children: React.ReactNode }) {
  const card = useRef<HTMLSpanElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <>
      <InlineButton
        aria-expanded={open}
        onClick={() => {
          const c = card.current;
          if (!c) return;
          if (!c.matches(":popover-open")) c.showPopover();
          // A click on the phrase closes the card and reopens it in the same moment, which doesn't restart its animation.
          for (const a of c.getAnimations()) a.currentTime = 0;
        }}
        className="font-bold hover:underline"
      >
        {children}
      </InlineButton>
      <span
        ref={card}
        popover="auto"
        onToggle={(e) => setOpen(e.newState === "open")}
        onAnimationEnd={(e) => e.currentTarget.hidePopover()}
        className="fixed inset-x-4 top-1/2 bottom-auto m-0 w-auto -translate-y-1/2 overflow-hidden border-0 bg-glass p-0 shadow-lg [animation:food-map_4.5s_both] sm:inset-x-auto sm:top-[22%] sm:right-[10%] sm:w-96 sm:translate-y-0 lg:w-md"
      >
        <Image
          src={foodMap}
          alt={foodMapDescription}
          sizes="(min-width: 1024px) 28rem, (min-width: 640px) 24rem, 100vw"
          placeholder="blur"
          className="block h-auto w-full"
        />
        {/* Google requires its credit beside the map, legible, where it prints it itself. */}
        <span className="absolute right-0 bottom-0 bg-glass/80 px-1.5 py-0.5 font-grotesk text-xs text-ink/70">
          {foodMapCredit}
        </span>
      </span>
    </>
  );
}
