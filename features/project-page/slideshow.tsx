"use client";

import { type CSSProperties, useId, useState } from "react";
import type { Photo } from "@/content/photography";
import { MediaBox } from "./media";
import { RichText } from "./rich-text";
import type { Side, Slide } from "./types";

function SlideText({ slide, titleId }: { slide: Slide; titleId: string }) {
  return (
    <>
      {slide.title && (
        <h2 id={titleId} className="mb-4 text-lg font-semibold">
          {slide.title}
        </h2>
      )}
      <div className="space-y-4">
        {slide.paragraphs.map((p) => (
          <p key={p}>
            <RichText text={p} />
          </p>
        ))}
      </div>
    </>
  );
}

const arrow =
  "cursor-pointer px-1 text-lg disabled:cursor-default disabled:opacity-25";

export function Slideshow({
  image,
  imageSide,
  slides,
}: {
  image: Photo;
  imageSide: Side;
  slides: Slide[];
}) {
  const [index, setIndex] = useState(0);
  // Which way the last move went: nothing slides in until the reader moves.
  const [dir, setDir] = useState(0);
  const go = (to: number) => {
    setDir(Math.sign(to - index));
    setIndex(to);
  };
  const slideIn = dir ? "slide-in" : "";
  const id = useId();
  const slide = slides[index];
  const shown = slide.image ?? image;

  return (
    <section
      aria-roledescription="slideshow"
      aria-labelledby={slide.title ? `${id}-title` : undefined}
      style={
        { "--slide-from": dir < 0 ? "-0.75rem" : "0.75rem" } as CSSProperties
      }
      className="grid items-start gap-6 sm:grid-cols-2 sm:gap-8"
    >
      <MediaBox
        key={shown.src ?? shown.alt}
        media={shown}
        className={`${slideIn} ${imageSide === "right" ? "sm:order-last" : ""}`}
      />
      <div>
        <div key={index} aria-live="polite" className={slideIn}>
          <SlideText slide={slide} titleId={`${id}-title`} />
        </div>
        <div className="mt-6 flex items-center gap-3 font-grotesk text-sm">
          <button
            type="button"
            aria-label="Previous slide"
            disabled={index === 0}
            onClick={() => go(index - 1)}
            className={arrow}
          >
            ←
          </button>
          <span className="tabular-nums">
            {index + 1}/{slides.length}
          </span>
          <button
            type="button"
            aria-label="Next slide"
            disabled={index === slides.length - 1}
            onClick={() => go(index + 1)}
            className={arrow}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
