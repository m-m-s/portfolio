"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { LookOutsideHint } from "@/components/look-outside-hint";
import { turnForSlope, Window, windowShape } from "@/components/window";
import type { Project } from "@/content/projects";
import { prepareNavigation, ROOM_WALK } from "@/features/transitions/direction";
import { usePath } from "@/features/transitions/use-path";
import {
  type Platform,
  type Point,
  progress,
  sideSlope,
  staircase,
} from "./platforms";

/** The viewer looks down on the step tops, so their eye is level with the window's top. */
const WINDOW_EYE = 0;
/** Past this the window would turn to a sliver (on a phone the steps' sides recede very steeply). */
const MAX_WINDOW_TURN = 45;
/** Where the Look outside hint sits beside the window, as a share of the window's height. */
const HINT_AT = 0;
/** How far a step rises, as shares of its riser: a little on hover or focus, most of the way when chosen. */
const LIFT = { hover: 0.15, chosen: 0.7 };
/** How long a step takes to rise, in ms. */
const LIFT_MS = 350;
/** When the move to the chosen page starts, in ms after the click. The new page renders before the browser photographs the old one, so starting partway through lets that overlap the rise's slow last stretch. */
const GO_MS = 150;
/** How long the risen step holds before the crossfade, in ms. */
const HOLD_MS = 50;
/** The window's left edge, as a share of the room's width. */
const WINDOW_LEFT = 0.1;
const WINDOW_MIN_WIDTH = 100;
/** How far the sill's corner sits inside a step's front face, past its left edge and below its top, as shares of the window's width. */
const TUCK = { x: 0.08, y: 0.06 };

/**
 * The window's size and height on the wall, both from the distance between
 * the room's top and the highest project step whose front the sill's far
 * corner can reach: the top sits a share of the way down, and the window
 * grows until that corner is just behind the step. Where that would pass its
 * largest size (big screens), it stops there, short of the step; where no step
 * is in reach, it measures to the lowest one.
 */
function placeWindow(
  roomWidth: number,
  roomHeight: number,
  steps: Platform[],
  shape: ReturnType<typeof windowShape>,
) {
  // On the widest screens it sits a little further right (16% across by 2560px).
  const left =
    (WINDOW_LEFT + 0.06 * progress(roomWidth, 1440, 2560)) * roomWidth;
  const [cx, cy] = shape.corner;
  const down = cy / shape.aspect;
  // At most 45% of the room's width on a phone, 40% from 640px, easing to 28%
  // from 1024px to 1440px so on desktop it doesn't outweigh the steps.
  const maxShare =
    roomWidth < 640 ? 0.45 : 0.4 - 0.12 * progress(roomWidth, 1024, 1440);
  // Never taller than 55% of the room, easing to 70% from 1280px to 1920px.
  const tallest = 0.55 + 0.15 * progress(roomWidth, 1280, 1920);
  const max = Math.min(
    roomWidth * maxShare,
    tallest * roomHeight * shape.aspect,
  );
  // The top sits 15% of the way down to the step, rising to 7% from 1440px to
  // 2560px so it doesn't hang low on the widest screens.
  const drop = 0.15 - 0.08 * progress(roomWidth, 1440, 2560);
  const keep = 1 - drop;
  const fit = (front: Point[]) => {
    const [l, c] = front;
    const slope = (c[1] - l[1]) / (c[0] - l[0]);
    // The step's top edge, straight below the window's left edge.
    const below = l[1] + (left - l[0]) * slope;
    // Solves: corner's height = the edge's height under it + TUCK, with the
    // window's top `drop` of the way down to that edge.
    const width = (below * keep) / (down - keep * cx * slope - TUCK.y);
    const reaches = left + cx * width - l[0] >= TUCK.x * width;
    return { width, reaches, top: drop * below };
  };
  const place = ({ width, top }: { width: number; top: number }) => ({
    left,
    top,
    width: Math.max(WINDOW_MIN_WIDTH, Math.min(width, max)),
  });
  for (const { front } of [...steps].reverse()) {
    const f = fit(front);
    if (f.width >= WINDOW_MIN_WIDTH && f.reaches) return place(f);
  }
  return steps[0] ? place(fit(steps[0].front)) : null;
}

const points = (pts: Point[]) =>
  pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** The projects on platforms, oldest lowest, and a window in the wall behind them. Fills its parent, which must be positioned. */
export function ProjectPlatforms({ projects }: { projects: Project[] }) {
  const room = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePath();
  const [hovered, setHovered] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const going = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Next keeps visited pages alive but hidden: coming back, no step should still be raised.
  useLayoutEffect(
    () => () => {
      clearTimeout(going.current);
      setChosen(null);
      setHovered(null);
    },
    [],
  );
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const el = room.current;
    if (!el) return;
    const measure = () =>
      setSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const stairs = size
    ? staircase(projects.length, size.width, size.height)
    : null;
  const shapes = stairs?.steps ?? [];
  const turn = size
    ? Math.min(MAX_WINDOW_TURN, turnForSlope(sideSlope(size.width), WINDOW_EYE))
    : 0;
  const placed =
    size &&
    placeWindow(
      size.width,
      size.height,
      shapes.slice(0, projects.length),
      windowShape(turn, WINDOW_EYE, true),
    );

  const lift = (i: number, riser: number) =>
    riser *
    (chosen === i
      ? LIFT.chosen
      : hovered === i && chosen === null
        ? LIFT.hover
        : 0);

  /** Raises project i's step, then crossfades to its page. */
  const choose = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const { href } = projects[i];
    router.prefetch(href);
    const rises = !matchMedia("(prefers-reduced-motion: reduce)").matches;
    going.current = setTimeout(
      () => {
        const box = room.current?.getBoundingClientRect();
        const at = shapes[i]?.label ?? [0, 0];
        const risen = rises ? (shapes[i]?.riser ?? 0) * LIFT.chosen : 0;
        prepareNavigation(
          pathname,
          href,
          { x: (box?.left ?? 0) + at[0], y: (box?.top ?? 0) + at[1] - risen },
          HOLD_MS,
        );
        router.push(href, { transitionTypes: [ROOM_WALK] });
      },
      rises ? GO_MS : 0,
    );
  };

  return (
    <div
      ref={room}
      style={{ visibility: size ? "visible" : "hidden" }}
      className="absolute inset-0"
    >
      {placed && (
        // In the plane of the steps' sides: its foot rises to the right like their edges.
        <div
          data-window-group
          style={{ left: placed.left, top: placed.top, width: placed.width }}
          className="absolute"
        >
          <Window
            flip
            eye={WINDOW_EYE}
            turn={turn}
            // The sky as if the window hung a tenth of its height higher, so more of the clouds are in it.
            skyDrop={0.1}
          />
          <LookOutsideHint
            arrow="←"
            turn={turn}
            at={HINT_AT}
            eye={WINDOW_EYE}
            flip
            style={{ top: `${HINT_AT * 100}%` }}
            className="absolute left-full ml-4"
          />
        </div>
      )}
      <svg
        aria-hidden="true"
        // Steps above the room's top go out of view; below its foot they carry on under the footer.
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible [clip-path:polygon(0_0,100%_0,100%_400%,0_400%)]"
      >
        {/* One shape for every step's side, so no seams show between steps at rest. */}
        {stairs && (
          <polygon
            points={points(stairs.side)}
            className="fill-platform-side"
          />
        )}
        {/* Highest first, so each lower platform stands in front of the one above it. */}
        {shapes
          .map((shape, i) => (
            // A project's whole step is part of its link for the pointer (the
            // name stays the link for keyboards and screen readers).
            <g
              key={projects[i]?.href ?? `empty-${i}`}
              style={{
                transform: `translateY(${-lift(i, shape.riser)}px)`,
                transitionDuration: `${LIFT_MS}ms`,
              }}
              {...(projects[i] && {
                onMouseEnter: () => setHovered(i),
                onMouseLeave: () => setHovered(null),
                onClick: () => choose(i),
              })}
              className={`transition-transform ease-(--settle-ease) motion-reduce:transition-none ${projects[i] ? "pointer-events-auto cursor-pointer" : ""}`}
            >
              <polygon
                points={points(shape.side)}
                className="fill-platform-side"
              />
              <polygon
                points={points(shape.front)}
                className="fill-platform-front"
              />
              <polygon
                points={points(shape.top)}
                className="fill-platform-top"
              />
            </g>
          ))
          .reverse()}
      </svg>
      <ul>
        {projects.map((project, i) => {
          const at = shapes[i]?.label ?? [0, 0];
          return (
            // The item stays put and only its contents rise, so the area that
            // counts as hovering doesn't slide out from under the pointer.
            <li
              key={project.href}
              style={{ left: at[0], top: at[1] }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              className="halo absolute -translate-x-1/2 -translate-y-full text-center whitespace-nowrap [--color-page:var(--color-platform-top)]"
            >
              <div
                style={{
                  transform: `translateY(${-lift(i, shapes[i]?.riser ?? 0)}px)`,
                  transitionDuration: `${LIFT_MS}ms`,
                }}
                className="transition-transform ease-(--settle-ease) motion-reduce:transition-none"
              >
                <Link
                  href={project.href}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  onNavigate={(event) => {
                    event.preventDefault();
                    choose(i);
                  }}
                  className="block"
                >
                  <span className="block text-4xl font-bold sm:text-5xl lg:text-[max(3.75rem,2.6vw)]">
                    {project.name}
                  </span>
                  <span className="mt-1 block text-xs sm:text-sm lg:text-[max(1rem,0.8vw)]">
                    {project.tagline}
                  </span>
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
