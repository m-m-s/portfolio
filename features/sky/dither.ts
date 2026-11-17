// Ported from docs/reference/mock-snowy.html. Keep in step with the mock.
import type { CloudSettings, FarSettings } from "./config";

/** A dithered image as a flat list of dot coordinates: [x0, y0, x1, y1, ...]. */
export type Sprite = {
  w: number;
  h: number;
  pts: Int16Array;
  tint: Map<string, HTMLCanvasElement>;
  bot?: Int16Array;
};

function canvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("2D canvas unavailable");
  return { c, ctx };
}

/** A stable pseudo-random value per pixel. */
function hv(x: number, y: number) {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

function boxBlur(src: ArrayLike<number>, w: number, h: number, r: number) {
  const a = Float32Array.from(src);
  const b = new Float32Array(src.length);
  for (let p = 0; p < 3; p++) {
    for (let y = 0; y < h; y++) {
      let acc = 0;
      let n = 0;
      for (let x = -r; x < w; x++) {
        if (x + r < w) {
          acc += a[y * w + x + r];
          n++;
        }
        if (x - r - 1 >= 0) {
          acc -= a[y * w + x - r - 1];
          n--;
        }
        if (x >= 0) b[y * w + x] = acc / n;
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0;
      let n = 0;
      for (let y = -r; y < h; y++) {
        if (y + r < h) {
          acc += b[(y + r) * w + x];
          n++;
        }
        if (y - r - 1 >= 0) {
          acc -= b[(y - r - 1) * w + x];
          n--;
        }
        if (y >= 0) a[y * w + x] = acc / n;
      }
    }
  }
  return a;
}

const FS: readonly (readonly [number, number, number])[] = [
  [1, 0, 7 / 16],
  [-1, 1, 3 / 16],
  [0, 1, 5 / 16],
  [1, 1, 1 / 16],
];

/** Serpentine Floyd–Steinberg. With skip, pixels below 0 are outside the shape. */
function fsDither(g: Float32Array, w: number, h: number, skip: boolean) {
  const pts: number[] = [];
  for (let y = 0; y < h; y++) {
    const ltr = y % 2 === 0;
    for (let s = 0; s < w; s++) {
      const x = ltr ? s : w - 1 - s;
      const i = y * w + x;
      const v = g[i];
      if (skip && v < 0) continue;
      const dot = v < 128;
      const err = v - (dot ? 0 : 255);
      if (dot) pts.push(x, y);
      for (const [dx, dy, sh] of FS) {
        const nx = x + (ltr ? dx : -dx);
        const ny = y + dy;
        if (nx < 0 || nx >= w || ny >= h) continue;
        const j = ny * w + nx;
        if (!skip || g[j] >= 0) g[j] += err * sh;
      }
    }
  }
  return Int16Array.from(pts);
}

/** Photo to dots at its final width: stretch its tones, apply contrast, brightness and Lighter, dither. */
export function ditherCloud(
  im: HTMLImageElement,
  width: number,
  o: CloudSettings,
): Sprite {
  const w = Math.max(20, Math.round(width));
  const h = Math.max(10, Math.round((im.height * w) / im.width));
  const { ctx: x } = canvas(w, h);
  x.imageSmoothingQuality = "high";
  x.drawImage(im, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data;
  const N = w * h;
  const lum = new Float32Array(N);
  const al = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    lum[i] = d[i * 4];
    al[i] = d[i * 4 + 3] / 255;
  }

  // Fade the edges so nothing ends in a hard line.
  {
    const fw = Math.max(2, w * 0.06);
    const fh = Math.max(2, h * 0.06);
    for (let y = 0; y < h; y++) {
      for (let xx = 0; xx < w; xx++) {
        const e = Math.min(
          xx / fw,
          (w - 1 - xx) / fw,
          y / fh,
          (h - 1 - y) / fh,
        );
        if (e < 1) {
          const s = Math.max(0, e);
          al[y * w + xx] *= s * s * (3 - 2 * s);
        }
      }
    }
  }

  // Lift a dark cut-out rim to the tone just inside it.
  {
    const solid = new Float32Array(N);
    for (let i = 0; i < N; i++) solid[i] = al[i] > 0.5 ? 1 : 0;
    const near = boxBlur(solid, w, h, 1);
    const rim = new Float32Array(N);
    const keep = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      rim[i] = al[i] > 0.02 && near[i] < 0.999 ? 1 : 0;
      keep[i] = al[i] > 0.5 && !rim[i] ? 1 : 0;
    }
    const bk = boxBlur(keep, w, h, 3);
    const bl = boxBlur(
      lum.map((v, i) => v * keep[i]),
      w,
      h,
      3,
    );
    for (let i = 0; i < N; i++) {
      if (!rim[i] || bk[i] < 0.05) continue;
      const inner = bl[i] / bk[i];
      if (lum[i] < inner) lum[i] = inner;
    }
  }

  const core: number[] = [];
  for (let i = 0; i < N; i++) if (al[i] > 0.6) core.push(lum[i]);
  core.sort((a, b) => a - b);
  let lo = 0;
  let hi = 255;
  if (core.length > 50) {
    lo = core[Math.floor(core.length * 0.02)];
    hi = core[Math.floor(core.length * 0.98)];
    if (hi - lo < 24) {
      const m = (hi + lo) / 2;
      lo = m - 12;
      hi = m + 12;
    }
  }

  const g = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    if (al[i] < 12 / 255) {
      g[i] = -1;
      continue;
    }
    let t = (lum[i] - lo) / (hi - lo);
    t = 0.5 + (t - 0.5) * o.contrast;
    let tone = Math.min(255, Math.max(0, 40 + t * 215 + o.bright * 255));
    if (o.light > 0) tone = 255 * (tone / 255) ** (1 / (1 + 2.5 * o.light));
    g[i] = 255 - (255 - tone) * al[i];
  }
  return { w, h, pts: fsDither(g, w, h, true), tint: new Map() };
}

/** Far strips arrive already dithered; thin their dots toward the bottom so they fade out. */
export function farFromImage(im: HTMLImageElement): Sprite {
  const { ctx: x } = canvas(im.width, im.height);
  x.drawImage(im, 0, 0);
  const d = x.getImageData(0, 0, im.width, im.height).data;
  const pts: number[] = [];
  const H0 = im.height;
  const band = H0 * 0.3;
  for (let i = 0; i < im.width * im.height; i++) {
    if (d[i * 4 + 3] <= 128) continue;
    const px = i % im.width;
    const py = (i / im.width) | 0;
    const dd = H0 - 1 - py;
    if (dd >= band || hv(px, py) < (dd / band) ** 1.3) pts.push(px, py);
  }
  return {
    w: im.width,
    h: im.height,
    pts: Int16Array.from(pts),
    tint: new Map(),
  };
}

/** Resize or reshade a far strip by re-dithering from its own dot density. */
export function resizeFar(base: Sprite, f: FarSettings): Sprite {
  const w = Math.round(base.w * f.size);
  const h = Math.round(base.h * f.size);
  const a = new Float32Array(base.w * base.h);
  for (let i = 0; i < base.pts.length; i += 2)
    a[base.pts[i + 1] * base.w + base.pts[i]] = 1;
  const dn = boxBlur(a, base.w, base.h, 2);
  const { c: c0, ctx: x0 } = canvas(base.w, base.h);
  const im = x0.createImageData(base.w, base.h);
  for (let i = 0; i < dn.length; i++)
    im.data[i * 4 + 3] = Math.round(Math.min(1, dn[i]) * 255);
  x0.putImageData(im, 0, 0);
  const { ctx: x } = canvas(w, h);
  x.imageSmoothingQuality = "high";
  x.drawImage(c0, 0, 0, w, h);
  const d = x.getImageData(0, 0, w, h).data;
  const g = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++)
    g[i] = 255 * (1 - Math.min(1, (d[i * 4 + 3] / 255) * f.shade));
  return { w, h, pts: fsDither(g, w, h, false), tint: new Map() };
}

/** The dots painted in one ink, optionally mirrored. Cached per sprite. */
export function tinted(s: Sprite, ink: readonly number[], flip: boolean) {
  const k = ink.join() + (flip ? "f" : "");
  const cached = s.tint.get(k);
  if (cached) return cached;
  const { c, ctx } = canvas(s.w, s.h);
  const im = ctx.createImageData(s.w, s.h);
  for (let i = 0; i < s.pts.length; i += 2) {
    const px = flip ? s.w - 1 - s.pts[i] : s.pts[i];
    const j = (s.pts[i + 1] * s.w + px) * 4;
    im.data[j] = ink[0];
    im.data[j + 1] = ink[1];
    im.data[j + 2] = ink[2];
    im.data[j + 3] = 255;
  }
  ctx.putImageData(im, 0, 0);
  s.tint.set(k, c);
  return c;
}

/** Lowest dot in each column (-1 where a column has too few dots): where rain falls from. */
export function bottoms(s: Sprite) {
  if (s.bot) return s.bot;
  const b = new Int16Array(s.w).fill(-1);
  const n = new Uint16Array(s.w);
  for (let i = 0; i < s.pts.length; i += 2) {
    const x = s.pts[i];
    const y = s.pts[i + 1];
    n[x]++;
    if (y > b[x]) b[x] = y;
  }
  for (let x = 0; x < s.w; x++) if (n[x] < 4) b[x] = -1;
  s.bot = b;
  return b;
}
