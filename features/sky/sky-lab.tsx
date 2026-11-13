"use client";

import { useEffect, useState } from "react";
import { intro } from "@/content/home";
import { SKIES, SKY_LABELS, type Sky as SkyId } from "@/features/weather/sky";
import { randomSeed } from "./engine";
import { useSky } from "./sky-provider";

const SCALES = [1, 0.8, 0.65, 0.5];

export function SkyLab() {
  const [weather, setWeather] = useState<SkyId>("cloudy");
  const [seed, setSeed] = useState<number | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const { setLabOverride } = useSky();

  // ?seed=11&weather=snowy reproduces a sky (e.g. to compare with the mock).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const w = q.get("weather");
    if (w && (SKIES as readonly string[]).includes(w)) setWeather(w as SkyId);
    const s = Number(q.get("scale"));
    if (SCALES.includes(s)) setScale(s);
    setSeed(Number(q.get("seed")) || randomSeed());
  }, []);

  useEffect(() => {
    if (seed !== null) setLabOverride({ weather, seed, scale });
  }, [weather, seed, scale, setLabOverride]);

  useEffect(() => () => setLabOverride(null), [setLabOverride]);

  return (
    <>
      <main className="grid flex-1 grid-cols-[382fr_auto_618fr] grid-rows-[618fr_auto_382fr] px-4 py-12 sm:px-8">
        <h1 className="col-start-2 row-start-2 font-grotesk text-4xl leading-tight sm:text-5xl">
          {intro.map((line) => (
            <span key={line.map((p) => p.text).join("")} className="block">
              {line.map((p) =>
                p.href ? (
                  <b key={p.text} className="font-sans">
                    {p.text}
                  </b>
                ) : (
                  p.text
                ),
              )}
            </span>
          ))}
        </h1>
      </main>

      <div className="fixed bottom-16 left-4 flex flex-wrap items-center gap-2 font-grotesk text-sm">
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
