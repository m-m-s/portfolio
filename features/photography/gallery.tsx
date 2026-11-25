"use client";

import Image, { getImageProps } from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import type { Photo } from "@/content/photography";
import { scopedTransition } from "@/features/transitions/scoped-transition";
import { useRowMotion } from "./row-motion";

const GRAYS = ["bg-photo-1", "bg-photo-2", "bg-photo-3"];
const SWIPE = 40;
const WHEEL_REST = 150;
/** How long the pointer rests on one photo before the others dim, in ms. */
const HOVER_REST = 1000;
/** The top row's photos on screen as the page opens, loaded straight away rather than lazily. */
const FIRST_SEEN = 3;
const ROW_SIZES = "(min-width: 1024px) 50rem, (min-width: 640px) 36rem, 25rem";

/** No wider than the slideshow can show it: fitting the screen, a portrait photo is narrow. */
const slideSizes = (ratio: number) =>
  `${Math.round(Math.min(innerWidth, innerHeight * ratio))}px`;

function preload(photo: Photo, sizes: string) {
  if (!photo.src) return;
  const { props } = getImageProps({
    src: photo.src,
    alt: "",
    fill: true,
    sizes,
  });
  const img = new window.Image();
  img.sizes = props.sizes ?? sizes;
  img.srcset = props.srcSet ?? "";
  img.src = props.src;
}

function PhotoFill({
  photo,
  shade,
  sizes,
  eager = false,
}: {
  photo: Photo;
  shade: string;
  sizes: string;
  eager?: boolean;
}) {
  return photo.src ? (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
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

type Open = { at: number; stepped?: boolean };

function photoMotion(
  kind: "grow" | "step",
  update: () => void,
  done?: () => void,
) {
  scopedTransition("photoMotion", kind, update, done);
}

export function Gallery({ rows }: { rows: Photo[][] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const swipeFrom = useRef<number | null>(null);
  const wheel = useRef({ sum: 0, done: false, timer: 0 });
  const rowsBox = useRef<HTMLDivElement>(null);
  useRowMotion(rowsBox);
  const rest = useRef<{ photo: Element | null; timer: number }>({
    photo: null,
    timer: 0,
  });
  // Dims once the pointer stops on a photo; moving within that photo afterwards keeps it.
  const pointAt = (photo: Element | null) => {
    const box = rowsBox.current;
    if (!box) return;
    const moved = photo !== rest.current.photo;
    if (!moved && "resting" in box.dataset) return;
    rest.current.photo = photo;
    if (moved) delete box.dataset.resting;
    clearTimeout(rest.current.timer);
    if (photo) {
      rest.current.timer = window.setTimeout(() => {
        box.dataset.resting = "";
        const place = places[Number((photo as HTMLElement).dataset.photo)];
        if (place) preload(place.photo, slideSizes(place.photo.ratio));
      }, HOVER_REST);
    }
  };

  const shade = (row: number, photo: number) =>
    GRAYS[(row + photo) % GRAYS.length];
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

  // The photos either side load while one is shown, so stepping finds them ready.
  useEffect(() => {
    if (!open) return;
    for (const by of [-1, 1]) {
      const next = places[(open.at + by + places.length) % places.length];
      preload(next.photo, ROW_SIZES);
      preload(next.photo, slideSizes(next.photo.ratio));
    }
  }, [open, places]);

  return (
    <>
      <div
        ref={rowsBox}
        data-gallery
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") {
            pointAt((e.target as Element).closest("[data-photo]"));
          }
        }}
        onPointerLeave={() => pointAt(null)}
        className="space-y-8 sm:space-y-12"
      >
        {rows.map((row, r) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are fixed content, never reordered.
            key={r}
            className="row-in"
            style={{ "--row-from": r % 2 ? 1 : -1 } as React.CSSProperties}
          >
            <div data-row className="touch-pan-y overflow-x-clip select-none">
              <div data-track className="flex gap-3 px-4 sm:gap-4 sm:px-8">
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
                      sizes={ROW_SIZES}
                      eager={r === 0 && p < FIRST_SEEN}
                    />
                  </button>
                ))}
              </div>
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
        className="m-0 max-h-none max-w-none touch-pinch-zoom bg-transparent p-0 backdrop:bg-page/95"
      >
        {open && current && (
          <div className="pointer-events-none grid h-dvh w-screen grid-rows-[minmax(0,1fr)_auto] gap-2 px-8 pt-10 sm:px-16 sm:pt-16">
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
                {current.photo.src && (
                  // The row's copy, already loaded, shows until the sharper one arrives.
                  <Image
                    src={current.photo.src}
                    alt=""
                    fill
                    sizes={ROW_SIZES}
                    loading="eager"
                    className="object-cover"
                  />
                )}
                <PhotoFill
                  photo={current.photo}
                  shade={shade(current.row, current.inRow)}
                  sizes={slideSizes(current.photo.ratio)}
                  eager
                />
              </div>
            </div>
            <div className="pointer-events-auto -mx-8 grid grid-cols-[1fr_auto_1fr] font-grotesk text-sm sm:-mx-16">
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => step(-1)}
                className="cursor-pointer pt-4 pr-7 pb-8 text-right sm:pb-10"
              >
                ←
              </button>
              <button
                type="button"
                onClick={close}
                className="cursor-pointer pt-4 pb-8 text-xs hover:underline sm:pb-10"
              >
                Close
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => step(1)}
                className="cursor-pointer pt-4 pb-8 pl-7 text-left sm:pb-10"
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
