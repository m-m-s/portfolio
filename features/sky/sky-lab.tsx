"use client";

import { useEffect, useRef, useState } from "react";
import { LiveHouse } from "@/components/house";
import { SKIES, SKY_LABELS, type Sky as SkyId } from "@/features/weather/sky";
import { randomSeed, SkyEngine } from "./engine";

const SCALES = [1, 0.8, 0.65, 0.5];

export function SkyLab() {
  const [weather, setWeather] = useState<SkyId>("cloudy");
  const [seed, setSeed] = useState<number | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SkyEngine | null>(null);
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const w = q.get("weather");
    if (w && (SKIES as readonly string[]).includes(w)) setWeather(w as SkyId);
    const s = Number(q.get("scale"));
    if (SCALES.includes(s)) setScale(s);
    setSeed(Number(q.get("seed")) || randomSeed());
  }, []);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const e = new SkyEngine(c);
    e.setInteractive(true);
    e.setActive(true);
    engine.current = e;
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, []);

  // Before show, so the first build already uses it.
  useEffect(() => {
    engine.current?.setCloudScale(scale);
  }, [scale]);

  useEffect(() => {
    if (seed !== null) engine.current?.show(weather, seed);
  }, [weather, seed]);

  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
      >
        <canvas ref={canvas} className="block h-full w-full" />
      </div>
      <main className="pointer-events-none absolute inset-x-0 top-0 grid h-dvh grid-cols-[382fr_auto_618fr] grid-rows-[var(--house-above)_auto_var(--house-below)] px-4 sm:px-8">
        <div className="pointer-events-auto col-start-2 row-start-2">
          <LiveHouse />
        </div>
      </main>

      <div className="fixed top-24 right-4 z-10 flex max-w-sm flex-wrap items-center justify-end gap-2 font-grotesk text-sm">
        {SKIES.map((w) => (
          <button
            key={w}
            type="button"
            aria-pressed={w === weather}
            onClick={() => setWeather(w)}
            className="rounded-full border border-ink/20 bg-page px-3 py-1 aria-pressed:bg-ink aria-pressed:text-page"
          >
            {SKY_LABELS[w]}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setSeed(randomSeed())}
          className="rounded-full border border-ink/20 bg-page px-3 py-1"
        >
          Reshuffle
        </button>
        <span className="text-ink/60">seed {seed}</span>
        <span className="basis-full" />
        <span className="text-ink/60">Clouds</span>
        <button
          type="button"
          aria-pressed={scale === null}
          onClick={() => setScale(null)}
          className="rounded-full border border-ink/20 bg-page px-3 py-1 aria-pressed:bg-ink aria-pressed:text-page"
        >
          Weather&rsquo;s
        </button>
        {SCALES.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={s === scale}
            onClick={() => setScale(s)}
            className="rounded-full border border-ink/20 bg-page px-3 py-1 aria-pressed:bg-ink aria-pressed:text-page"
          >
            {Math.round(s * 100)}%
          </button>
        ))}
      </div>
    </>
  );
}
