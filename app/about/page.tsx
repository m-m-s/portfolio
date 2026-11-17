import { FoodMapButton } from "@/components/food-map";
import { RoomLink } from "@/components/room-link";
import { Window } from "@/components/window";
import { type AboutPart, aboutHeading, aboutParagraphs } from "@/content/about";
import { LookOutside } from "@/features/sky/sky-view";
import { getWeather, type Weather } from "@/features/weather/get-weather";

/** The food-map button is an inline block, which can't share a wrapped line with the text after it, so trailing punctuation rides inside it. */
function Part({
  part,
  tail,
  live,
}: {
  part: AboutPart;
  tail: string;
  live: Weather;
}) {
  if (typeof part === "string") return part;
  if ("action" in part && part.action === "weather") {
    return (
      <LookOutside live={live}>
        {part.text}
        {tail && <span className="font-normal">{tail}</span>}
      </LookOutside>
    );
  }
  if ("action" in part && part.action === "food-map") {
    return (
      <FoodMapButton>
        {part.text}
        {tail && <span className="font-normal">{tail}</span>}
      </FoodMapButton>
    );
  }
  return (
    <>
      {"action" in part ? (
        <span className="font-bold">{part.text}</span>
      ) : part.href.startsWith("/") ? (
        <RoomLink href={part.href}>{part.text}</RoomLink>
      ) : (
        <a href={part.href} className="font-bold hover:underline">
          {part.text}
        </a>
      )}
      {tail}
    </>
  );
}

/** Pairs each link with the punctuation right after it. */
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

export default async function About() {
  const live = await getWeather();
  return (
    <main className="relative isolate grid flex-1 content-start px-4 py-12 sm:grid-cols-[minmax(0,34rem)_1fr] sm:gap-x-12 sm:px-8 sm:pt-24 lg:pl-[10%] xl:grid-cols-[minmax(0,40rem)_1fr] 2xl:grid-cols-[minmax(0,46rem)_1fr] 2xl:text-lg">
      <h1 className="max-sm:halo self-end pt-40 text-4xl font-bold sm:pt-0 sm:text-5xl">
        {aboutHeading}
      </h1>
      <Window
        floorLight
        className="w-60 max-sm:absolute max-sm:top-4 max-sm:right-4 max-sm:-z-10 sm:row-span-2 sm:row-start-1 sm:col-start-2 sm:-mt-12 sm:w-56 sm:justify-self-center"
      />
      <div className="max-sm:halo mt-6 space-y-6 xl:space-y-12">
        {aboutParagraphs.map((paragraph, i) => (
          <p
            key={paragraph
              .map((p) => (typeof p === "string" ? p : p.text))
              .join("")}
            className={`leading-relaxed ${i % 2 ? "xl:mr-[-5rem] xl:ml-20" : ""}`}
          >
            {glued(paragraph).map(([part, tail]) => (
              <Part
                key={typeof part === "string" ? part : part.text}
                part={part}
                tail={tail}
                live={live}
              />
            ))}
          </p>
        ))}
      </div>
    </main>
  );
}
