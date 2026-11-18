import type { Sky } from "@/features/weather/sky";

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

const ICONS: Record<Sky, React.ReactNode> = {
  sunny: <Sun />,
  "partly-cloudy": (
    <>
      <Sun cx={9} cy={8} r={3} />
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
};

export function WeatherIcon({ sky }: { sky: Sky }) {
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
      {ICONS[sky]}
    </svg>
  );
}
