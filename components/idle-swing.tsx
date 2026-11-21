"use client";

import { useEffect, useRef } from "react";

const FIRST_WAIT = 3_500;
const LATER_WAIT = 30_000;
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
    let wait = FIRST_WAIT;
    let timer: ReturnType<typeof setTimeout>;

    const nudge = () => {
      const door = doors[next];
      const hovering = root.querySelector(".door:hover");
      if (document.hidden || hovering || door.dataset.door) return restart();
      next = (next + 1) % doors.length;
      wait = LATER_WAIT;
      door.dataset.door = "nudge";
      door.addEventListener(
        "animationend",
        () => {
          if (door.dataset.door === "nudge") door.dataset.door = "";
        },
        { once: true },
      );
      restart();
    };
    const restart = () => {
      clearTimeout(timer);
      timer = setTimeout(nudge, wait);
    };

    for (const type of ACTIVITY) {
      window.addEventListener(type, restart, { passive: true });
    }
    document.addEventListener("visibilitychange", restart);
    restart();

    return () => {
      clearTimeout(timer);
      for (const type of ACTIVITY) window.removeEventListener(type, restart);
      document.removeEventListener("visibilitychange", restart);
    };
  }, []);

  return <div ref={container}>{children}</div>;
}
