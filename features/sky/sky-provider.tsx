"use client";

import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Sky } from "@/features/weather/sky";
import { randomSeed, SkyEngine } from "./engine";

type Draw = (sky: HTMLCanvasElement) => void;
type LabOverride = { weather: Sky; seed: number; scale: number | null };

type SkyContextValue = {
  /** Calls draw with the sky's canvas after every frame. Returns an unsubscribe. */
  watch: (draw: Draw) => () => void;
  /** The weather the sky is showing (the lab's choice while in /lab). */
  weather: Sky;
  setLabOverride: (override: LabOverride | null) => void;
};

const SkyContext = createContext<SkyContextValue | null>(null);

export function useSky() {
  const sky = useContext(SkyContext);
  if (!sky) throw new Error("useSky needs a SkyProvider");
  return sky;
}

const FULL_SKY = new Set(["/", "/lab"]);

export function SkyProvider({
  weather,
  children,
}: {
  weather: Sky;
  children: React.ReactNode;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SkyEngine | null>(null);
  const watchers = useRef(new Set<Draw>());
  const [watching, setWatching] = useState(0);
  const [ready, setReady] = useState(false);
  const [override, setLabOverride] = useState<LabOverride | null>(null);
  const [visitSeed, setVisitSeed] = useState<number | null>(null);
  const full = FULL_SKY.has(usePathname());

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const e = new SkyEngine(c);
    e.onReady = () => setReady(true);
    e.onFrame = () => {
      for (const draw of watchers.current) draw(c);
    };
    engine.current = e;
    setVisitSeed(randomSeed());
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, []);

  const sky = override?.weather ?? weather;
  const seed = override?.seed ?? visitSeed;
  const scale = override?.scale ?? null;

  // Before show, so the first build already uses it.
  useEffect(() => {
    engine.current?.setCloudScale(scale);
  }, [scale]);

  useEffect(() => {
    if (seed !== null) engine.current?.show(sky, seed);
  }, [sky, seed]);

  useEffect(() => {
    engine.current?.setInteractive(full);
    engine.current?.setActive(full || watching > 0);
  }, [full, watching]);

  const watch = useCallback((draw: Draw) => {
    watchers.current.add(draw);
    setWatching((n) => n + 1);
    return () => {
      watchers.current.delete(draw);
      setWatching((n) => n - 1);
    };
  }, []);

  const value = useMemo(
    () => ({ watch, weather: sky, setLabOverride }),
    [watch, sky],
  );

  return (
    <SkyContext value={value}>
      <div
        aria-hidden="true"
        style={{ viewTransitionName: "sky" }}
        className={`pointer-events-none fixed inset-0 -z-10 ${full ? "" : "invisible"}`}
      >
        <canvas
          ref={canvas}
          className={`block h-full w-full transition-opacity duration-(--sky-fade) ${ready ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      {children}
    </SkyContext>
  );
}
