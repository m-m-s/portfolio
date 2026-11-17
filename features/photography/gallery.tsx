"use client";

import Image from "next/image";
import { useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Photo } from "@/content/photography";
import { useRowMotion } from "./row-motion";

const GRAYS = ["bg-photo-1", "bg-photo-2", "bg-photo-3"];
/** A swipe shorter than this, in pixels, isn't a swipe. */
const SWIPE = 40;
/** A trackpad swipe ends when its scroll events pause this long, in ms. */
const WHEEL_REST = 150;

function PhotoFill({
  photo,
  shade,
  sizes,
}: {
  photo: Photo;
  shade: string;
  sizes: string;
}) {
  return photo.src ? (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      className="object-cover"
    />
  ) : (
    <span
      role="img"
      aria-label={photo.alt}
      className={`block h-full ${shade}`}
    />
  );
}

/** `at` is the photo's place in the whole gallery, row after row. `stepped` once the visitor has moved off the photo they opened (reduced motion fades those in). */
type Open = { at: number; stepped?: boolean };

let lastMotion = 0;

/** Runs a DOM change as a slideshow view transition: "grow" morphs the `[data-grow]` photo between its row and the slideshow, "step" slides it out and the next one in. */
function photoMotion(
  kind: "grow" | "step",
  update: () => void,
  done = () => {},
) {
  if (
    !document.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    update();
    done();
    return;
  }
  const root = document.documentElement;
  const run = ++lastMotion;
  root.dataset.photoMotion = kind;
  document.startViewTransition(update).finished.finally(() => {
    // A newer transition may already be running under the same attribute.
    if (run === lastMotion) delete root.dataset.photoMotion;
    done();
  });
}

export function Gallery({ rows }: { rows: Photo[][] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const swipeFrom = useRef<number | null>(null);
  const wheel = useRef({ sum: 0, done: false, timer: 0 });
  const rowsBox = useRef<HTMLDivElement>(null);
  useRowMotion(rowsBox);

  const shade = (row: number, photo: number) =>
    GRAYS[(row + photo) % GRAYS.length];
  // The rows only shape the layout: the slideshow runs through every photo in order.
  const { places, starts } = useMemo(() => {
    const starts: number[] = [];
    const places = rows.flatMap((row, r) => {
      starts.push(r ? starts[r - 1] + rows[r - 1].length : 0);
      return row.map((photo, p) => ({ photo, row: r, inRow: p }));
    });
    return { places, starts };
  }, [rows]);

  const step = (by: 1 | -1) => {
    if (!open || places.length < 2) return;
    const leaving = dialog.current?.querySelector<HTMLElement>("[data-grow]");
    if (leaving) leaving.dataset.leaving = "";
    document.documentElement.style.setProperty("--photo-dir", String(by));
    photoMotion("step", () =>
      flushSync(() =>
        setOpen((o) => {
          if (!o) return o;
          const count = places.length;
          return { at: (o.at + by + count) % count, stepped: true };
        }),
      ),
    );
  };

  const thumb = (o: Open) =>
    rowsBox.current?.querySelector<HTMLElement>(`[data-photo="${o.at}"]`);

  const openPhoto = (target: Open) => {
    const from = thumb(target);
    if (from) from.dataset.grow = "";
    photoMotion("grow", () => {
      if (from) delete from.dataset.grow;
      flushSync(() => setOpen(target));
      dialog.current?.showModal();
    });
  };

  const close = () => {
    const d = dialog.current;
    if (!d?.open || !open) return;
    const to = thumb(open);
    photoMotion(
      "grow",
      () => {
        if (to) to.dataset.grow = "";
        d.close();
      },
      () => {
        if (to) delete to.dataset.grow;
      },
    );
  };

  const current = open ? places[open.at] : null;

  return (
    <>
      <div ref={rowsBox} data-gallery className="space-y-10 sm:space-y-20">
        {rows.map((row, r) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are fixed content, never reordered.
            key={r}
            className="row-in"
            style={{ "--row-from": r % 2 ? 1 : -1 } as React.CSSProperties}
          >
            <div
              data-row={r % 2 ? -1 : 1}
              className="flex gap-3 overflow-x-auto px-4 select-none [scrollbar-width:none] sm:gap-4 sm:px-8"
            >
              {row.map((photo, p) => (
                <button
                  key={photo.src ?? photo.alt}
                  type="button"
                  aria-label={`Open ${photo.alt}`}
                  data-photo={starts[r] + p}
                  onClick={() => openPhoto({ at: starts[r] + p })}
                  style={{ aspectRatio: photo.ratio }}
                  className="relative h-56 flex-none cursor-zoom-in overflow-hidden sm:h-80 lg:h-[min(28rem,60vh)]"
                >
                  <PhotoFill
                    photo={photo}
                    shade={shade(r, p)}
                    sizes="(min-width: 1024px) 50rem, (min-width: 640px) 36rem, 25rem"
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-label="Photo"
        onClose={() => setOpen(null)}
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
        }}
        onWheel={(e) => {
          if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
          const w = wheel.current;
          clearTimeout(w.timer);
          w.timer = window.setTimeout(() => {
            w.sum = 0;
            w.done = false;
          }, WHEEL_REST);
          if (w.done) return;
          w.sum += e.deltaX;
          if (Math.abs(w.sum) > SWIPE) {
            step(w.sum > 0 ? 1 : -1);
            w.done = true;
          }
        }}
        onPointerDown={(e) => {
          swipeFrom.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeFrom.current === null) return;
          const dx = e.clientX - swipeFrom.current;
          swipeFrom.current = null;
          if (Math.abs(dx) > SWIPE) step(dx < 0 ? 1 : -1);
        }}
        className="m-0 max-h-none max-w-none bg-transparent p-0 backdrop:bg-page/95"
      >
        {open && current && (
          // The photo fits a fixed stage above the nav, so the nav never moves between photo shapes.
          <div className="pointer-events-none grid h-dvh w-screen grid-rows-[minmax(0,1fr)_auto] gap-4 px-8 pt-10 pb-6 sm:px-16 sm:pt-16 sm:pb-8">
            <div className="grid place-items-center [container-type:size]">
              <div
                key={current.photo.src ?? current.photo.alt}
                data-grow
                style={{
                  aspectRatio: current.photo.ratio,
                  width: `min(100cqw, 100cqh * ${current.photo.ratio})`,
                }}
                className={`pointer-events-auto relative ${open.stepped ? "photo-fade" : ""}`}
              >
                <PhotoFill
                  photo={current.photo}
                  shade={shade(current.row, current.inRow)}
                  sizes="90vw"
                />
              </div>
            </div>
            <div className="pointer-events-auto flex items-center justify-center gap-8 justify-self-center font-grotesk text-sm">
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => step(-1)}
                className="cursor-pointer px-1"
              >
                ←
              </button>
              <button
                type="button"
                onClick={close}
                className="cursor-pointer text-xs hover:underline"
              >
                Close
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => step(1)}
                className="cursor-pointer px-1"
              >
                →
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
