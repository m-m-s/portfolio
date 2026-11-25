"use client";

import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export function SettleIn({
  id,
  order,
  className,
  children,
}: {
  id?: string;
  order: number;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"opening" | "waiting" | "in">("opening");

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // The effect can run again after a jump to an anchor has scrolled this into view.
    if (el.getBoundingClientRect().top < window.innerHeight) {
      setState((s) => (s === "waiting" ? "in" : s));
      return;
    }
    setState((s) => (s === "in" ? s : "waiting"));
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

  const settling = (
    <div
      ref={ref}
      data-settle={state}
      style={{ "--settle-order": order } as CSSProperties}
      className={id ? undefined : className}
    >
      {children}
    </div>
  );
  if (!id) return settling;

  // The anchor sits outside the settling block, so the browser measures it before the block rises into place.
  return (
    <div className={`relative ${className ?? ""}`}>
      {/* A jump to the anchor puts this at the top of the screen, which centers the block, or tops it when it's taller than the screen. */}
      <span
        id={id}
        className="pointer-events-none absolute top-[min(0px,calc(50%-50dvh))] left-0"
      />
      {settling}
    </div>
  );
}
