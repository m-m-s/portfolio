"use client";

import { wallSlant } from "@/components/window";
import { useLookOutside } from "@/features/sky/sky-view";

/**
 * Sits beside a window, inside its `data-window-group`, so hovering it lights
 * the window. It lies along the wall like the window's frame: `turn`, `eye`
 * and `flip` match the window's, and `at` is where it sits as a share of the
 * window's height.
 */
export function LookOutsideHint({
  arrow,
  turn,
  at,
  eye,
  flip,
  className = "",
  style,
}: {
  arrow: "←" | "↑";
  turn: number;
  at: number;
  eye?: number;
  flip?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const lookOutside = useLookOutside();
  const slant = wallSlant(turn, at, eye, flip);
  return (
    <button
      type="button"
      data-look-hint
      aria-haspopup="dialog"
      onClick={lookOutside}
      style={{ ...style, transform: `skewY(${slant}deg)` }}
      className={`cursor-pointer font-grotesk text-sm whitespace-nowrap text-ink/65 ${className}`}
    >
      <span aria-hidden="true">{arrow}</span> Look out the window
    </button>
  );
}
