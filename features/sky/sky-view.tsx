"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { InlineButton } from "@/components/inline-button";
import { scopedTransition } from "@/features/transitions/scoped-transition";
import type { Weather } from "@/features/weather/get-weather";
import { SKIES, SKY_LABELS, type Sky } from "@/features/weather/sky";
import { SMALL_SCREEN } from "./constants";
import { preloadSkies, randomSeed, SkyEngine } from "./engine";

/** On a phone the window is narrow, so its clouds are drawn smaller than the homepage's: this share of their width. */
const PHONE_VIEW_SCALE = 0.45;
/** A swipe shorter than this, in pixels, isn't a swipe. */
const SWIPE = 40;

/** The window the view grows out of and shrinks back into. */
function glass() {
  return document.querySelector<HTMLElement>("[data-window-glass]");
}

const LookOutsideContext = createContext<(() => void) | null>(null);

/** Opens Look outside: the room's window grows into a big window, and the arrows step through every weather. */
export function useLookOutside() {
  const open = useContext(LookOutsideContext);
  if (!open) throw new Error("useLookOutside needs a LookOutsideProvider");
  return open;
}

/** A link phrase that opens Look outside. */
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

/** Holds the Look outside view, shared by every page: [weather] on About and every window open it. */
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
  // True while the history entry added on opening is the current one.
  const inHistory = useRef(false);
  const [open, setOpen] = useState(false);
  const [at, setAt] = useState(0);
  const [ready, setReady] = useState(false);
  // Today's weather first, then the rest in the usual order.
  const order: Sky[] = [live.sky, ...SKIES.filter((s) => s !== live.sky)];
  const shown = order[at];

  useEffect(() => {
    const c = canvas.current;
    if (!open || !c) return;
    const e = new SkyEngine(c);
    e.setInteractive(true);
    e.setActive(true);
    if (window.innerWidth < SMALL_SCREEN) e.setCloudScale(PHONE_VIEW_SCALE);
    engine.current = e;
    void e.show(live.sky, randomSeed()).then(() => setReady(true));
    return () => {
      e.destroy();
      engine.current = null;
      setReady(false);
      setAt(0);
    };
  }, [open, live.sky]);

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

  /** 0 re-rolls the weather showing into a new arrangement. */
  const step = (by: 1 | -1 | 0) => {
    const next = (at + by + order.length) % order.length;
    setAt(next);
    setReady(false);
    const swap = Number.parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue("--sky-swap"),
    );
    setTimeout(() => {
      void engine.current
        ?.show(order[next], randomSeed())
        .then(() => setReady(true));
    }, swap);
  };

  // Each half stays whole, so a narrow screen breaks the line only between them.
  const label =
    at === 0 ? (
      <>
        <span className="whitespace-nowrap">Live from New York:</span>{" "}
        <span className="whitespace-nowrap">
          {SKY_LABELS[shown].toLowerCase()}
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
            {/* Wide enough for the live line, so the arrows stay put as it changes. */}
            <p
              aria-live="polite"
              className="w-[min(30ch,100vw-9rem)] text-center"
            >
              {label}{" "}
              <button
                type="button"
                aria-label="New clouds"
                onClick={() => step(0)}
                className="-my-2 cursor-pointer px-1.5 py-2 text-ink/40 hover:text-ink"
              >
                ↻
              </button>
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
          <button
            type="button"
            onClick={() => close()}
            className="cursor-pointer text-xs hover:underline"
          >
            Close
          </button>
        </div>
      </dialog>
    </LookOutsideContext>
  );
}
