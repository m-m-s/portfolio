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

type SkyContextValue = {
  /** Calls draw with the sky's canvas after every frame. Returns an unsubscribe. */
  watch: (draw: Draw) => () => void;
  weather: Sky;
};

const SkyContext = createContext<SkyContextValue | null>(null);

export function useSky() {
  const sky = useContext(SkyContext);
  if (!sky) throw new Error("useSky needs a SkyProvider");
  return sky;
}

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
  const [seed, setSeed] = useState<number | null>(null);
  const full = usePathname() === "/";

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const e = new SkyEngine(c);
    e.onReady = () => setReady(true);
    e.onFrame = () => {
      for (const draw of watchers.current) draw(c);
    };
    engine.current = e;
    setSeed(randomSeed());
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, []);

  const scale = full ? null : "window";

  // Before show, so the first build already uses it.
  useEffect(() => {
    engine.current?.setCloudScale(scale);
  }, [scale]);

  useEffect(() => {
    if (seed !== null) engine.current?.show(weather, seed);
  }, [weather, seed]);

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

  const value = useMemo(() => ({ watch, weather }), [watch, weather]);

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
