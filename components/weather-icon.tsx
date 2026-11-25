import type { Sky } from "@/features/weather/sky";
import type { Moon } from "@/features/weather/use-moon";

const CLOUD =
  "M7 18h10a4 4 0 0 0 .5-7.97A5.5 5.5 0 0 0 7 11a3.5 3.5 0 0 0 0 7Z";

const SUN_RAYS = [0, 45, 90, 135, 180, 225, 270, 315];

function Sun({ cx = 12, cy = 12, r = 4 }) {
  return (
    <>
      <circle cx={cx} cy={cy} r={r} />
      {SUN_RAYS.map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = cx + Math.cos(rad) * (r + 2.5);
        const y1 = cy + Math.sin(rad) * (r + 2.5);
        const x2 = cx + Math.cos(rad) * (r + 5);
        const y2 = cy + Math.sin(rad) * (r + 5);
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </>
  );
}

// The thinnest sliver drawn, so a new moon still shows.
const NEW_MOON = 0.03;

function MoonPhase({ moon, cx = 12, cy = 12, r = 6 }: { moon: Moon } & Disc) {
  const shown = Math.max(moon.lit, NEW_MOON);
  const rx = r * Math.abs(1 - 2 * shown);
  const top = `${cx} ${cy - r}`;
  const lit = `M${top}A${r} ${r} 0 0 1 ${cx} ${cy + r}A${rx} ${r} 0 0 ${shown > 0.5 ? 1 : 0} ${top}Z`;
  return (
    <path
      d={lit}
      fill="var(--color-page)"
      transform={moon.waxing ? undefined : `translate(${2 * cx} 0) scale(-1 1)`}
    />
  );
}

type Disc = { cx?: number; cy?: number; r?: number };

function Light({ moon, ...disc }: { moon: Moon | null } & Disc) {
  return moon ? <MoonPhase moon={moon} {...disc} /> : <Sun {...disc} />;
}

const icons = (moon: Moon | null): Record<Sky, React.ReactNode> => ({
  sunny: <Light moon={moon} r={moon ? 7 : 4} />,
  "partly-cloudy": (
    <>
      <Light moon={moon} cx={9} cy={8} r={moon ? 4.5 : 3} />
      <path d={CLOUD} transform="translate(2 2)" fill="var(--color-page)" />
    </>
  ),
  cloudy: <path d={CLOUD} transform="translate(0 -2)" />,
  rainy: (
    <>
      <path d={CLOUD} transform="translate(0 -4)" />
      <path d="M8 18l-1 3M12 18l-1 3M16 18l-1 3" />
    </>
  ),
  snowy: (
    <>
      <path d={CLOUD} transform="translate(0 -4)" />
      <path d="M8 19h.01M12 21h.01M16 19h.01" strokeWidth={2} />
    </>
  ),
});

export function WeatherIcon({
  sky,
  moon = null,
}: {
  sky: Sky;
  moon?: Moon | null;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-[1.25em] shrink-0"
    >
      {icons(moon)[sky]}
    </svg>
  );
}
