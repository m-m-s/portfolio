"use client";

import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

/** Holds a block back until it first scrolls into view, then settles it in once. Blocks already on screen arrive with the page. */
export function SettleIn({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"waiting" | "in">();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || el.getBoundingClientRect().top < window.innerHeight) return;
    setState("waiting");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState("in");
        observer.disconnect();
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} data-settle={state}>
      {children}
    </div>
  );
}
