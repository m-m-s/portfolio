"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { intro } from "@/content/home";
import { useSky } from "@/features/sky/sky-provider";
import type { Sky } from "@/features/weather/sky";
import {
  isNight,
  moonPosition,
  sunPosition,
} from "@/features/weather/sun-and-moon";
import { DoorLink } from "./door-link";

/** How the shadow is cast, anchored at the house's bottom edge. */
export type HouseShadow = {
  /** Degrees; positive leans the shadow right. */
  lean: number;
  /** 0 to 1: how far it reaches up behind the house, as a share of the house's height. */
  reach: number;
  opacity: number;
  /** In em. */
  blur: number;
  /** Where the light comes from, in degrees: above the horizon (as cast, always above it) and clockwise from north. */
  altitude: number;
  azimuth: number;
};

export type ShadowTuning = {
  length: number;
  /** How upright the shadow stands against a sideways light: higher leans it less. */
  depth: number;
  strength: number;
  /** Moon shadow strength as a share of the sun's. */
  moonlight: number;
  blur: number;
};

const MIN_REACH = 0.6;
/** Degrees: a light low in the east or west would otherwise lay the shadow nearly flat. */
const MAX_LEAN = 40;

/** Clouds soften the light: a fainter, blurrier shadow. Multiplies the tuning's strength and blur. */
const WEATHER_LIGHT: Record<Sky, { strength: number; blur: number }> = {
  sunny: { strength: 1, blur: 0.5 },
  "partly-cloudy": { strength: 0.8, blur: 0.8 },
  cloudy: { strength: 0.6, blur: 2 },
  rainy: { strength: 0.5, blur: 2.5 },
  snowy: { strength: 0.55, blur: 2 },
};

export const SHADOW_TUNING: ShadowTuning = {
  length: 0.23,
  depth: 1,
  strength: 0.5,
  moonlight: 0.6,
  blur: 0.15,
};

/** The house faces south, seen from the front: morning sun (east) throws the shadow left, evening right. At night the moon casts it. */
export function castShadow(
  date: Date,
  sky: Sky,
  t: ShadowTuning = SHADOW_TUNING,
): HouseShadow {
  const weather = WEATHER_LIGHT[sky];
  const sun = sunPosition(date);
  const moon = isNight(date) ? moonPosition(date) : null;
  const light = moon ?? sun;
  // Stylized so a shadow is always there: a moon below the horizon still casts, and the shadow always falls behind.
  const altitude = Math.max(6, Math.abs(light.altitude));
  const rad = Math.PI / 180;
  const long = Math.min(4, 1 / Math.tan(altitude * rad)) * t.length;
  // The direction alone sets the lean, so length never changes the angle.
  const lean =
    Math.atan2(
      -Math.sin(light.azimuth * rad),
      Math.abs(Math.cos(light.azimuth * rad)) * t.depth,
    ) / rad;
  return {
    lean: Math.max(-MAX_LEAN, Math.min(MAX_LEAN, lean)),
    reach: Math.min(1, Math.max(MIN_REACH, long)),
    opacity:
      weather.strength *
      (moon ? t.strength * t.moonlight * (0.6 + 0.4 * moon.lit) : t.strength),
    blur: t.blur * weather.blur,
    altitude,
    azimuth: light.azimuth,
  };
}

type Box = { left: number; right: number; top: number; bottom: number };

/** The intro's outline: a chimney around the first line, a body around the rest, the roof cut from the second line's end to the third line's foot. */
function outline(lines: Box[], padX: number, pad: number) {
  const [chimney, roofLine, eaveLine, ...rest] = lines;
  const body = [roofLine, eaveLine, ...rest];
  const left = Math.min(...lines.map((l) => l.left)) - padX;
  const right = Math.max(...body.map((l) => l.right)) + padX;
  const chimneyRight = chimney.right + padX;
  const chimneyTop = chimney.top - pad;
  const bodyTop = roofLine.top - pad / 2;
  const bottom = body[body.length - 1].bottom + pad;
  const roofStart = Math.min(
    right,
    Math.max(chimneyRight, roofLine.right + padX),
  );
  const eave = Math.max(bodyTop, eaveLine.bottom);
  return [
    [left, chimneyTop],
    [chimneyRight, chimneyTop],
    [chimneyRight, bodyTop],
    [roofStart, bodyTop],
    [right, eave],
    [right, bottom],
    [left, bottom],
  ]
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(" ");
}

/** The live NYC light (sun or moon, softened by the sky's weather), recast every minute. Null until mounted. */
export function useLiveLight() {
  const { weather } = useSky();
  const [light, setLight] = useState<HouseShadow | null>(null);
  useEffect(() => {
    const update = () => setLight(castShadow(new Date(), weather));
    update();
    const timer = setInterval(update, 60_000);
    return () => clearInterval(timer);
  }, [weather]);
  return light;
}

export function LiveHouse() {
  return <House shadow={useLiveLight()} />;
}

export function House({ shadow }: { shadow: HouseShadow | null }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const [points, setPoints] = useState("");

  useLayoutEffect(() => {
    const h = heading.current;
    if (!h) return;
    const measure = () => {
      const box = h.getBoundingClientRect();
      // The walk-up scales the house; measure it at its real size.
      const scale = box.width / (h.offsetWidth || 1) || 1;
      const style = getComputedStyle(h);
      const em = Number.parseFloat(style.fontSize);
      const pad = em * Number.parseFloat(style.getPropertyValue("--house-pad"));
      const padX =
        em * Number.parseFloat(style.getPropertyValue("--house-pad-x"));
      const range = document.createRange();
      const lines = [...h.querySelectorAll<HTMLElement>("[data-line]")].map(
        (line) => {
          range.selectNodeContents(line);
          const r = range.getBoundingClientRect();
          return {
            left: (r.left - box.left) / scale,
            right: (r.right - box.left) / scale,
            top: (r.top - box.top) / scale,
            bottom: (r.bottom - box.top) / scale,
          };
        },
      );
      if (lines.length >= 4) setPoints(outline(lines, padX, pad));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(h);
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative isolate">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
      >
        {shadow && points && (
          <polygon
            points={points}
            className="with-sky fill-house-shadow"
            style={{
              fillOpacity: shadow.opacity,
              filter: `blur(${shadow.blur}em)`,
              transformBox: "fill-box",
              transformOrigin: "bottom",
              transform: `skewX(${-shadow.lean}deg) scaleY(${shadow.reach})`,
            }}
          />
        )}
        {points && <polygon points={points} className="fill-page" />}
      </svg>
      <h1
        ref={heading}
        className="font-grotesk text-intro leading-tight whitespace-nowrap"
      >
        {intro.map((line) => (
          <span
            key={line.map((part) => part.text).join("")}
            data-line
            className="block w-fit"
          >
            {line.map((part) =>
              part.href ? (
                <DoorLink
                  key={part.text}
                  href={part.href}
                  className="font-sans font-bold"
                >
                  {part.text}
                </DoorLink>
              ) : (
                part.text
              ),
            )}
          </span>
        ))}
      </h1>
    </div>
  );
}
