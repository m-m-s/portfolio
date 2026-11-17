import { MANHATTAN } from "./nyc";

const RAD = Math.PI / 180;

/** Altitude above the horizon and azimuth clockwise from north, in degrees, seen from Manhattan. */
type SkyPosition = { altitude: number; azimuth: number };

const daysSince2000 = (date: Date) =>
  date.getTime() / 86_400_000 + 2440587.5 - 2451545;

const obliquity = (d: number) => (23.439 - 0.00000036 * d) * RAD;

function sunLongitude(d: number) {
  const g = (357.529 + 0.98560028 * d) * RAD;
  const q = 280.459 + 0.98564736 * d;
  return (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
}

function fromManhattan(ra: number, dec: number, d: number): SkyPosition {
  const gmst = (18.697374558 + 24.06570982441908 * d) % 24;
  const hour = (gmst * 15 + MANHATTAN.longitude) * RAD - ra;
  const lat = MANHATTAN.latitude * RAD;
  const altitude = Math.asin(
    Math.sin(lat) * Math.sin(dec) +
      Math.cos(lat) * Math.cos(dec) * Math.cos(hour),
  );
  const azimuth = Math.atan2(
    -Math.sin(hour),
    Math.tan(dec) * Math.cos(lat) - Math.sin(lat) * Math.cos(hour),
  );
  return {
    altitude: altitude / RAD,
    azimuth: (azimuth / RAD + 360) % 360,
  };
}

/** Low-precision solar position (Astronomical Almanac), good to about 1°. */
export function sunPosition(date: Date): SkyPosition {
  const d = daysSince2000(date);
  const lon = sunLongitude(d);
  const tilt = obliquity(d);
  const ra = Math.atan2(Math.cos(tilt) * Math.sin(lon), Math.cos(lon));
  const dec = Math.asin(Math.sin(tilt) * Math.sin(lon));
  return fromManhattan(ra, dec, d);
}

/** Low-precision lunar position (Astronomical Almanac), good to about 1°, and the share of the moon that's lit (0 new, 1 full). */
export function moonPosition(date: Date): SkyPosition & { lit: number } {
  const d = daysSince2000(date);
  const t = d / 36525;
  const s = (a: number, b: number) => Math.sin((a + b * t) * RAD);
  const lon =
    (218.32 +
      481267.881 * t +
      6.29 * s(135, 477198.87) -
      1.27 * s(259.3, -413335.36) +
      0.66 * s(235.7, 890534.22) +
      0.21 * s(269.9, 954397.74) -
      0.19 * s(357.5, 35999.05) -
      0.11 * s(186.5, 966404.03)) *
    RAD;
  const lat =
    (5.13 * s(93.3, 483202.02) +
      0.28 * s(228.2, 960400.89) -
      0.28 * s(318.3, 6003.15) -
      0.17 * s(217.6, -407332.21)) *
    RAD;
  const tilt = obliquity(d);
  const ra = Math.atan2(
    Math.sin(lon) * Math.cos(tilt) - Math.tan(lat) * Math.sin(tilt),
    Math.cos(lon),
  );
  const dec = Math.asin(
    Math.sin(lat) * Math.cos(tilt) +
      Math.cos(lat) * Math.sin(tilt) * Math.sin(lon),
  );
  const elongation = Math.cos(lat) * Math.cos(lon - sunLongitude(d));
  return { ...fromManhattan(ra, dec, d), lit: (1 - elongation) / 2 };
}

/** Today in New York at the given minutes past midnight. */
export function nycTimeToday(minutes: number) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZoneName: "longOffset",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const [, sign, hh, mm] =
    get("timeZoneName").match(/([+-])(\d\d):(\d\d)/) ?? [];
  const offset = sign ? (sign === "-" ? -1 : 1) * (+hh * 60 + +mm) : 0;
  const midnight = Date.UTC(+get("year"), +get("month") - 1, +get("day"));
  return new Date(midnight + (minutes - offset) * 60_000);
}

/** Minutes past midnight in New York right now. */
export function nycMinutesNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) =>
    +(parts.find((p) => p.type === type)?.value ?? 0);
  return get("hour") * 60 + get("minute");
}
