"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { DoorLink } from "@/components/door-link";
import type { Project } from "@/content/projects";
import { type Point, staircase } from "./platforms";

const points = (pts: Point[]) =>
  pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

/** The projects on platforms, oldest lowest. Fills its parent, which must be positioned. */
export function ProjectPlatforms({ projects }: { projects: Project[] }) {
  const room = useRef<HTMLDivElement>(null);
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

  return (
    <div
      ref={room}
      style={{ visibility: size ? "visible" : "hidden" }}
      className="absolute inset-0"
    >
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        {/* Highest first, so each lower platform stands in front of the one above it. */}
        {shapes
          .map((shape, i) => (
            <g key={projects[i].href}>
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
        {/* One shape for every step's side, so no seams show between them. */}
        {stairs && (
          <polygon
            points={points(stairs.side)}
            className="fill-platform-side"
          />
        )}
      </svg>
      <ul>
        {projects.map((project, i) => {
          const at = shapes[i]?.label ?? [0, 0];
          return (
            <li
              key={project.href}
              style={{ left: at[0], top: at[1] }}
              className="absolute -translate-x-1/2 -translate-y-3/4 text-center whitespace-nowrap"
            >
              <DoorLink
                href={project.href}
                className="text-4xl font-bold sm:text-5xl lg:text-6xl"
              >
                {project.name}
              </DoorLink>
              <p className="mt-1 text-xs sm:text-sm">{project.tech}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
