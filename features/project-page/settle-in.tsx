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

  return (
    <div
      ref={ref}
      id={id}
      data-settle={state}
      style={{ "--settle-order": order } as CSSProperties}
      className={className}
    >
      {children}
    </div>
  );
}
