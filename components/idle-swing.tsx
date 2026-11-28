"use client";

import { useEffect, useRef } from "react";

/** After the house has settled from its walk-up, in ms. */
const FIRST_PAUSE = 300;
const LATER_WAIT = 5_000;
const ACTIVITY = ["pointermove", "pointerdown", "keydown", "scroll", "wheel"];

export function IdleSwing({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const doors = [...root.querySelectorAll<HTMLElement>("[data-door]")];
    if (doors.length === 0) return;

    let next = Math.max(
      0,
      doors.findIndex((d) => d.closest('a[href="/projects"]')),
    );
    let wait = FIRST_PAUSE;
    let timer: ReturnType<typeof setTimeout>;
    let gone = false;
    let settled = false;
    let swinging = false;

    const nudge = () => {
      const door = doors[next];
      const hovering = root.querySelector(".door:hover");
      if (document.hidden) return;
      if (hovering || door.dataset.door) return restart();
      next = (next + 1) % doors.length;
      wait = LATER_WAIT;
      swinging = true;
      door.dataset.door = "nudge";
      door.addEventListener(
        "animationend",
        () => {
          if (door.dataset.door === "nudge") door.dataset.door = "";
          swinging = false;
          if (!gone) restart();
        },
        { once: true },
      );
    };
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(nudge, wait);
    };
    // Activity only holds off the later swings: the first comes as the house settles.
    const onActivity = () => {
      if (wait === LATER_WAIT && !swinging) restart();
    };

    for (const type of ACTIVITY) {
      window.addEventListener(type, onActivity, { passive: true });
    }
    const onShown = () => {
      if (settled && !document.hidden && !swinging) restart();
    };
    document.addEventListener("visibilitychange", onShown);
    // A fresh load walks the house up; arriving from another room, it's already in place.
    const walkUp = root.closest(".walk-up")?.getAnimations()[0];
    if (!walkUp) wait = LATER_WAIT;
    (walkUp?.finished ?? Promise.resolve())
      .catch(() => {})
      .then(() => {
        settled = true;
        if (!gone) restart();
      });

    return () => {
      gone = true;
      clearTimeout(timer);
      for (const type of ACTIVITY) window.removeEventListener(type, onActivity);
      document.removeEventListener("visibilitychange", onShown);
    };
  }, []);

  return <div ref={container}>{children}</div>;
}
