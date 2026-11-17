"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { scopedTransition } from "@/features/transitions/scoped-transition";
import type { Weather } from "@/features/weather/get-weather";
import { SKIES, SKY_LABELS, type Sky } from "@/features/weather/sky";
import { randomSeed, SkyEngine } from "./engine";

/** A swipe shorter than this, in pixels, isn't a swipe. */
const SWIPE = 40;

/** The window the view grows out of and shrinks back into. */
function glass() {
  return document.querySelector<HTMLElement>("[data-window-glass]");
}

/** A link phrase that opens the full sky: the room's window grows to fill the screen, and the arrows step through every weather. */
export function LookOutside({
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
    engine.current = e;
    void e.show(live.sky, randomSeed()).then(() => setReady(true));
    return () => {
      e.destroy();
      engine.current = null;
      setReady(false);
      setAt(0);
    };
  }, [open, live.sky]);

  const openView = () => {
    const from = glass();
    if (from) from.dataset.viewGrow = "";
    scopedTransition("skyView", "grow", () => {
      if (from) delete from.dataset.viewGrow;
      // Open first, so the sky measures the full screen when it's created.
      dialog.current?.showModal();
      flushSync(() => setOpen(true));
    });
  };

  const close = () => {
    const d = dialog.current;
    if (!d?.open) return;
    const to = glass();
    scopedTransition(
      "skyView",
      "grow",
      () => {
        if (to) to.dataset.viewGrow = "";
        d.close();
        flushSync(() => setOpen(false));
      },
      () => {
        if (to) delete to.dataset.viewGrow;
      },
    );
  };

  const step = (by: 1 | -1) => {
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

  const label =
    at === 0
      ? `Live from New York: ${SKY_LABELS[shown].toLowerCase()}${live.temperature === null ? "" : `, ${live.temperature}°`}`
      : SKY_LABELS[shown];

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={openView}
        className="cursor-pointer font-bold hover:underline"
      >
        {children}
      </button>
      <dialog
        ref={dialog}
        aria-label="The sky outside"
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
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-page p-0 backdrop:bg-transparent"
      >
        <div
          data-view-grow
          aria-hidden="true"
          className="view-fade fixed inset-0 bg-page"
        >
          <canvas
            ref={canvas}
            className={`block h-full w-full transition-opacity duration-(--sky-swap) ${ready ? "opacity-100" : "opacity-0"}`}
          />
        </div>
        <div className="halo fixed inset-x-0 bottom-6 flex flex-col items-center gap-1 font-grotesk text-sm sm:bottom-8">
          <div className="flex items-center gap-8">
            <button
              type="button"
              aria-label="Previous weather"
              onClick={() => step(-1)}
              className="cursor-pointer px-1"
            >
              ←
            </button>
            <p aria-live="polite">{label}</p>
            <button
              type="button"
              aria-label="Next weather"
              onClick={() => step(1)}
              className="cursor-pointer px-1"
            >
              →
            </button>
          </div>
          <button
            type="button"
            onClick={close}
            className="cursor-pointer text-xs hover:underline"
          >
            Close
          </button>
        </div>
      </dialog>
    </>
  );
}
