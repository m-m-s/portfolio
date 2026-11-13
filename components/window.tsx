"use client";

import { useEffect, useRef } from "react";
import { useSky } from "@/features/sky/sky-provider";

/** A four-pane window onto the site's sky: the part of it that's behind the window. */
export function Window({ className = "" }: { className?: string }) {
  const box = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLCanvasElement>(null);
  const { watch } = useSky();

  useEffect(() => {
    const el = box.current;
    const ctx = glass.current?.getContext("2d");
    if (!el || !ctx) return;
    return watch((sky) => {
      const r = el.getBoundingClientRect();
      const dpr = sky.width / (sky.clientWidth || 1);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
        ctx.canvas.width = w;
        ctx.canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(sky, r.left * dpr, r.top * dpr, w, h, 0, 0, w, h);
    });
  }, [watch]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={`relative aspect-2/3 bg-glass shadow-window ${className}`}
    >
      <canvas ref={glass} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 border-6 border-frame" />
      <div className="absolute inset-y-0 left-1/2 w-1.5 -translate-x-1/2 bg-frame" />
      <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 bg-frame" />
    </div>
  );
}
