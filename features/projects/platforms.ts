export type Point = [number, number];

/** A step seen corner-on: its top face and its front face, which runs down past the page's foot. */
export type Platform = {
  top: Point[];
  front: Point[];
  /** Middle of the top face: where the name sits. */
  label: Point;
};

/** Every number is a share of the room's width, except `bottom`, which is measured up from the room's foot. */
type Shape = {
  /** The lowest step's near corner, across the room. */
  cornerX: number;
  /** How far above the room's foot that corner sits. */
  bottom: number;
  /** The top's front edge runs left from the corner, rising a little. */
  frontWidth: number;
  frontRise: number;
  /** The top's other edge runs back from the corner, to the right and up. */
  backWidth: number;
  backRise: number;
  /** Each step's front face: how much higher its top is than the back of the step below. */
  step: number;
};

/** Seen almost head on from the left: the steps climb up the page and off its right edge. */
const PHONE: Shape = {
  cornerX: 1.1,
  bottom: 0.15,
  frontWidth: 1.1,
  frontRise: 0,
  backWidth: 0.17,
  backRise: 0.15,
  step: 0.2,
};

/** Seen from a corner, low: the steps climb from bottom left to top right, their sides one wall. */
const DESKTOP: Shape = {
  cornerX: 0.382,
  bottom: 0.06,
  frontWidth: 0.37,
  frontRise: 0.027,
  backWidth: 0.266,
  backRise: 0.0375,
  step: 0.095,
};

/** The room widths the two shapes are tuned for; between them the numbers blend. */
const PHONE_WIDTH = 390;
const DESKTOP_WIDTH = 1280;

/** How far the faces run below the room's foot, so they reach past the page's bottom. */
const DEPTH = 2000;

function shapeFor(width: number): Shape {
  const t = Math.min(
    1,
    Math.max(0, (width - PHONE_WIDTH) / (DESKTOP_WIDTH - PHONE_WIDTH)),
  );
  const mix = (key: keyof Shape) =>
    PHONE[key] + (DESKTOP[key] - PHONE[key]) * t;
  return Object.fromEntries(
    (Object.keys(PHONE) as (keyof Shape)[]).map((key) => [key, mix(key)]),
  ) as Shape;
}

/** How steeply the steps' sides recede, rising to the right, at this room width: the side wall, for anything set in it. */
export function sideSlope(width: number) {
  const s = shapeFor(width);
  return s.backRise / s.backWidth;
}

/**
 * A staircase for a room of the given size, in pixels: one step per project,
 * lowest first, and the side wall they share.
 */
export function staircase(
  count: number,
  width: number,
  height: number,
): { steps: Platform[]; side: Point[] } {
  const s = shapeFor(width);
  const w = (n: number) => n * width;
  const down = (p: Point): Point => [p[0], p[1] + DEPTH];
  const steps: Platform[] = [];
  const profile: Point[] = [];
  // Each step stands on the back edge of the one below, so the steps' sides
  // always lie in one plane, whatever the numbers.
  let corner: Point = [w(s.cornerX), height - w(s.bottom)];
  for (let i = 0; i < count; i++) {
    const left: Point = [
      corner[0] - w(s.frontWidth),
      corner[1] - w(s.frontRise),
    ];
    const right: Point = [
      corner[0] + w(s.backWidth),
      corner[1] - w(s.backRise),
    ];
    const back: Point = [left[0] + w(s.backWidth), left[1] - w(s.backRise)];
    steps.push({
      top: [corner, right, back, left],
      front: [left, corner, down(corner), down(left)],
      // The part of the top face that's on screen: on a phone most of it is off the right edge.
      label: [
        (Math.max(left[0], 0) + Math.min(right[0], width)) / 2,
        (left[1] + right[1]) / 2,
      ],
    });
    profile.push(corner, right);
    corner = [right[0], right[1] - w(s.step)];
  }
  const last = profile[profile.length - 1];
  return { steps, side: [...profile, down(last), down(profile[0])] };
}
