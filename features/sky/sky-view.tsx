"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { InlineButton } from "@/components/inline-button";
import { scopedTransition } from "@/features/transitions/scoped-transition";
import type { Weather } from "@/features/weather/get-weather";
import {
  conditionLabel,
  SKIES,
  SKY_LABELS,
  type Sky,
} from "@/features/weather/sky";
import { useMoon } from "@/features/weather/use-moon";
import { preloadSkies, SkyEngine } from "./engine";
import { useSky } from "./sky-provider";

const SWIPE = 40;

function glass() {
  return document.querySelector<HTMLElement>("[data-window-glass]");
}

const LookOutsideContext = createContext<(() => void) | null>(null);

export function useLookOutside() {
  const open = useContext(LookOutsideContext);
  if (!open) throw new Error("useLookOutside needs a LookOutsideProvider");
  return open;
}

export function LookOutsideButton({ children }: { children: React.ReactNode }) {
  const lookOutside = useLookOutside();
  return (
    <InlineButton
      aria-haspopup="dialog"
      onClick={lookOutside}
      className="font-bold hover:underline"
    >
      {children}
    </InlineButton>
  );
}

export function LookOutsideProvider({
  live,
  children,
}: {
  live: Weather;
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SkyEngine | null>(null);
  const swipeFrom = useRef<number | null>(null);
  const inHistory = useRef(false);
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const [ready, setReady] = useState(false);
  const moon = useMoon();
  const { home } = useSky();
  const order: Sky[] = [live.sky, ...SKIES.filter((s) => s !== live.sky)];
  const shown = order[at];

  useEffect(() => {
    const c = canvas.current;
    if (!open || !c) return;
    const shared = home();
    if (shared) {
      c.style.width = `${shared.size.width}px`;
      c.style.height = `${shared.size.height}px`;
    }
    const e = new SkyEngine(c);
    e.setInteractive(true);
    e.setActive(true);
    engine.current = e;
    void e.show(live.sky, shared?.currentSeed).then(() => {
      if (shared) e.matchDrift(shared);
      setReady(true);
    });
    return () => {
      e.destroy();
      engine.current = null;
      setReady(false);
      setAt(0);
    };
  }, [open, live.sky, home]);

  useEffect(() => {
    if (!open) return;
    const onBack = () => {
      if (inHistory.current) close(true);
    };
    window.addEventListener("popstate", onBack);
    return () => window.removeEventListener("popstate", onBack);
  });

  const openView = () => {
    preloadSkies(SKIES);
    const from = glass();
    if (from) from.dataset.viewGrow = "";
    scopedTransition("skyView", "grow", () => {
      if (from) delete from.dataset.viewGrow;
      // Open first, so the sky measures the full screen when it's created.
      dialog.current?.showModal();
      // The dialog itself, not its first arrow: opened from a window, the arrow would show a focus ring.
      dialog.current?.focus();
      flushSync(() => setOpen(true));
    });
    // An entry of its own, so Back closes the view instead of leaving the room.
    history.pushState(null, "", location.href);
    inHistory.current = true;
  };

  const close = (byBack = false) => {
    const d = dialog.current;
    if (!d?.open) return;
    if (inHistory.current) {
      inHistory.current = false;
      if (!byBack) history.back();
    }
    scopedTransition("skyView", "fade", () => {
      d.close();
      flushSync(() => setOpen(false));
    });
  };

  const step = (by: 1 | -1 | 0) => {
    const next = (at + by + order.length) % order.length;
    setAt(next);
    setReady(false);
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue("--sky-swap")
      .trim();
    // The browser may report it in seconds (".25s") rather than as written.
    const swap = Number.parseFloat(value) * (value.endsWith("ms") ? 1 : 1000);
    const shared = next === 0 && by !== 0 ? home() : null;
    setTimeout(() => {
      const e = engine.current;
      void e?.show(order[next], shared?.currentSeed).then(() => {
        if (shared) e.matchDrift(shared);
        setReady(true);
      });
    }, swap);
  };

  const label =
    at === 0 ? (
      <>
        <span className="whitespace-nowrap">Live from New York:</span>{" "}
        <span className="whitespace-nowrap">
          {conditionLabel(shown, moon !== null).toLowerCase()}
          {live.temperature === null ? "" : `, ${live.temperature}°`}
        </span>
      </>
    ) : (
      SKY_LABELS[shown]
    );

  return (
    <LookOutsideContext value={openView}>
      {children}
      <dialog
        ref={dialog}
        aria-label="The sky outside"
        tabIndex={-1}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (!(e.target as Element).closest("button")) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
        }}
        onPointerDown={(e) => {
          swipeFrom.current = e.pointerType === "touch" ? e.clientX : null;
        }}
        onPointerUp={(e) => {
          if (swipeFrom.current === null) return;
          const dx = e.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(dx) > SWIPE) step(dx < 0 ? 1 : -1);
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none touch-pinch-zoom bg-page p-0 backdrop:bg-transparent"
      >
        <div
          data-view-grow
          aria-hidden="true"
          className="outside-window view-fade"
        >
          <canvas
            ref={canvas}
            className={`transition-opacity duration-(--sky-swap) ${ready ? "opacity-100" : "opacity-0"}`}
          />
          {!ready && (
            <span className="absolute inset-0 m-auto size-6 [animation:fade-in_var(--sky-swap)_ease_500ms_both]">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                strokeWidth="2"
                className="block size-full animate-spin"
              >
                <circle cx="12" cy="12" r="10" className="stroke-ink/10" />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  strokeLinecap="round"
                  strokeDasharray="16 48"
                  className="stroke-ink/50"
                />
              </svg>
            </span>
          )}
        </div>
        <div className="outside-controls fixed inset-x-0 flex flex-col items-center gap-3 font-grotesk text-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous weather"
              onClick={() => step(-1)}
              className="-my-3 cursor-pointer px-5 py-3"
            >
              ←
            </button>
            <p
              aria-live="polite"
              className="w-[min(30ch,100vw-9rem)] text-center"
            >
              {label}
            </p>
            <button
              type="button"
              aria-label="Next weather"
              onClick={() => step(1)}
              className="-my-3 cursor-pointer px-5 py-3"
            >
              →
            </button>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => step(0)}
              className="cursor-pointer hover:underline"
            >
              Refresh
            </button>
            <span aria-hidden="true" className="text-ink/40">
              ·
            </span>
            <button
              type="button"
              onClick={() => close()}
              className="cursor-pointer hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </LookOutsideContext>
  );
}
