"use client";

import { useId, useState } from "react";
import type { Photo } from "@/content/photography";
import { LiveCloud } from "@/features/sky/live-cloud";
import { JoustingEngine } from "./diagrams/jousting-engine";
import { besideText, MediaBox } from "./media";
import { RichText } from "./rich-text";
import type { Diagram, Side, Slide } from "./types";

const arrow =
  "cursor-pointer px-2 text-lg disabled:cursor-default disabled:opacity-25";

const diagrams = { "jousting-engine": JoustingEngine };

export function Slideshow({
  image,
  live,
  diagram,
  imageSide,
  slides,
}: {
  image?: Photo;
  live?: "cloud";
  diagram?: Diagram;
  imageSide?: Side;
  slides: Slide[];
}) {
  const [index, setIndex] = useState(0);
  const id = useId();
  const images = [...new Set(slides.map((s) => s.image ?? image))].filter(
    (m) => m !== undefined,
  );
  const shown = slides[index].image ?? image;
  const Figure = diagram && diagrams[diagram];
  const right = imageSide === "right";
  const visual = Boolean(Figure) || images.length > 0;
  const columns = visual ? besideText(images, right) : "";
  const textColumn = visual
    ? right
      ? "sm:col-start-1"
      : "sm:col-start-2"
    : "";
  const phone = Figure
    ? { visual: "order-3", text: "order-1", controls: "order-2" }
    : { visual: "", text: "", controls: "" };

  return (
    <section
      aria-roledescription="slideshow"
      aria-labelledby={slides[index].title ? `${id}-${index}` : undefined}
    >
      <div className={`grid items-start gap-6 sm:gap-x-8 ${columns}`}>
        {visual && (
          <div
            className={`grid ${phone.visual} sm:order-none sm:row-start-1 ${right ? "sm:col-start-2" : "sm:col-start-1"}`}
          >
            {Figure && (
              <>
                {/* Unseen copies, one per step, hold the diagram at its tallest so moving never shifts the page. */}
                {[...new Set(slides.map((slide) => slide.step))].map((step) => (
                  <div
                    key={step ?? ""}
                    aria-hidden="true"
                    className="invisible [grid-area:1/1]"
                  >
                    <Figure active={step} />
                  </div>
                ))}
                <div className="[grid-area:1/1]">
                  <Figure active={slides[index].step} />
                </div>
              </>
            )}
            {images.map((media) => (
              <div
                key={media.src ?? media.alt}
                data-slide-image={media === shown ? "current" : "hidden"}
                aria-hidden={media !== shown}
                className="[grid-area:1/1]"
              >
                {live && media === image ? (
                  <LiveCloud
                    label={media.alt}
                    ratio={media.ratio}
                    active={media === shown}
                  />
                ) : (
                  <MediaBox media={media} />
                )}
              </div>
            ))}
          </div>
        )}
        <div
          className={`grid ${phone.text} sm:order-none sm:row-start-1 ${textColumn}`}
        >
          {slides.map((slide, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: slides are fixed content, never reordered.
              key={i}
              data-slide={i === index ? "current" : i < index ? "past" : "next"}
              aria-hidden={i !== index}
              inert={i !== index}
              className="[grid-area:1/1]"
            >
              {slide.title && (
                <h2 id={`${id}-${i}`} className="mb-4 text-lg font-semibold">
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
              {slide.hint && visual && (
                <p className="mt-4 font-grotesk text-sm text-ink/65">
                  <span aria-hidden="true">
                    <span className="sm:hidden">{Figure ? "↓" : "↑"}</span>
                    <span className="hidden sm:inline">
                      {right ? "→" : "←"}
                    </span>
                  </span>{" "}
                  {slide.hint}
                </p>
              )}
            </div>
          ))}
        </div>
        <div
          className={`flex items-center justify-center gap-3 font-grotesk text-sm ${phone.controls} sm:order-none ${visual ? "sm:col-span-2" : ""}`}
        >
          <button
            type="button"
            aria-label="Previous slide"
            disabled={index === 0}
            onClick={() => setIndex(index - 1)}
            className={arrow}
          >
            ←
          </button>
          <span aria-live="polite" className="tabular-nums">
            {index + 1}/{slides.length}
          </span>
          <button
            type="button"
            aria-label="Next slide"
            disabled={index === slides.length - 1}
            onClick={() => setIndex(index + 1)}
            className={arrow}
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}
