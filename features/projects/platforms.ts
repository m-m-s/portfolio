export type Point = [number, number];

/** A step seen corner-on: its top face and its front face, which runs down past the page's foot. */
export type Platform = {
  top: Point[];
  front: Point[];
  /** Its own part of the side wall, for when it rises out of line with the others. */
  side: Point[];
  /** Height of a front face between steps, in pixels: how far a step can rise. */
  riser: number;
  /** Bottom middle of the project's name and tagline: on the top, a little behind its front edge. */
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
  bottom: 0.03,
  frontWidth: 1.1,
  frontRise: 0,
  backWidth: 0.17,
  backRise: 0.15,
  step: 0.2,
};

/** Seen from a corner, low: the steps climb from bottom left to top right, their sides one wall. */
const DESKTOP: Shape = {
  cornerX: 0.382,
  bottom: 0.03,
  frontWidth: 0.37,
  frontRise: 0.027,
  backWidth: 0.266,
  backRise: 0.0375,
  step: 0.095,
};

/** The room widths the two shapes are tuned for; between them the numbers blend. */
const DESIGN_PHONE_WIDTH = 390;
const DESKTOP_WIDTH = 1280;

/** How far the faces run below the room's foot, so they reach past the page's bottom. */
const DEPTH = 2000;

/** How far x is from `from` to `to`, from 0 to 1. */
export const progress = (x: number, from: number, to: number) =>
  Math.min(1, Math.max(0, (x - from) / (to - from)));

function shapeFor(width: number): Shape {
  const t = progress(width, DESIGN_PHONE_WIDTH, DESKTOP_WIDTH);
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

/** From this room width the staircase shrinks so the empty step's near corner comes on screen; below it the step runs off the right edge. */
const EXTRA_STEP_WIDTH = 1536;
/** How far inside the room's right edge the empty step's near corner sits then, in the staircase's units. */
const EXTRA_STEP_INSET = 0.1;

/**
 * A staircase for a room of the given size, in pixels: one step per project,
 * lowest first, then an empty step above them, and the side wall they all share.
 */
export function staircase(
  count: number,
  width: number,
  height: number,
): { steps: Platform[]; side: Point[] } {
  const s = shapeFor(width);
  // The back corner of the highest project's top, above the room's foot, per unit of scale.
  const rise =
    s.bottom + (count - 1) * (s.backRise + s.step) + s.frontRise + s.backRise;
  // Across the room, to the empty step's near corner (plus a little), per unit of scale.
  const reach = s.cornerX + count * s.backWidth + EXTRA_STEP_INSET;
  const maxRise =
    0.7 + 0.1 * progress(width, 1024, 1280) - 0.1 * progress(width, 1280, 1920);
  const unit =
    Math.min(
      width,
      (maxRise * height) / rise,
      width >= EXTRA_STEP_WIDTH ? width / reach : Number.POSITIVE_INFINITY,
    ) *
    (1 - 0.25 * progress(width, 1440, 2560));
  const w = (n: number) => n * unit;
  const down = (p: Point): Point => [p[0], p[1] + DEPTH];
  const steps: Platform[] = [];
  const profile: Point[] = [];
  // Each step stands on the back edge of the one below, so the steps' sides
  // always lie in one plane.
  let corner: Point = [
    Math.max(0, width - unit * reach) +
      w(s.cornerX) +
      0.1 * width * progress(width, 1600, 2560),
    height - w(s.bottom),
  ];
  while (steps.length <= count) {
    const left: Point = [
      corner[0] - w(s.frontWidth),
      corner[1] - w(s.frontRise),
    ];
    const right: Point = [
      corner[0] + w(s.backWidth),
      corner[1] - w(s.backRise),
    ];
    const back: Point = [left[0] + w(s.backWidth), left[1] - w(s.backRise)];
    // Centered across the part of the top that's on screen, on a line 30% of the way back.
    const x = (Math.max(left[0], 0) + Math.min(right[0], width)) / 2;
    const [dx, dy] = [0.3 * (back[0] - left[0]), 0.3 * (back[1] - left[1])];
    const y =
      left[1] +
      dy +
      ((x - left[0] - dx) * (corner[1] - left[1])) / (corner[0] - left[0]);
    steps.push({
      top: [corner, right, back, left],
      front: [left, corner, down(corner), down(left)],
      // 1px past its right edge, under the next step's side: meeting exactly, the
      // antialiased edge lets the lighter face behind show through as a hairline.
      side: [
        corner,
        [right[0] + 1, right[1]],
        down([right[0] + 1, right[1]]),
        down(corner),
      ],
      riser: w(s.step),
      label: [x, y],
    });
    profile.push(corner, right);
    corner = [right[0], right[1] - w(s.step)];
  }
  const last = profile[profile.length - 1];
  return { steps, side: [...profile, down(last), down(profile[0])] };
}
