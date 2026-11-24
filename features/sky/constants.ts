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

export const FAR_LAYER = {
  speed: 0.8,
  radius: 36,
  push: 0.15,
  spring: 0.02,
  damp: 0.9,
  maxv: 0.35,
} as const;

export const WIDTH: Record<Layer, number> = { front: 300, mid: 220 };

export const REFERENCE = { width: 1440, height: 900 };

export const WIDE_WEIGHT = 0.5;

export const SMALL_SCREEN = 640;

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

export const LARGE_CLOUD = 1.75;

export const PLACEMENT: Record<
  Sky,
  { loose: boolean; spreadHeights: boolean; maxLarge: number }
> = {
  sunny: {
    loose: true,
    spreadHeights: false,
    maxLarge: Number.POSITIVE_INFINITY,
  },
  "partly-cloudy": { loose: false, spreadHeights: true, maxLarge: 2 },
  cloudy: {
    loose: false,
    spreadHeights: false,
    maxLarge: Number.POSITIVE_INFINITY,
  },
  rainy: {
    loose: false,
    spreadHeights: false,
    maxLarge: Number.POSITIVE_INFINITY,
  },
  snowy: {
    loose: false,
    spreadHeights: false,
    maxLarge: Number.POSITIVE_INFINITY,
  },
};

export const LOOSE = {
  maxCopies: 2,
  sameLayerGap: 1.25,
  crossLayerGap: 1.12,
  sizeTries: 12,
  stackAllowed: 0.3,
  stackCheckAt: [0, 5],
  offsetTries: 96,
  moveTries: 64,
  frontRoom: 0.25,
  frontCrowding: 10,
} as const;

export const FAR_SIDE_FADE = 0.25;

export const SKY_FRACTION = 0.4;
