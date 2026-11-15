"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/content/photography";

const GRAYS = ["bg-photo-1", "bg-photo-2", "bg-photo-3"];
/** A swipe shorter than this, in pixels, isn't a swipe. */
const SWIPE = 40;

function PhotoFill({
  photo,
  shade,
  sizes,
  priority = false,
}: {
  photo: Photo;
  shade: string;
  sizes: string;
  priority?: boolean;
}) {
  return photo.src ? (
    <Image
      src={photo.src}
      alt={photo.alt}
      fill
      sizes={sizes}
      priority={priority}
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

type Open = { row: number; photo: number };

export function Gallery({ rows }: { rows: Photo[][] }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<Open | null>(null);
  const swipeFrom = useRef<number | null>(null);

  const shade = (row: number, photo: number) =>
    GRAYS[(row + photo) % GRAYS.length];

  const step = useCallback(
    (by: number) => {
      setOpen((o) => {
        if (!o) return o;
        const last = rows[o.row].length - 1;
        return { ...o, photo: Math.min(last, Math.max(0, o.photo + by)) };
      });
    },
    [rows],
  );

  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);

  const close = () => dialog.current?.close();

  const current = open ? rows[open.row][open.photo] : null;

  return (
    <>
      <div className="space-y-10 sm:space-y-20">
        {rows.map((row, r) => (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: rows are fixed content, never reordered.
            key={r}
            className="flex gap-3 overflow-x-auto px-4 [scrollbar-width:none] sm:gap-4 sm:px-8"
          >
            {row.map((photo, p) => (
              <button
                key={photo.src ?? photo.alt}
                type="button"
                aria-label={`Open ${photo.alt}`}
                onClick={() => setOpen({ row: r, photo: p })}
                style={{ aspectRatio: photo.ratio }}
                className="relative h-56 flex-none cursor-zoom-in overflow-hidden sm:h-80 lg:h-[min(28rem,60vh)]"
              >
                <PhotoFill
                  photo={photo}
                  shade={shade(r, p)}
                  sizes="(min-width: 1024px) 50rem, (min-width: 640px) 36rem, 25rem"
                  priority={r < 2}
                />
              </button>
            ))}
          </div>
        ))}
      </div>

      <dialog
        ref={dialog}
        aria-label="Photo"
        onClose={() => setOpen(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") step(-1);
          if (e.key === "ArrowRight") step(1);
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
        className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-page/95 open:grid open:h-dvh open:w-screen open:place-items-center"
      >
        {open && current && (
          <div className="pointer-events-none flex max-h-full max-w-full flex-col items-center gap-4 p-4 sm:p-8">
            <div
              key={current.src ?? current.alt}
              style={{
                aspectRatio: current.ratio,
                width: `min(100vw - 2rem, (100dvh - 8rem) * ${current.ratio})`,
              }}
              className="pointer-events-auto relative animate-[fade-in_300ms_ease]"
            >
              <PhotoFill
                photo={current}
                shade={shade(open.row, open.photo)}
                sizes="90vw"
              />
            </div>
            <div className="pointer-events-auto flex items-center gap-3 font-grotesk text-sm">
              <button
                type="button"
                aria-label="Previous photo"
                disabled={open.photo === 0}
                onClick={() => step(-1)}
                className="cursor-pointer px-1 text-lg disabled:cursor-default disabled:opacity-25"
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next photo"
                disabled={open.photo === rows[open.row].length - 1}
                onClick={() => step(1)}
                className="cursor-pointer px-1 text-lg disabled:cursor-default disabled:opacity-25"
              >
                →
              </button>
              <button
                type="button"
                onClick={close}
                className="ml-6 cursor-pointer hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
