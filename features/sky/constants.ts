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

/** The far strip: it drifts at a third of the middle layer's speed, and its dots stir for the cursor or a finger more faintly than any cloud's. */
export const FAR_LAYER = {
  speed: 0.8,
  radius: 36,
  push: 0.15,
  spring: 0.02,
  damp: 0.9,
  maxv: 0.35,
} as const;

export const WIDTH: Record<Layer, number> = { front: 300, mid: 220 };

/** On pages that show the sky through a window, clouds scale with the window's width: full size for a window this wide, in px, and in proportion either side (half size in a 224px window). */
export const WINDOW_FOR_FULL_CLOUDS = 448;

/** Window clouds never go smaller than this, however small the window: smaller dithers lose the clouds' shapes. */
export const MIN_WINDOW_CLOUDS = 0.45;

/** The window the sky was tuned in. Bigger screens grow the clouds and far strip and add clouds to keep the tuned spacing; smaller ones keep the tuned sizes (phones have their own scale). */
export const REFERENCE = { width: 1440, height: 900 };

/** How much the width counts toward the growth, against the sky's height: 0 grows by height only (wide screens aren't much taller, so the clouds stay smallish), 1 by width only (they crowd the top). */
export const WIDE_WEIGHT = 0.5;

export const SMALL_SCREEN = 640;

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

/** Weathers retuned in their mock with the site's scaling. They also spread each layer's heights across the range, and cap large clouds (Smallest–Largest midpoint at LARGE_CLOUD or more) at MAX_LARGE per layer. Add a weather here once its mock is retuned. */
export const RETUNED_SKIES: ReadonlySet<Sky> = new Set(["partly-cloudy"]);
export const LARGE_CLOUD = 1.75;
export const MAX_LARGE = 2;

/** Each side of a far strip thins out over this share of its width, and tiles overlap by it, so the joins crossfade instead of showing a seam. */
export const FAR_SIDE_FADE = 0.25;

/** The sky is this share of the screen's height, per weather; clouds and rain can hang below it. */
export const SKY_FRACTION: Record<Sky, number> = {
  sunny: 0.4,
  "partly-cloudy": 0.4,
  cloudy: 0.4,
  rainy: 0.4,
  snowy: 0.4,
};
