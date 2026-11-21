"use client";

import { useEffect, useRef, useState } from "react";
import {
  castShadow,
  House,
  SHADOW_TUNING,
  type ShadowTuning,
} from "@/components/house";
import { SKIES, SKY_LABELS, type Sky as SkyId } from "@/features/weather/sky";
import {
  moonPosition,
  nycMinutesNow,
  nycTimeToday,
  sunPosition,
} from "@/features/weather/sun-and-moon";
import { randomSeed, SkyEngine } from "./engine";

const SCALES = [1, 0.8, 0.65, 0.5];

function clock(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = String(minutes % 60).padStart(2, "0");
  return `${((h + 11) % 12) + 1}:${m} ${h < 12 ? "AM" : "PM"}`;
}

export function SkyLab() {
  const [weather, setWeather] = useState<SkyId>("cloudy");
  const [seed, setSeed] = useState<number | null>(null);
  const [scale, setScale] = useState<number | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SkyEngine | null>(null);
  // Set once mounted: reading the clock during the server render isn't allowed.
  const [minutes, setMinutes] = useState<number | null>(null);
  const [on, setOn] = useState(true);
  const [tuning, setTuning] = useState(SHADOW_TUNING);
  const tune = (key: keyof ShadowTuning, value: number) =>
    setTuning((t) => ({ ...t, [key]: value }));
  const date = minutes === null ? null : nycTimeToday(minutes);
  const sun = date && sunPosition(date);
  const moon = date && moonPosition(date);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const w = q.get("weather");
    if (w && (SKIES as readonly string[]).includes(w)) setWeather(w as SkyId);
    const s = Number(q.get("scale"));
    if (SCALES.includes(s)) setScale(s);
    setSeed(Number(q.get("seed")) || randomSeed());
    setMinutes(nycMinutesNow());
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
          <House
            shadow={date && on ? castShadow(date, weather, tuning) : null}
          />
        </div>
      </main>

      <details className="fixed top-24 left-4 z-10 w-64 rounded-lg border border-ink/20 bg-page p-3 font-grotesk text-sm">
        <summary className="cursor-pointer">Shadow</summary>
        <div className="mt-3 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={on}
              onChange={(e) => setOn(e.target.checked)}
            />
            Show shadow
          </label>
          <Slider
            label={`Time ${minutes === null ? "" : clock(minutes)}`}
            note={
              !sun || !moon
                ? ""
                : sun.altitude > 0
                  ? `sun ${Math.round(sun.altitude)}° up, ${Math.round(sun.azimuth)}° from north`
                  : `moon ${Math.round(moon.altitude)}° up, ${Math.round(moon.azimuth)}° from north, ${Math.round(moon.lit * 100)}% lit`
            }
            min={0}
            max={1439}
            step={5}
            value={minutes ?? 0}
            onChange={setMinutes}
          />
          <Slider
            label="Length"
            min={0.1}
            max={2}
            step={0.05}
            value={tuning.length}
            onChange={(v) => tune("length", v)}
          />
          <Slider
            label="Steepness"
            min={0}
            max={1}
            step={0.05}
            value={tuning.depth}
            onChange={(v) => tune("depth", v)}
          />
          <Slider
            label="Strength"
            min={0}
            max={1}
            step={0.01}
            value={tuning.strength}
            onChange={(v) => tune("strength", v)}
          />
          <Slider
            label="Moonlight"
            min={0}
            max={1}
            step={0.05}
            value={tuning.moonlight}
            onChange={(v) => tune("moonlight", v)}
          />
          <Slider
            label="Blur (em)"
            min={0}
            max={0.6}
            step={0.01}
            value={tuning.blur}
            onChange={(v) => tune("blur", v)}
          />
        </div>
      </details>
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

function Slider({
  label,
  note,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  note?: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span>
        {label} <span className="text-ink/60">{note ?? value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
