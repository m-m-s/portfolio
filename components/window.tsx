"use client";

import { useEffect, useId, useRef } from "react";
import { useSky } from "@/features/sky/sky-provider";

import { type HouseShadow, useLiveLight } from "./house";

type Point = [number, number];
/** Across the wall, down from the window's top, and out from the wall into the room. */
type Point3 = [number, number, number];

// A 100 × 150 window in a wall turned on its vertical axis (by default its
// right side toward the viewer), seen from near its foot. The floor is level,
// FLOOR below the window's top.
const W = 100;
const H = 150;
/** The wall's turn, in degrees, unless a page asks for another. */
const TURN = 32;
const DISTANCE = 300;
/** The viewer's eye height, as a share of the window's height down from its top, unless a page asks for another. */
const EYE = 0.8;
const FRAME = 2.5;
const MULLION = 3;
/** A plain ledge right under the glass, exactly as wide as it (all of it in the window's light), sticking out into the room, with a soft shadow below. */
const SILL = { depth: 6, shadow: 3 };
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

const rad = (deg: number) => (deg * Math.PI) / 180;

function projector(turn: number, eye: number) {
  const t = rad(turn);
  return ([x, y, z = 0]: [number, number, number?]): Point => {
    const across = x - W / 2;
    const depth = across * Math.sin(t) + z * Math.cos(t);
    const scale = DISTANCE / (DISTANCE - depth);
    return [
      (across * Math.cos(t) - z * Math.sin(t)) * scale,
      (y - eye * H) * scale,
    ];
  };
}

const rect = (x0: number, y0: number, x1: number, y1: number): Point[] => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

/** The window's flat parts, before projection. */
function flatParts() {
  const midX = W / 2;
  const midY = H / 2;
  const S = SILL;
  // The ledge sits right under the glass (no strip of wall between them).
  const ledge = H - FRAME;
  return {
    panes: [
      rect(FRAME, FRAME, midX - MULLION / 2, midY - MULLION / 2),
      rect(midX + MULLION / 2, FRAME, W - FRAME, midY - MULLION / 2),
      rect(FRAME, midY + MULLION / 2, midX - MULLION / 2, H - FRAME),
      rect(midX + MULLION / 2, midY + MULLION / 2, W - FRAME, H - FRAME),
    ],
    sillTop: [
      [FRAME, ledge, 0],
      [W - FRAME, ledge, 0],
      [W - FRAME, ledge, S.depth],
      [FRAME, ledge, S.depth],
    ] as Point3[],
    // The faint contact shadow on the wall just under the ledge, from the room's light.
    sillShadow: [
      [FRAME, ledge, 0],
      [W - FRAME, ledge, 0],
      [W - FRAME, ledge + S.shadow, 0],
      [FRAME, ledge + S.shadow, 0],
    ] as Point3[],
  };
}

/**
 * The turn, in degrees, at which the window's foot runs across the screen at
 * this slope (down per across; positive when its left end is higher, i.e. farther).
 */
export function turnForSlope(slope: number, eye = EYE) {
  const footSlope = (turn: number) => {
    const project = projector(turn, eye);
    const [a, b] = [project([0, H]), project([W, H])];
    return (b[1] - a[1]) / (b[0] - a[0]);
  };
  let [lo, hi] = [0, 80];
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (footSlope(mid) < Math.abs(slope)) lo = mid;
    else hi = mid;
  }
  return Math.sign(slope) * lo;
}

const mirrorIn = (width: number) => (pts: Point[]) =>
  pts.map(([x, y]): Point => [width - x, y]);

function build(turn: number, eye: number) {
  const project = projector(turn, eye);
  const flat = flatParts();
  const projected = flat.panes.map((pane) => pane.map(project));
  const projectedSill = flat.sillTop.map(project);
  const all = [...projected.flat(), ...projectedSill];
  const minX = Math.min(...all.map(([x]) => x));
  const minY = Math.min(...all.map(([, y]) => y));
  const shift = ([x, y]: Point): Point => [x - minX, y - minY];
  const viewW = Math.max(...all.map(([x]) => x)) - minX;
  const viewH = Math.max(...all.map(([, y]) => y)) - minY;
  const mirror = mirrorIn(viewW);

  // Where the wall meets the floor, drawn as a straight line out past both sides
  // of any page (the wall's own far end would stop short where it recedes), then
  // down past the foot of any page.
  const [wallA, wallB] = [project([0, FLOOR]), project([W, FLOOR])].map(shift);
  const floorAt = (x: number): Point => [
    x,
    wallA[1] + ((x - wallA[0]) * (wallB[1] - wallA[1])) / (wallB[0] - wallA[0]),
  ];
  const floor: Point[] = [
    floorAt(wallA[0] - FLOOR_SPAN),
    floorAt(wallB[0] + FLOOR_SPAN),
    [wallB[0] + FLOOR_SPAN, 4000],
    [wallA[0] - FLOOR_SPAN, 4000],
  ];

  const plain = {
    panes: projected.map((pane) => pane.map(shift)),
    sillTop: projectedSill.map(shift),
    sillShadow: flat.sillShadow.map((p) => shift(project(p))),
    floor,
  };
  const mirrored = {
    panes: plain.panes.map(mirror),
    sillTop: mirror(plain.sillTop),
    sillShadow: mirror(plain.sillShadow),
    floor: mirror(floor),
  };

  /** The panes of light on the floor, from light at the given altitude and azimuth. */
  function lightOnFloor(light: HouseShadow, flip: boolean) {
    const altitude = Math.min(
      LIGHT_ALTITUDE.max,
      Math.max(LIGHT_ALTITUDE.min, light.altitude),
    );
    const side = Math.max(
      -MAX_SIDEWAYS,
      Math.min(MAX_SIDEWAYS, -Math.sin(rad(light.azimuth))),
    );
    const inward = Math.max(MIN_INWARD, Math.abs(Math.cos(rad(light.azimuth))));
    const length = Math.hypot(side, inward);
    const fall = Math.tan(rad(altitude));
    const onFloor = ([x, y]: Point): Point3 => {
      const t = (LIGHT_REACH * (FLOOR - y)) / fall;
      return [x + (t * side) / length, FLOOR, (t * inward) / length];
    };
    const cast = flat.panes.map((pane) =>
      pane.map((p) => shift(project(onFloor(p)))),
    );
    return flip ? cast.map(mirror) : cast;
  }

  return { viewW, viewH, plain, mirrored, lightOnFloor };
}

// One geometry per turn and eye height, kept so every render of a window hands
// the same arrays to its effects.
const built = new Map<string, ReturnType<typeof build>>();
function geometryFor(turn: number, eye: number) {
  const t = Math.round(turn * 4) / 4;
  const key = `${t} ${eye}`;
  let g = built.get(key);
  if (!g) {
    g = build(t, eye);
    built.set(key, g);
  }
  return g;
}

/**
 * The window's shape, for placing it: width over height, and where the ledge's
 * right-hand front corner is, as shares of the window's width and height.
 */
export function windowShape(turn: number, eye = EYE, flip = false) {
  const g = geometryFor(turn, eye);
  const [a, b] = (flip ? g.mirrored : g.plain).sillTop.slice(2);
  const [x, y] = a[0] > b[0] ? a : b;
  return {
    aspect: g.viewW / g.viewH,
    corner: [x / g.viewW, y / g.viewH] as Point,
  };
}

const points = (pts: Point[]) =>
  pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

/** A four-pane window at an angle, onto the site's sky: the part of it that's behind each pane. */
export function Window({
  className = "",
  floorLight = false,
  flip = false,
  turn = TURN,
  eye = EYE,
  skyDrop = 0,
}: {
  className?: string;
  /** Mirrored: the left side toward the viewer. */
  flip?: boolean;
  /** A darker floor below the window, with the window's light falling on it. */
  floorLight?: boolean;
  /** How far the wall is turned, in degrees: 0 faces the viewer. */
  turn?: number;
  /** The viewer's eye height, as a share of the window's height down from its top. */
  eye?: number;
  /** Shows the sky as if the window sat this many of its own heights higher (negative: lower), never past the sky's top. */
  skyDrop?: number;
}) {
  const box = useRef<HTMLDivElement>(null);
  const glass = useRef<HTMLCanvasElement>(null);
  const { watch } = useSky();
  const id = useId();
  const light = useLiveLight();
  const g = geometryFor(turn, eye);
  const view = flip ? g.mirrored : g.plain;
  const shown = view.panes;
  const viewW = g.viewW;

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
      const k = w / viewW;
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
      const skyTop = Math.max(0, r.top - skyDrop * r.height);
      ctx.drawImage(sky, r.left * dpr, skyTop * dpr, w, h, 0, 0, w, h);
      ctx.restore();
    });
  }, [watch, shown, viewW, skyDrop]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      style={{ aspectRatio: `${g.viewW} / ${g.viewH}` }}
      className={`relative ${className}`}
    >
      {floorLight && (
        // Behind the page's text: the page needs `isolate` so this stays above its background.
        <svg
          aria-hidden="true"
          viewBox={`0 0 ${g.viewW} ${g.viewH}`}
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible"
        >
          <polygon points={points(view.floor)} className="fill-floor" />
          {light && (
            <g
              className="with-sky fill-page"
              style={{
                fillOpacity: Math.min(1, light.opacity * LIGHT_STRENGTH),
                filter: `blur(${light.blur / 2}em)`,
              }}
            >
              {g.lightOnFloor(light, flip).map((pane) => (
                <polygon key={points(pane)} points={points(pane)} />
              ))}
            </g>
          )}
        </svg>
      )}
      <canvas ref={glass} className="absolute inset-0 h-full w-full" />
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${g.viewW} ${g.viewH}`}
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
          points={points(view.sillShadow)}
          filter={`url(#${id}-soft)`}
          className="fill-bevel"
        />
        <polygon points={points(view.sillTop)} className="fill-sill" />
      </svg>
    </div>
  );
}
