import type { Metadata } from "next";
import Link from "next/link";
import { FoodMapButton } from "@/components/food-map";
import { Window } from "@/components/window";
import { type AboutPart, aboutHeading, aboutParagraphs } from "@/content/about";
import { LookOutsideButton } from "@/features/sky/sky-view";

export const metadata: Metadata = { title: "About" };

function Part({ part, tail }: { part: AboutPart; tail: string }) {
  if (typeof part === "string") return part;
  if ("action" in part) {
    const Button =
      part.action === "weather" ? LookOutsideButton : FoodMapButton;
    return (
      <Button>
        {part.text}
        {tail && <span className="font-normal">{tail}</span>}
      </Button>
    );
  }
  return (
    <>
      {part.href.startsWith("/") ? (
        <Link href={part.href} className="font-bold hover:underline">
          {part.text}
        </Link>
      ) : (
        <a href={part.href} className="font-bold hover:underline">
          {part.text}
        </a>
      )}
      {tail}
    </>
  );
}

function glued(paragraph: AboutPart[]) {
  const out: [AboutPart, string][] = [];
  for (const part of paragraph) {
    const prev = out.at(-1);
    const mark = typeof part === "string" ? /^[.,;:!?]/.exec(part) : null;
    if (prev && typeof prev[0] !== "string" && mark) {
      prev[1] = mark[0];
      const rest = (part as string).slice(1);
      if (rest) out.push([rest, ""]);
    } else {
      out.push([part, ""]);
    }
  }
  return out;
}

export default function About() {
  return (
    <main className="relative isolate grid flex-1 content-start px-4 py-12 sm:grid-cols-[minmax(0,34rem)_1fr] sm:gap-x-12 sm:px-12 sm:pt-24 md:px-16 lg:px-[10%] xl:grid-cols-[minmax(0,40rem)_1fr] 2xl:pl-[20%]">
      <h1 className="max-sm:halo self-end pt-40 text-4xl font-bold sm:pt-0 sm:text-5xl lg:pt-16 2xl:pt-24">
        {aboutHeading}
      </h1>
      <Window
        floorLight
        turn={24}
        wide={130}
        className="w-60 max-sm:absolute max-sm:top-4 max-sm:right-4 max-sm:-z-10 sm:row-span-2 sm:row-start-1 sm:col-start-2 sm:-mt-12 sm:w-56 sm:justify-self-center 2xl:h-[26.25rem] 2xl:w-auto"
      />
      <div className="max-sm:halo mt-6 space-y-[1.5em]">
        {aboutParagraphs.map((paragraph) => (
          <p
            key={paragraph
              .map((p) => (typeof p === "string" ? p : p.text))
              .join("")}
            className="leading-relaxed"
          >
            {glued(paragraph).map(([part, tail]) => (
              <Part
                key={typeof part === "string" ? part : part.text}
                part={part}
                tail={tail}
              />
            ))}
          </p>
        ))}
      </div>
    </main>
  );
}
