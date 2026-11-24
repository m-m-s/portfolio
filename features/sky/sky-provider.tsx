"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePath } from "@/features/transitions/use-path";
import type { Sky } from "@/features/weather/sky";
import { type Area, randomSeed, SkyEngine } from "./engine";

type Target = { canvas: HTMLCanvasElement; area: () => Area | null };

type SkyContextValue = {
  attach: (canvas: HTMLCanvasElement, area: () => Area | null) => () => void;
  home: () => SkyEngine | null;
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
  const target = useRef<Target | null>(null);
  const [windows, setWindows] = useState(0);
  const [seed, setSeed] = useState<number | null>(null);
  const full = usePath() === "/";

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const e = new SkyEngine(c);
    e.onReady = () => {
      document.documentElement.dataset.skyReady = "";
    };
    // A window's effect runs before this one, so it may have attached already.
    if (target.current) e.attach(target.current.canvas, target.current.area);
    engine.current = e;
    setSeed(randomSeed());
    return () => {
      e.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    if (seed !== null) engine.current?.show(weather, seed);
  }, [weather, seed]);

  useEffect(() => {
    engine.current?.setInteractive(full);
    engine.current?.setActive(full || windows > 0);
  }, [full, windows]);

  const attach = useCallback(
    (canvas: HTMLCanvasElement, area: () => Area | null) => {
      const t = { canvas, area };
      target.current = t;
      engine.current?.attach(canvas, area);
      setWindows((n) => n + 1);
      return () => {
        if (target.current === t) target.current = null;
        engine.current?.detach(canvas);
        setWindows((n) => n - 1);
      };
    },
    [],
  );

  const home = useCallback(() => engine.current, []);

  const value = useMemo(
    () => ({ attach, home, weather }),
    [attach, home, weather],
  );

  return (
    <SkyContext value={value}>
      <div
        aria-hidden="true"
        data-sky={full ? "full" : "window"}
        className={`[view-transition-name:sky] pointer-events-none fixed inset-0 -z-10 ${full ? "" : "invisible"}`}
      >
        <canvas ref={canvas} className="with-sky block h-full w-full" />
      </div>
      {children}
    </SkyContext>
  );
}
