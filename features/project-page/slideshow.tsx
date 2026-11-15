"use client";

import { type CSSProperties, useId, useState } from "react";
import { MediaBox } from "./media";
import type { Media, Side, Slide } from "./types";

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
          <p key={p}>{p}</p>
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
  image: Media;
  imageSide: Side;
  slides: Slide[];
}) {
  const [index, setIndex] = useState(0);
  const [back, setBack] = useState(false);
  const go = (to: number) => {
    setBack(to < index);
    setIndex(to);
  };
  const id = useId();
  const slide = slides[index];
  const shown = slide.image ?? image;

  return (
    <section
      aria-roledescription="slideshow"
      aria-labelledby={slide.title ? `${id}-title` : undefined}
      style={{ "--slide-from": back ? "-0.75rem" : "0.75rem" } as CSSProperties}
      className="grid items-start gap-6 sm:grid-cols-2 sm:gap-8"
    >
      <MediaBox
        key={shown.src ?? shown.alt}
        media={shown}
        className={`slide-in ${imageSide === "right" ? "sm:order-last" : ""}`}
      />
      <div>
        <div key={index} aria-live="polite" className="slide-in">
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
