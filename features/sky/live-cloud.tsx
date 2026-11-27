"use client";

import { useEffect, useRef, useState } from "react";
import { configFor } from "./config";
import { SkyEngine } from "./engine";

const SKY = "partly-cloudy";
const CLOUD = "58-2";
const SETTINGS = { ...configFor(SKY).front[CLOUD], light: 0.35 };
const FILL = 0.85;
/** How near a cloud dot a finger has to land to grab the cloud, in px. */
const REACH = 16;

export function LiveCloud({
  label,
  ratio,
  active,
}: {
  label: string;
  ratio: number;
  active: boolean;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SkyEngine | null>(null);
  const [ready, setReady] = useState(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const e = new SkyEngine(c);
    e.setActive(false);
    engine.current = e;
    void e.showCloud(SKY, CLOUD, SETTINGS, FILL).then(() => setReady(true));
    const observer = new IntersectionObserver(([entry]) =>
      setInView(entry.isIntersecting),
    );
    observer.observe(c);

    let onCloud = false;
    const start = (t: TouchEvent) => {
      const f = t.touches[0];
      onCloud =
        t.touches.length === 1 && e.touchesCloud(f.clientX, f.clientY, REACH);
    };
    const move = (t: TouchEvent) => {
      if (onCloud && t.touches.length === 1) t.preventDefault();
    };
    c.addEventListener("touchstart", start, { passive: true });
    c.addEventListener("touchmove", move, { passive: false });
    return () => {
      c.removeEventListener("touchstart", start);
      c.removeEventListener("touchmove", move);
      observer.disconnect();
      e.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setInteractive(active);
    engine.current?.setActive(active && inView);
  }, [active, inView]);

  return (
    <div
      role="img"
      aria-label={label}
      style={{ aspectRatio: ratio }}
      className="relative w-full overflow-hidden bg-page ring-1 ring-rule"
    >
      <canvas
        ref={canvas}
        className={`absolute inset-0 block h-full w-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}
