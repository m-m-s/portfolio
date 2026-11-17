// Tables ported from docs/reference/mock-snowy.html.
import type { Sky } from "@/features/weather/sky";

export type Layer = "mid" | "front";
export type Rgb = readonly [number, number, number];
export type Band = "high" | "mid" | "low" | "lowest";

export const COUNT: Record<Sky, Record<Layer, number>> = {
  sunny: { mid: 3, front: 2 },
  "partly-cloudy": { mid: 5, front: 3 },
  cloudy: { mid: 12, front: 7 },
  rainy: { mid: 12, front: 7 },
  snowy: { mid: 12, front: 7 },
};

export const INK: Record<Sky, { far: Rgb; mid: Rgb; front: Rgb }> = {
  sunny: { far: [200, 197, 191], mid: [118, 115, 109], front: [28, 27, 25] },
  "partly-cloudy": {
    far: [200, 197, 191],
    mid: [118, 115, 109],
    front: [28, 27, 25],
  },
  cloudy: { far: [186, 183, 177], mid: [104, 101, 96], front: [26, 25, 23] },
  rainy: { far: [165, 162, 157], mid: [84, 82, 78], front: [18, 17, 16] },
  snowy: { far: [192, 190, 186], mid: [112, 110, 106], front: [34, 33, 31] },
};

export const LAYER = {
  mid: {
    speed: 2.4,
    radius: 46,
    push: 0.38,
    spring: 0.016,
    damp: 0.9,
    maxv: 0.9,
  },
  front: {
    speed: 6,
    radius: 80,
    push: 1.25,
    spring: 0.055,
    damp: 0.85,
    maxv: 9,
  },
} as const;

export const WIDTH: Record<Layer, number> = { front: 300, mid: 220 };

/** Clouds on pages that show the sky only through a window: smaller, so a few fit in the panes. The window is smaller still on a phone. */
export const WINDOW_CLOUD_SCALE = { laptop: 0.5, phone: 0.25 };

/** Below this width (Tailwind's sm), clouds use PHONE_CLOUD_SCALE. */
export const PHONE_WIDTH = 640;

/** Multiplies every cloud's width on phones, per weather. */
export const PHONE_CLOUD_SCALE: Record<Sky, number> = {
  sunny: 1,
  "partly-cloudy": 1,
  cloudy: 0.8,
  rainy: 0.8,
  snowy: 0.8,
};

// The order matters: the seeded layout draws from these lists in this order.
export const CLOUDS = [
  "new-1",
  "new-2",
  "new-3",
  "07-1",
  "10-2",
  "19-2",
  "21-1",
  "22-1",
  "15-1",
  "58-2",
  "35-1",
  "23-1",
  "m29-1",
  "m38-2",
  "m32-1",
  "m41-1",
  "m52-1",
  "m02-1",
  "s19-3",
  "s19-4",
  "s19-5",
  "s19-6",
  "s26-2",
  "s07-4",
  "s08-2",
  "s08-3",
  "s08-4",
  "s08-6",
  "s10-3",
  "s35-2",
  "s59-1",
];

export const FAR = [
  "34",
  "28",
  "31",
  "46",
  "08-field",
  "07-row",
  "19-row",
  "10-row",
  "13",
  "47",
  "39-rows",
];

// Height bands, in sky heights, set by a cloud's bottom edge. Past 1 hangs below the sky.
// Every weather's bands share TOP to BOT, so a fourth band makes each one thinner.
const TOP = 0.3;
const BOT = 1.3;

function bandsFor(sky: Sky): Band[] {
  const extra = sky === "cloudy" || sky === "rainy" || sky === "snowy";
  return extra ? ["high", "mid", "low", "lowest"] : ["high", "mid", "low"];
}

export function bandRanges(sky: Sky) {
  const bands = bandsFor(sky);
  const bw = (BOT - TOP) / bands.length;
  const ranges = new Map<Band, readonly [number, number]>();
  bands.forEach((b, i) => {
    ranges.set(b, [TOP + i * bw, TOP + (i + 1) * bw]);
  });
  return { ranges, bw };
}

/** The sky is the top part of the canvas; clouds and rain can hang below it. */
export const SKY_FRACTION = 0.4;
