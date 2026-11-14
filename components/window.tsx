"use client";

import { useEffect, useId, useRef } from "react";
import { useSky } from "@/features/sky/sky-provider";

import { type HouseShadow, useLiveLight } from "./house";

type Point = [number, number];
/** Across the wall, down from the window's top, and out from the wall into the room. */
type Point3 = [number, number, number];

// A 100 × 150 window in a wall turned on its vertical axis, its right side
// toward the viewer, seen from near its foot. The floor is level, FLOOR below
// the window's top.
const W = 100;
const H = 150;
const TURN = (32 * Math.PI) / 180;
const DISTANCE = 300;
const EYE = 0.8 * H;
const FRAME = 2.5;
const MULLION = 3;
/** A plain ledge under the window: barely wider than it, sticking out into the room, with a thin front edge. */
const SILL = { overhang: 2, depth: 6, thickness: 2.5, shadow: 3 };
const FLOOR = 1.7 * H;
/** How far the floor reaches each way past the window, in its own units: past the edge of any page. */
const FLOOR_SPAN = 1000;
/** Light steeper or shallower than this would throw the patch off the floor or hide it under the window. */
const LIGHT_ALTITUDE = { min: 35, max: 70 };
/** Light always comes in through the window, at least this much head-on, and at most this much sideways. */
const MIN_INWARD = 0.5;
const MAX_SIDEWAYS = 0.6;
/** How far the light travels across the floor, shortened so the patch stays in the room in front of the camera. */
const LIGHT_REACH = 0.25;
/** The light on the floor, as a multiple of the house shadow's strength (so it's bright in sun, faint under clouds and at night). */
const LIGHT_STRENGTH = 1.2;

function project([x, y, z = 0]: [number, number, number?]): Point {
  const across = x - W / 2;
  const depth = across * Math.sin(TURN) + z * Math.cos(TURN);
  const scale = DISTANCE / (DISTANCE - depth);
  return [
    (across * Math.cos(TURN) - z * Math.sin(TURN)) * scale,
    (y - EYE) * scale,
  ];
}

const rect = (x0: number, y0: number, x1: number, y1: number): Point[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

const midX = W / 2;
const midY = H / 2;
const flatPanes = [
  rect(FRAME, FRAME, midX - MULLION / 2, midY - MULLION / 2),
  rect(midX + MULLION / 2, FRAME, W - FRAME, midY - MULLION / 2),
  rect(FRAME, midY + MULLION / 2, midX - MULLION / 2, H - FRAME),
  rect(midX + MULLION / 2, midY + MULLION / 2, W - FRAME, H - FRAME),
];

const S = SILL;
const flatSill = {
  top: [
    [-S.overhang, H, 0],
    [W + S.overhang, H, 0],
    [W + S.overhang, H, S.depth],
    [-S.overhang, H, S.depth],
  ],
  front: [
    [-S.overhang, H, S.depth],
    [W + S.overhang, H, S.depth],
    [W + S.overhang, H + S.thickness, S.depth],
    [-S.overhang, H + S.thickness, S.depth],
  ],
} satisfies Record<string, Point3[]>;

const projected = flatPanes.map((pane) => pane.map(project));
const projectedSill = [flatSill.top.map(project), flatSill.front.map(project)];
const all = [...projected.flat(), ...projectedSill.flat()];
const minX = Math.min(...all.map(([x]) => x));
const minY = Math.min(...all.map(([, y]) => y));
const shift = ([x, y]: Point): Point => [x - minX, y - minY];
const panes = projected.map((pane) => pane.map(shift));
const [sillTop, sillFront] = projectedSill.map((face) => face.map(shift));
// The faint contact shadow on the wall just under the ledge, from the room's light.
const under = H + S.thickness;
const sillShadow = [
  [-S.overhang, under, 0],
  [W + S.overhang, under, 0],
  [W + S.overhang, under + S.shadow, 0],
  [-S.overhang, under + S.shadow, 0],
].map((p) => shift(project(p as Point3)));
const VIEW_W = Math.max(...all.map(([x]) => x)) - minX;
const VIEW_H = Math.max(...all.map(([, y]) => y)) - minY;

// Where the wall meets the floor, drawn as a straight line out past both sides
// of any page (the wall's own far end would stop short where it recedes), then
// down past the foot of any page.
const [wallA, wallB] = [project([0, FLOOR]), project([W, FLOOR])].map(shift);
const floorAt = (x: number): Point => [
  x,
  wallA[1] + ((x - wallA[0]) * (wallB[1] - wallA[1])) / (wallB[0] - wallA[0]),
];
const floorOutline: Point[] = [
  floorAt(wallA[0] - FLOOR_SPAN),
  floorAt(wallB[0] + FLOOR_SPAN),
  [wallB[0] + FLOOR_SPAN, 4000],
  [wallA[0] - FLOOR_SPAN, 4000],
];

/** The panes of light on the floor, from light at the given altitude and azimuth. */
function lightOnFloor(light: HouseShadow, flip: boolean) {
  const rad = Math.PI / 180;
  const altitude = Math.min(
    LIGHT_ALTITUDE.max,
    Math.max(LIGHT_ALTITUDE.min, light.altitude),
  );
  const side = Math.max(
    -MAX_SIDEWAYS,
    Math.min(MAX_SIDEWAYS, -Math.sin(light.azimuth * rad)),
  );
  const inward = Math.max(MIN_INWARD, Math.abs(Math.cos(light.azimuth * rad)));
  const flat = Math.hypot(side, inward);
  const fall = Math.tan(altitude * rad);
  const onFloor = ([x, y]: Point): Point3 => {
    const t = (LIGHT_REACH * (FLOOR - y)) / fall;
    return [x + (t * side) / flat, FLOOR, (t * inward) / flat];
  };
  const cast = flatPanes.map((pane) =>
    pane.map((p) => shift(project(onFloor(p)))),
  );
  return flip ? cast.map(mirror) : cast;
}

const mirror = (pts: Point[]) => pts.map(([x, y]): Point => [VIEW_W - x, y]);
const mirroredPanes = panes.map(mirror);
const sills = {
  plain: { top: sillTop, front: sillFront, shadow: sillShadow },
  mirrored: {
    top: mirror(sillTop),
    front: mirror(sillFront),
    shadow: mirror(sillShadow),
  },
};

const points = (pts: Point[]) =>
  pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

/** A four-pane window at an angle, onto the site's sky: the part of it that's behind each pane. */
export function Window({
  className = "",
  floorLight = false,
  flip = false,
}: {
  className?: string;
  /** Mirrored: the left side toward the viewer. */
  flip?: boolean;
  /** A darker floor below the window, with the window's light falling on it. */
  floorLight?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLCanvasElement>(null);
  const { watch } = useSky();
  const id = useId();
  const light = useLiveLight();
  const shown = flip ? mirroredPanes : panes;
  const floorShown = flip ? mirror(floorOutline) : floorOutline;
  const sill = sills[flip ? "mirrored" : "plain"];

  useEffect(() => {
    const el = box.current;
    const ctx = glass.current?.getContext("2d");
    if (!el || !ctx) return;
    const glassColor = getComputedStyle(el).getPropertyValue("--color-glass");
    return watch((sky) => {
      const r = el.getBoundingClientRect();
      const dpr = sky.width / (sky.clientWidth || 1);
      const w = Math.round(r.width * dpr);
      const h = Math.round(r.height * dpr);
      if (ctx.canvas.width !== w || ctx.canvas.height !== h) {
        ctx.canvas.width = w;
        ctx.canvas.height = h;
      }
      const k = w / VIEW_W;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.beginPath();
      for (const pane of shown) {
        pane.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x * k, y * k);
          else ctx.lineTo(x * k, y * k);
        });
        ctx.closePath();
      }
      ctx.clip();
      ctx.fillStyle = glassColor;
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(sky, r.left * dpr, r.top * dpr, w, h, 0, 0, w, h);
      ctx.restore();
    });
  }, [watch, shown]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}
      className={`relative ${className}`}
    >
      {floorLight && (
        // Behind the page's text: the page needs `isolate` so this stays above its background.
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
        >
          <polygon points={points(floorShown)} className="fill-floor" />
          {light && (
            <g
              className="fill-page"
              style={{
                opacity: Math.min(1, light.opacity * LIGHT_STRENGTH),
                filter: `blur(${light.blur / 2}em)`,
              }}
            >
              {lightOnFloor(light, flip).map((pane) => (
                <polygon key={points(pane)} points={points(pane)} />
              ))}
            </g>
          )}
        </svg>
      )}
      <canvas ref={glass} className="absolute inset-0 h-full w-full" />
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="absolute inset-0 h-full w-full overflow-visible"
      >
        <defs>
          <filter
            id={`${id}-soft`}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          {shown.map((pane, i) => (
            <clipPath key={points(pane)} id={`${id}-pane-${i}`}>
              <polygon points={points(pane)} />
            </clipPath>
          ))}
        </defs>
        {/* The bezel: each pane sits back in the frame, shaded along its top and left. */}
        {shown.map((pane, i) => (
          <polyline
            key={points(pane)}
            points={points([pane[3], pane[0], pane[1]])}
            clipPath={`url(#${id}-pane-${i})`}
            filter={`url(#${id}-soft)`}
            className="fill-none stroke-bevel [stroke-width:3]"
          />
        ))}
        <polygon
          points={points(sill.shadow)}
          filter={`url(#${id}-soft)`}
          className="fill-bevel"
        />
        <polygon points={points(sill.top)} className="fill-sill" />
        <polygon points={points(sill.front)} className="fill-sill-edge" />
      </svg>
    </div>
  );
}
