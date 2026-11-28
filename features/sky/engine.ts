import type { Sky } from "@/features/weather/sky";
import {
  type CloudSettings,
  cloudSettings,
  configFor,
  type SkyConfig,
} from "./config";
import {
  type Band,
  bandRanges,
  CLOUDS,
  COUNT,
  FAR,
  FAR_LAYER,
  FAR_SIDE_FADE,
  INK,
  LARGE_CLOUD,
  LAYER,
  type Layer,
  LOOSE,
  PHONE_CLOUD_SCALE,
  PLACEMENT,
  REFERENCE,
  type Rgb,
  SKY_FRACTION,
  SMALL_SCREEN,
  WIDE_WEIGHT,
  WIDTH,
} from "./constants";
import {
  bottoms,
  ditherCloud,
  farFromImage,
  resizeFar,
  type Sprite,
  tinted,
} from "./dither";

type Physics = {
  readonly speed: number;
  readonly radius: number;
  readonly push: number;
  readonly spring: number;
  readonly damp: number;
  readonly maxv: number;
};

type DotBuffer = {
  n: number;
  m: number;
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  c: HTMLCanvasElement;
  cx: CanvasRenderingContext2D;
  img: ImageData;
  b: Uint32Array;
};

type Cloud = {
  sprite: Sprite;
  flip: boolean;
  x0: number;
  y: number;
  buf: DotBuffer;
  p: DotBuffer | null;
};

type CloudLayer = Physics & {
  name: Layer;
  ink: Rgb;
  inst: Cloud[];
  span: number;
  margin: number;
  off: number;
};

type FarLayer = Physics & {
  sprite: Sprite;
  ink: Rgb;
  y: number;
  off: number;
  stirred: Map<number, Cloud>;
};

type Drop = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  pv: number;
  cs?: number;
  y0?: number;
  max?: number;
  mid?: boolean;
  sz?: number;
  ph?: number;
  amp?: number;
};

export type Area = { x: number; y: number; w: number; h: number };

const NOWHERE: Area = { x: -1e6, y: -1e6, w: 0, h: 0 };

const FAR_INK_MIX = 0.35;
const CLOUD_ROOM = 0.75;
const SAME_CLOUD_ROOM = 2.5;
const TRIES = 8;
const MOVE_TRIES = 32;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

type Entry<T> = { promise: Promise<T | null>; value?: T };

function loader<T>(load: (key: string) => Promise<T | null>) {
  const entries = new Map<string, Entry<T>>();
  return {
    load(key: string) {
      let entry = entries.get(key);
      if (!entry) {
        const e: Entry<T> = {
          promise: load(key).then((v) => {
            // A failed load can be tried again later.
            if (v === null) entries.delete(key);
            else e.value = v;
            return v;
          }),
        };
        entry = e;
        entries.set(key, e);
      }
      return entry.promise;
    },
    get: (key: string) => entries.get(key)?.value,
  };
}

const cloudImages = loader((id) => loadImage(`/sky/clouds/${id}.png`));
const farStrips = loader(async (k) => {
  const im = await loadImage(`/sky/strips/${k}.png`);
  return im && farFromImage(im);
});

export function preloadSkies(skies: readonly Sky[]) {
  for (const sky of skies) {
    const config = configFor(sky);
    for (const id of new Set([
      ...Object.keys(config.front),
      ...Object.keys(config.mid),
    ])) {
      void cloudImages.load(id);
    }
    for (const k of Object.keys(config.far)) void farStrips.load(k);
  }
}

function nextTask() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

function farStep(s: Sprite) {
  return Math.max(1, Math.round(s.w * (1 - FAR_SIDE_FADE)));
}

export function randomSeed() {
  return 1 + Math.floor(Math.random() * 2147483645);
}

export class SkyEngine {
  private ctx: CanvasRenderingContext2D;
  private readonly ownCtx: CanvasRenderingContext2D;
  private target: HTMLCanvasElement;
  private area: (() => Area | null) | null = null;
  private view: Area = NOWHERE;
  private W = 0;
  private H = 0;
  private dpr = 1;
  private S = 0;

  private sky: Sky = "sunny";
  private config: SkyConfig = configFor("sunny");
  private snow = false;
  private rainOn = false;
  private seed = 1;
  private layoutSeed = 1;
  private scaleOverride: number | null = null;
  private single: { id: string; fill: number } | null = null;

  private readonly sprites = new Map<string, Sprite>();
  // Clouds placed by size alone, still to be dithered: those on screen before the
  // sky shows, the rest just after, before they drift in.
  private readonly undithered = new Map<Sprite, () => Sprite>();
  private layers: Partial<Record<Layer, CloudLayer>> = {};
  private farL: FarLayer | null = null;
  private readonly drops: Drop[] = [];
  private readonly farDrops: Drop[] = [];

  private px = -1e5;
  private py = -1e5;
  private last = 0;
  private raf = 0;
  private ready = false;
  private loadId = 0;
  private buildId = 0;
  private active = true;
  private interactive = true;
  private still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private stoppedAt = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly resizeObserver: ResizeObserver;
  private readonly abort = new AbortController();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;
    this.ownCtx = ctx;
    this.target = canvas;

    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (this.ready) void this.build().then(() => this.syncLoop());
      }, 150);
    });
    this.resizeObserver.observe(canvas);

    const { signal } = this.abort;
    const point = (e: PointerEvent) => {
      if (!this.interactive) return;
      const r = this.canvas.getBoundingClientRect();
      this.px = e.clientX - r.left;
      this.py = e.clientY - r.top;
      if (this.single) this.syncLoop();
    };
    const away = () => {
      this.px = -1e5;
      this.py = -1e5;
    };
    window.addEventListener("pointermove", point, { signal, passive: true });
    window.addEventListener("pointerdown", point, { signal, passive: true });
    for (const type of ["pointerup", "pointercancel"] as const) {
      window.addEventListener(
        type,
        (e) => {
          if (e.pointerType !== "mouse") away();
        },
        { signal },
      );
    }
    document.documentElement.addEventListener("pointerleave", away, { signal });
    window.addEventListener("blur", away, { signal });
    document.addEventListener("visibilitychange", () => this.syncLoop(), {
      signal,
    });
    matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
      "change",
      (e) => {
        this.still = e.matches;
      },
      { signal },
    );
  }

  async show(sky: Sky, seed = randomSeed()) {
    const id = ++this.loadId;
    this.sky = sky;
    this.config = configFor(sky);
    this.snow = sky === "snowy";
    this.rainOn = sky === "rainy" || sky === "snowy";
    this.layoutSeed = seed;

    const clouds = new Set([
      ...Object.keys(this.config.front),
      ...Object.keys(this.config.mid),
    ]);
    await Promise.all([
      ...[...clouds].map((c) => cloudImages.load(c)),
      ...Object.keys(this.config.far).map((k) => farStrips.load(k)),
    ]);
    if (id !== this.loadId) return;

    if (!(await this.build())) return;
    const first = !this.ready;
    this.ready = true;
    this.syncLoop();
    if (first) this.onReady?.();
  }

  async showCloud(sky: Sky, id: string, settings: CloudSettings, fill: number) {
    const load = ++this.loadId;
    this.sky = sky;
    this.config = { front: { [id]: settings }, mid: {}, far: {} };
    this.snow = false;
    this.rainOn = false;
    this.single = { id, fill };
    await cloudImages.load(id);
    if (load !== this.loadId) return;

    if (!(await this.build())) return;
    const first = !this.ready;
    this.ready = true;
    this.syncLoop();
    if (first) this.onReady?.();
  }

  private singleLayer(id: string, fill: number) {
    const { W, H } = this;
    const fit = (f: number) => this.getSprite(id, "front", f);
    const bounds = (sp: Sprite) => {
      let [x0, y0, x1, y1] = [sp.w, sp.h, 0, 0];
      for (let i = 0; i < sp.pts.length; i += 2) {
        x0 = Math.min(x0, sp.pts[i]);
        x1 = Math.max(x1, sp.pts[i]);
        y0 = Math.min(y0, sp.pts[i + 1]);
        y1 = Math.max(y1, sp.pts[i + 1]);
      }
      return { x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
    };
    const probe = fit(1);
    if (!probe) return {};
    const pb = bounds(probe);
    const sprite = fit(Math.min((W * fill) / pb.w, (H * fill) / pb.h));
    if (!sprite) return {};
    const b = bounds(sprite);
    const layer: CloudLayer = {
      ...LAYER.front,
      speed: 0,
      name: "front",
      ink: INK[this.sky].front,
      inst: [
        {
          sprite,
          flip: false,
          x0: Math.round((W - b.w) / 2 - b.x0) + sprite.w,
          y: Math.round((H - b.h) / 2 - b.y0),
          buf: this.alloc(LAYER.front, sprite),
          p: null,
        },
      ],
      span: W + 2 * sprite.w,
      margin: sprite.w,
      off: 0,
    };
    tinted(sprite, layer.ink, false);
    return { front: layer };
  }

  setCloudScale(scale: number | null) {
    if (scale === this.scaleOverride) return;
    this.scaleOverride = scale;
    if (this.ready) void this.build();
  }

  private get farGrowth() {
    return Math.max(1, this.H / REFERENCE.height);
  }

  private get cloudGrowth() {
    const byWidth = this.W / REFERENCE.width;
    return Math.max(
      1,
      this.farGrowth ** (1 - WIDE_WEIGHT) * byWidth ** WIDE_WEIGHT,
    );
  }

  private get fill() {
    return Math.max(1, this.W / (REFERENCE.width * this.cloudGrowth));
  }

  private get cloudScale() {
    const phone = this.W < SMALL_SCREEN;
    const base =
      this.scaleOverride ?? (phone ? PHONE_CLOUD_SCALE[this.sky] : 1);
    return base * this.cloudGrowth;
  }

  attach(canvas: HTMLCanvasElement, area: () => Area | null) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.paintInto(canvas, ctx, area);
  }

  detach(canvas: HTMLCanvasElement) {
    if (this.target === canvas) this.paintInto(this.canvas, this.ownCtx, null);
  }

  private paintInto(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    area: (() => Area | null) | null,
  ) {
    this.target = canvas;
    this.ctx = ctx;
    this.area = area;
    if (this.ready) this.draw(0);
  }

  onReady: (() => void) | null = null;

  get currentSeed() {
    return this.layoutSeed;
  }

  get size() {
    return { width: this.W, height: this.H };
  }

  // Only lines up when both skies were built from the same seed at the same size.
  matchDrift(other: SkyEngine) {
    const paused = !other.raf && other.stoppedAt;
    const away =
      paused && !this.still ? (performance.now() - other.stoppedAt) / 1000 : 0;
    for (const name of ["mid", "front"] as const) {
      const mine = this.layers[name];
      const theirs = other.layers[name];
      if (mine && theirs) mine.off = theirs.off + theirs.speed * away;
    }
    if (this.farL && other.farL) {
      this.farL.off = other.farL.off + other.farL.speed * away;
    }
  }

  setActive(active: boolean) {
    this.active = active;
    this.syncLoop();
  }

  setInteractive(on: boolean) {
    this.interactive = on;
    if (!on) {
      this.px = -1e5;
      this.py = -1e5;
    }
  }

  /** Whether a point, in client coordinates, is within `reach` px of a cloud's dot at rest. */
  touchesCloud(clientX: number, clientY: number, reach: number) {
    if (!this.interactive) return false;
    const r = this.canvas.getBoundingClientRect();
    const px = clientX - r.left;
    const py = clientY - r.top;
    for (const L of [this.layers.front, this.layers.mid]) {
      if (!L) continue;
      for (const o of L.inst) {
        const s = o.sprite;
        const v = (((o.x0 + L.off) % L.span) + L.span) % L.span;
        const lx = px - (v - L.margin);
        const ly = py - o.y;
        if (
          lx < -reach ||
          lx > s.w + reach ||
          ly < -reach ||
          ly > s.h + reach
        ) {
          continue;
        }
        for (let i = 0; i < s.pts.length; i += 2) {
          const dx = (o.flip ? s.w - 1 - s.pts[i] : s.pts[i]) - lx;
          const dy = s.pts[i + 1] - ly;
          if (dx * dx + dy * dy <= reach * reach) return true;
        }
      }
    }
    return false;
  }

  destroy() {
    this.loadId++;
    this.buildId++;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    clearTimeout(this.resizeTimer);
    this.resizeObserver.disconnect();
    this.abort.abort();
  }

  private syncLoop() {
    const run = this.ready && this.active && !document.hidden;
    if (run && !this.raf) {
      const now = performance.now();
      if (this.stoppedAt && !this.still) {
        const away = (now - this.stoppedAt) / 1000;
        for (const L of Object.values(this.layers)) L.off += L.speed * away;
        if (this.farL) this.farL.off += this.farL.speed * away;
        this.stoppedAt = 0;
      }
      this.last = now;
      this.raf = requestAnimationFrame(this.frame);
    } else if (!run && this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.stoppedAt = performance.now();
    }
  }

  private readonly frame = (now: number) => {
    // A frame can be stamped slightly before the wake that requested it.
    const dt = Math.min(0.05, Math.max(0, now - this.last) / 1000);
    this.last = now;
    this.draw(dt);
    // A lone still cloud has nothing to draw until the pointer comes back.
    if (this.single && this.settled()) {
      this.raf = 0;
      return;
    }
    this.raf = requestAnimationFrame(this.frame);
  };

  private settled() {
    return Object.values(this.layers).every((L) => L.inst.every((o) => !o.p));
  }

  private inView(x: number, y: number, w: number, h: number) {
    const v = this.view;
    return x < v.x + v.w && x + w > v.x && y < v.y + v.h && y + h > v.y;
  }

  private draw(dt: number) {
    const { ctx, W, dpr } = this;
    const area = this.area ? this.area() : { x: 0, y: 0, w: W, h: this.H };
    this.view = area ?? NOWHERE;
    if (area) {
      const w = Math.round(area.w * dpr);
      const h = Math.round(area.h * dpr);
      if (this.target.width !== w) this.target.width = w;
      if (this.target.height !== h) this.target.height = h;
      ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        -Math.round(area.x * dpr),
        -Math.round(area.y * dpr),
      );
      ctx.imageSmoothingEnabled = true;
      ctx.clearRect(area.x, area.y, area.w, area.h);
    }

    // A dot between screen pixels splits across two, so drifting clouds would pulse.
    const snap = (v: number) => Math.round(v * dpr) / dpr;
    const move = this.still ? 0 : dt;
    const farL = this.farL;
    if (farL) {
      farL.off += farL.speed * move;
      const s = farL.sprite;
      const tile = tinted(s, farL.ink, false);
      const step = farStep(s);
      const R = farL.radius;
      const ly = this.py - farL.y;
      const fy = snap(farL.y);
      for (let n = Math.floor(-farL.off / step) - 1; ; n++) {
        const x = snap(n * step + farL.off);
        if (x >= W) break;
        if (x + s.w < 0) continue;
        const lx = this.px - x;
        // Only on a phone, where the strip spans most of the screen.
        const near =
          this.W < SMALL_SCREEN &&
          lx > -R &&
          lx < s.w + R &&
          ly > -R &&
          ly < s.h + R;
        const seen = this.inView(x, farL.y, s.w, s.h);
        let o = farL.stirred.get(n);
        if (near && !o) {
          o = {
            sprite: s,
            flip: false,
            x0: 0,
            y: farL.y,
            buf: this.alloc(farL, s),
            p: null,
          };
          farL.stirred.set(n, o);
          this.wake(o);
        }
        if (o?.p) {
          if (this.step(farL, o, lx, ly, near) === 0 && !near) {
            farL.stirred.delete(n);
          } else {
            if (seen) {
              this.paint(farL, o);
              ctx.drawImage(o.p.c, x - o.p.m, fy - o.p.m);
            }
            continue;
          }
        }
        if (seen) ctx.drawImage(tile, x, fy);
      }
      this.emitFar(move);
      this.drawFarDrops(move);
    }

    for (const name of ["mid", "front"] as const) {
      if (name === "front") this.drawDrops(move);
      const L = this.layers[name];
      if (!L) continue;
      L.off += L.speed * move;
      for (const o of L.inst) {
        const s = o.sprite;
        let v = (o.x0 + L.off) % L.span;
        if (v < 0) v += L.span;
        const x = snap(v - L.margin);
        const y = snap(o.y);
        if (x > W || x + s.w < 0) {
          o.p = null;
          continue;
        }
        this.emit(L, o, x, y, move);
        const lx = this.px - x;
        const ly = this.py - y;
        const R = L.radius;
        const near = lx > -R && lx < s.w + R && ly > -R && ly < s.h + R;
        if (near && !o.p) this.wake(o);
        const seen = this.inView(x, y, s.w, s.h);
        if (o.p) {
          const moving = this.step(L, o, lx, ly, near);
          if (!near && moving === 0) o.p = null;
          else {
            if (seen) {
              this.paint(L, o);
              ctx.drawImage(o.p.c, x - o.p.m, y - o.p.m);
            }
            continue;
          }
        }
        if (seen) ctx.drawImage(tinted(s, L.ink, o.flip), x, y);
      }
    }
    if (!this.layers.front) this.drawDrops(move);
  }

  private rnd() {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  private shuffled<T>(list: T[]) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(this.rnd() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  private spriteKey(id: string, layer: Layer, f: number) {
    const t = cloudSettings(this.config, layer, id);
    const w = Math.max(
      20,
      Math.round((WIDTH[layer] * this.cloudScale * f) / 8) * 8,
    );
    const key = `c/${layer}/${id}/${w}/${t.contrast},${t.bright},${t.light}`;
    return { t, w, key };
  }

  private getSprite(id: string, layer: Layer, f: number) {
    const { t, w, key } = this.spriteKey(id, layer, f);
    let s = this.sprites.get(key);
    if (!s) {
      const im = cloudImages.get(id);
      if (!im) return null;
      if (this.single) {
        s = ditherCloud(im, w, t);
      } else {
        // ditherCloud's own size, so placement doesn't need the dots.
        const sw = Math.max(20, Math.round(w));
        const sh = Math.max(10, Math.round((im.height * sw) / im.width));
        s = { w: sw, h: sh, pts: new Int16Array(0), tint: new Map() };
        this.undithered.set(s, () => ditherCloud(im, w, t));
      }
      this.sprites.set(key, s);
    }
    return s;
  }

  private dither(s: Sprite, layers: Partial<Record<Layer, CloudLayer>>) {
    const make = this.undithered.get(s);
    if (!make) return;
    this.undithered.delete(s);
    const done = make();
    s.pts = done.pts;
    s.bot = undefined;
    s.tint.clear();
    for (const L of Object.values(layers)) {
      for (const o of L.inst) {
        if (o.sprite === s) {
          o.buf = this.alloc(L, s);
          o.p = null;
        }
      }
    }
  }

  private async ditherRest(bid: number) {
    for (const s of [...this.undithered.keys()]) {
      await nextTask();
      if (bid !== this.buildId) return;
      this.dither(s, this.layers);
    }
  }

  private farSize(k: string) {
    return this.config.far[k].size * this.farGrowth;
  }

  private farKey(k: string) {
    const f = this.config.far[k];
    const base = farStrips.get(k);
    if (!base || !f) return null;
    const size = this.farSize(k);
    if (size === 1 && f.shade === 1) return null;
    return `fr/${k}/${Math.round(base.w * size)}/${f.shade}`;
  }

  private farSprite(k: string) {
    const base = farStrips.get(k);
    const key = this.farKey(k);
    if (!base || !key) return base ?? null;
    let s = this.sprites.get(key);
    if (!s) {
      s = resizeFar(base, { ...this.config.far[k], size: this.farSize(k) });
      this.sprites.set(key, s);
    }
    return s;
  }

  private placeY(hb: Band[], u: number, h: number) {
    const { ranges, bw } = bandRanges(this.sky);
    let rs = [...ranges].filter(([b]) => hb.includes(b)).map(([, r]) => r);
    if (!rs.length) rs = [...ranges.values()];
    let t = u * rs.length * bw;
    let base = rs[rs.length - 1][1];
    for (const [a, b] of rs) {
      if (t <= b - a) {
        base = a + t;
        break;
      }
      t -= b - a;
    }
    return Math.round(Math.max(base * this.S, h * 0.6) - h);
  }

  private async looseLayers(
    n: Record<Layer, number>,
    stale: () => Promise<boolean>,
  ) {
    const W = this.W;
    const layers: Partial<Record<Layer, CloudLayer>> = {};
    const inSky = new Map<string, number>();
    const drawn: { id: string; layer: Layer; w: number }[] = [];
    const apart = (a: number, b: number) => Math.max(a, b) / Math.min(a, b);

    for (const name of ["mid", "front"] as const) {
      const count = n[name];
      const pool = CLOUDS.filter(
        (id) => this.config[name][id] && cloudImages.get(id),
      );
      if (!pool.length) continue;
      const settings = (id: string) => cloudSettings(this.config, name, id);
      const width = (id: string, f: number) => this.spriteKey(id, name, f).w;
      const slices = new Map<string, number[]>();
      const sizeCopy = (id: string) => {
        const c = settings(id);
        if (!slices.has(id)) {
          slices.set(
            id,
            this.shuffled(Array.from({ length: count }, (_, i) => i)),
          );
        }
        const slice = slices.get(id)?.shift() ?? 0;
        const sw = (c.sizeMax - c.sizeMin) / count;
        const others = drawn.filter((d) => d.id === id);
        const gap = (w: number) =>
          Math.min(...others.map((d) => apart(w, d.w)));
        const clashes = (f: number) =>
          others.some(
            (d) =>
              apart(width(id, f), d.w) <
              (d.layer === name ? LOOSE.sameLayerGap : LOOSE.crossLayerGap),
          );
        const inSlice = () =>
          c.sizeMin + sw * (slice + 0.25 + 0.5 * this.rnd());
        const anywhere = () => c.sizeMin + (c.sizeMax - c.sizeMin) * this.rnd();
        let f = inSlice();
        for (let t = 0; t < LOOSE.sizeTries && clashes(f); t++) f = inSlice();
        for (let t = 0; t < LOOSE.sizeTries && clashes(f); t++) f = anywhere();
        if (clashes(f)) {
          f =
            gap(width(id, c.sizeMin)) >= gap(width(id, c.sizeMax))
              ? c.sizeMin
              : c.sizeMax;
        }
        drawn.push({ id, layer: name, w: width(id, f) });
        return { id, f, c };
      };
      const canRepeat = (id: string) => {
        const first = drawn.find((d) => d.id === id && d.layer === name);
        if (!first) return true;
        const c = settings(id);
        return (
          width(id, c.sizeMax) >= first.w * LOOSE.sameLayerGap ||
          width(id, c.sizeMin) * LOOSE.sameLayerGap <= first.w
        );
      };

      const hand = this.shuffled(pool).slice(
        0,
        Math.max(2, Math.ceil(count / 2)),
      );
      const inLayer = new Map<string, number>();
      const allowed = (id: string) => {
        const here = inLayer.get(id) ?? 0;
        return (
          here < LOOSE.maxCopies &&
          (inSky.get(id) ?? 0) < LOOSE.maxCopies &&
          (here === 0 || canRepeat(id))
        );
      };
      const picked: { id: string; f: number; c: CloudSettings }[] = [];
      for (let i = 0; i < count; i++) {
        let options = hand.filter(allowed);
        if (!options.length) options = pool.filter(allowed);
        if (!options.length) break;
        const id = options[Math.floor(this.rnd() * options.length)];
        inLayer.set(id, (inLayer.get(id) ?? 0) + 1);
        inSky.set(id, (inSky.get(id) ?? 0) + 1);
        picked.push(sizeCopy(id));
      }
      const firstAt = (id: string) => picked.findIndex((p) => p.id === id);
      const sized = picked
        .map((p, i) => ({ p, i }))
        .sort(
          (a, b) =>
            (inLayer.get(b.p.id) ?? 0) - (inLayer.get(a.p.id) ?? 0) ||
            firstAt(a.p.id) - firstAt(b.p.id) ||
            a.i - b.i,
        )
        .map(({ p }) => p);

      const half = Math.ceil(sized.length / 2);
      const slots = sized.map((_, i) =>
        i % 2 === 0 ? i / 2 : half + (i - 1) / 2,
      );
      if (this.rnd() < 0.5) slots.reverse();
      const heights = slots.map((s) => (s + this.rnd()) / sized.length);

      const inst: Cloud[] = [];
      for (const [i, it] of sized.entries()) {
        if (!this.sprites.has(this.spriteKey(it.id, name, it.f).key)) {
          if (await stale()) return null;
        }
        const sprite = this.getSprite(it.id, name, it.f);
        if (!sprite) continue;
        inst.push({
          sprite,
          flip: it.c.mirror,
          x0: this.rnd() * W,
          y: this.placeY(it.c.height, heights[i], sprite.h),
          buf: this.alloc(LAYER[name], sprite),
          p: null,
        });
      }
      if (!inst.length) continue;
      inst.sort((a, b) => a.y + a.sprite.h - (b.y + b.sprite.h));
      const margin = Math.max(...inst.map((o) => o.sprite.w));
      layers[name] = {
        ...LAYER[name],
        name,
        ink: INK[this.sky][name],
        inst,
        span: W + margin,
        margin,
        off: 0,
      };
    }

    if (layers.mid && layers.front) this.unstack(layers.mid, layers.front);
    for (const L of Object.values(layers)) {
      for (const o of L.inst) tinted(o.sprite, L.ink, o.flip);
    }
    return layers;
  }

  private unstack(mid: CloudLayer, front: CloudLayer) {
    const box = (L: CloudLayer, o: Cloud, t: number) => {
      const v = (((o.x0 + L.off + L.speed * t) % L.span) + L.span) % L.span;
      return { x: v - L.margin, y: o.y, w: o.sprite.w, h: o.sprite.h };
    };
    const across = (a: Area, b: Area) =>
      Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
    const down = (a: Area, b: Area) =>
      Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
    const stacked = (o: Cloud) => {
      let sum = 0;
      for (const t of LOOSE.stackCheckAt) {
        const a = box(front, o, t);
        for (const m of mid.inst) {
          const b = box(mid, m, t);
          const share =
            (across(a, b) * down(a, b)) / Math.min(a.w * a.h, b.w * b.h);
          sum += Math.max(0, share - LOOSE.stackAllowed);
        }
      }
      return sum;
    };
    const total = () => front.inst.reduce((s, o) => s + stacked(o), 0);

    let bestOff = 0;
    let best = Number.POSITIVE_INFINITY;
    for (let k = 0; k < LOOSE.offsetTries; k++) {
      front.off = (k / LOOSE.offsetTries) * front.span;
      const score = total();
      if (score < best) {
        best = score;
        bestOff = front.off;
      }
    }
    front.off = bestOff;

    const W = this.W;
    for (const o of front.inst) {
      if (stacked(o) <= 0) continue;
      const score = () => {
        const a = box(front, o, 0);
        let crowding = 0;
        for (const q of front.inst) {
          if (q === o) continue;
          const b = box(front, q, 0);
          crowding +=
            Math.max(0, across(a, b) - LOOSE.frontRoom * Math.min(a.w, b.w)) /
            a.w;
        }
        return stacked(o) + LOOSE.frontCrowding * crowding;
      };
      let bestX0 = o.x0;
      let bestScore = score();
      for (let k = 0; k < LOOSE.moveTries; k++) {
        const x =
          -o.sprite.w / 2 + (k / (LOOSE.moveTries - 1)) * (W + o.sprite.w / 2);
        o.x0 =
          (((x + front.margin - front.off) % front.span) + front.span) %
          front.span;
        const s = score();
        if (s < bestScore) {
          bestScore = s;
          bestX0 = o.x0;
        }
      }
      o.x0 = bestX0;
    }
  }

  private async build() {
    const bid = ++this.buildId;
    const stale = async () => {
      await nextTask();
      return bid !== this.buildId;
    };
    this.seed = this.layoutSeed;
    const r = this.canvas.getBoundingClientRect();
    this.W = r.width;
    this.H = r.height;
    this.S = this.H * SKY_FRACTION;
    const { W, H } = this;

    const count = COUNT[this.sky];
    const n = {
      mid: Math.max(1, Math.round(count.mid * this.fill)),
      front: Math.max(1, Math.round(count.front * this.fill)),
    };
    const pickSize = (c: { sizeMin: number; sizeMax: number }) =>
      c.sizeMin + (c.sizeMax - c.sizeMin) * this.rnd();

    let layers: Partial<Record<Layer, CloudLayer>> = {};
    const onScreen: { x: number; y: number; w: number; h: number }[] = [];
    const placement = this.single
      ? "single"
      : PLACEMENT[this.sky].loose
        ? "loose"
        : "spaced";
    if (this.single)
      layers = this.singleLayer(this.single.id, this.single.fill);
    if (placement === "loose") {
      const loose = await this.looseLayers(n, stale);
      if (!loose) return false;
      layers = loose;
    }
    const spaced = placement === "spaced" ? (["mid", "front"] as const) : [];
    for (const name of spaced) {
      const pool = CLOUDS.filter(
        (id) => this.config[name][id] && cloudImages.get(id),
      );
      if (!pool.length) continue;
      const hand = this.shuffled(pool).slice(
        0,
        Math.max(1, Math.ceil(n[name] * 0.6)),
      );
      const span = W * 1.15 + WIDTH[name] * this.cloudScale * 1.6;
      const items: {
        id: string;
        sprite: Sprite;
        w: number;
        y: number;
        flip: boolean;
      }[] = [];
      const { spreadHeights, maxLarge } = PLACEMENT[this.sky];
      const spread = spreadHeights
        ? this.shuffled(
            Array.from(
              { length: n[name] },
              (_, i) => (i + this.rnd()) / n[name],
            ),
          )
        : null;
      const used = new Map<string, number>();
      const capped = (id: string) => {
        const c = cloudSettings(this.config, name, id);
        const large = (c.sizeMin + c.sizeMax) / 2 >= LARGE_CLOUD;
        return large && (used.get(id) ?? 0) >= maxLarge;
      };
      for (let i = 0; i < n[name]; i++) {
        let options = hand.filter((x) => !capped(x));
        if (!options.length) options = pool.filter((x) => !capped(x));
        if (!options.length) break;
        const id = options[Math.floor(this.rnd() * options.length)];
        used.set(id, (used.get(id) ?? 0) + 1);
        const cs = cloudSettings(this.config, name, id);
        const u = spread ? spread[i] : this.rnd();
        const size = pickSize(cs);
        if (!this.sprites.has(this.spriteKey(id, name, size).key)) {
          if (await stale()) return false;
        }
        const sprite = this.getSprite(id, name, size);
        if (!sprite) continue;
        items.push({
          id,
          sprite,
          w: sprite.w,
          y: this.placeY(cs.height, u, sprite.h),
          flip: this.rnd() < 0.5,
        });
      }

      items.sort((a, b) => b.w - a.w);
      const margin = Math.max(...items.map((it) => it.w));
      const track = span + margin;
      const off = this.rnd() * span;
      const placed: { id: string; c: number; w: number }[] = [];
      const gap = (a: number, b: number) => {
        const d = Math.abs(a - b) % track;
        return Math.min(d, track - d);
      };
      const screenX = (x0: number) => ((x0 + off) % track) - margin;
      const inst: Cloud[] = [];
      for (const it of items) {
        let bx = this.rnd() * track;
        const h = it.sprite.h;
        const spacing = (x: number) => {
          let sc = 1e9;
          for (const p of placed) {
            const room = p.id === it.id ? SAME_CLOUD_ROOM : CLOUD_ROOM;
            sc = Math.min(
              sc,
              gap(x + it.w / 2, p.c) - ((it.w + p.w) / 2) * room,
            );
          }
          return sc;
        };
        if (placed.length) {
          let best = -1e9;
          for (let t = 0; t < TRIES; t++) {
            const x = this.rnd() * track;
            const sc = spacing(x);
            if (sc > best) {
              best = sc;
              bx = x;
            }
          }
        }
        const sx = screenX(bx);
        const clear = (x: number) =>
          onScreen.every(
            (q) =>
              Math.abs(x + it.w / 2 - (q.x + q.w / 2)) >=
                ((it.w + q.w) / 2) * CLOUD_ROOM ||
              Math.abs(it.y + h / 2 - (q.y + q.h / 2)) >=
                ((h + q.h) / 2) * CLOUD_ROOM,
          );
        if (sx < W && sx + it.w > 0 && !clear(sx)) {
          let best = -1e9;
          for (let t = 0; t < MOVE_TRIES; t++) {
            const x = -it.w / 2 + this.rnd() * W;
            const x0 = (((x + margin - off) % track) + track) % track;
            const sc = spacing(x0);
            if (clear(x) && sc > best) {
              best = sc;
              bx = x0;
            }
          }
        }
        placed.push({ id: it.id, c: bx + it.w / 2, w: it.w });
        inst.push({
          sprite: it.sprite,
          flip: it.flip,
          x0: bx,
          y: it.y,
          buf: this.alloc(LAYER[name], it.sprite),
          p: null,
        });
      }
      inst.sort((a, b) => a.y + a.sprite.h - (b.y + b.sprite.h));
      for (const o of inst) {
        const x = screenX(o.x0);
        if (x < W && x + o.sprite.w > 0) {
          onScreen.push({ x, y: o.y, w: o.sprite.w, h: o.sprite.h });
        }
      }
      const ink = INK[this.sky][name];
      layers[name] = {
        ...LAYER[name],
        name,
        ink,
        inst,
        span: track,
        margin,
        off,
      };
      for (const o of inst) tinted(o.sprite, ink, o.flip);
    }

    const farPool = FAR.filter((k) => this.config.far[k] && farStrips.get(k));
    const pick = farPool.length
      ? farPool[Math.floor(this.rnd() * farPool.length)]
      : null;
    const fk = pick ? this.farKey(pick) : null;
    if (fk && !this.sprites.has(fk) && (await stale())) return false;
    const fs = pick ? this.farSprite(pick) : null;
    let farL: FarLayer | null = null;
    if (pick && fs) {
      const f = this.config.far[pick];
      const ink = INK[this.sky];
      const fink = ink.far.map((c, i) =>
        Math.round(c + (ink.front[i] - c) * f.ink),
      ) as unknown as Rgb;
      farL = {
        ...FAR_LAYER,
        sprite: fs,
        ink: fink,
        y: Math.round(this.S - fs.h - f.height * this.S),
        off: this.farL?.off ?? 0,
        stirred: new Map(),
      };
      tinted(fs, fink, false);
    }

    // The clouds on screen now are dithered before the sky shows.
    for (const L of Object.values(layers)) {
      for (const o of L.inst) {
        let v = (o.x0 + L.off) % L.span;
        if (v < 0) v += L.span;
        const x = v - L.margin;
        if (x > W || x + o.sprite.w < 0 || !this.undithered.has(o.sprite)) {
          continue;
        }
        if (await stale()) return false;
        this.dither(o.sprite, layers);
      }
    }

    this.layers = layers;
    this.farL = farL;
    const inUse = new Set<Sprite>(farL ? [farL.sprite] : []);
    for (const L of Object.values(layers)) {
      for (const o of L.inst) inUse.add(o.sprite);
    }
    for (const [key, sprite] of this.sprites) {
      if (!inUse.has(sprite)) this.sprites.delete(key);
    }
    for (const sprite of this.undithered.keys()) {
      if (!inUse.has(sprite)) this.undithered.delete(sprite);
    }
    this.dpr = Math.min(2, window.devicePixelRatio || 1);

    this.drops.length = 0;
    this.farDrops.length = 0;
    if (this.rainOn && this.farL) {
      for (let t = 0; t < (this.snow ? H / 12 : 4); t += 0.1) {
        this.emitFar(0.1);
        this.advance(this.farDrops, 0.1, false);
      }
    }
    if (this.rainOn) {
      for (let t = 0; t < (this.snow ? H / 20 : 3); t += 0.1) {
        for (const name of ["mid", "front"] as const) {
          const L = this.layers[name];
          if (!L) continue;
          for (const o of L.inst) {
            let v = (o.x0 + L.off) % L.span;
            if (v < 0) v += L.span;
            const x = v - L.margin;
            if (x > W || x + o.sprite.w < 0) continue;
            this.emit(L, o, x, o.y, 0.1);
          }
        }
        this.advance(this.drops, 0.1, true);
      }
    }
    void this.ditherRest(bid);
    return true;
  }

  private advance(list: Drop[], dt: number, withCloud: boolean) {
    for (let i = list.length - 1; i >= 0; i--) {
      const d = list[i];
      d.y += d.vy * dt;
      d.x += (withCloud ? d.vx - (d.cs ?? 0) : d.vx) * dt;
      if (d.y > this.H) {
        list[i] = list[list.length - 1];
        list.pop();
      }
    }
  }

  private alloc(L: Physics, s: Sprite): DotBuffer {
    const n = s.pts.length / 2;
    const m = Math.ceil(L.radius * 1.4);
    const c = document.createElement("canvas");
    c.width = s.w + 2 * m;
    c.height = s.h + 2 * m;
    const cx = c.getContext("2d");
    if (!cx) throw new Error("2D canvas unavailable");
    const img = cx.createImageData(c.width, c.height);
    return {
      n,
      m,
      x: new Float32Array(n),
      y: new Float32Array(n),
      vx: new Float32Array(n),
      vy: new Float32Array(n),
      c,
      cx,
      img,
      b: new Uint32Array(img.data.buffer),
    };
  }

  private wake(o: Cloud) {
    const s = o.sprite;
    const p = o.buf;
    for (let i = 0; i < p.n; i++) {
      p.x[i] = o.flip ? s.w - 1 - s.pts[i * 2] : s.pts[i * 2];
      p.y[i] = s.pts[i * 2 + 1];
      p.vx[i] = 0;
      p.vy[i] = 0;
    }
    o.p = p;
  }

  private step(L: Physics, o: Cloud, lx: number, ly: number, near: boolean) {
    const s = o.sprite;
    const p = o.buf;
    const R = L.radius;
    const R2 = R * R;
    let moving = 0;
    for (let i = 0; i < p.n; i++) {
      const hx = o.flip ? s.w - 1 - s.pts[i * 2] : s.pts[i * 2];
      const hy = s.pts[i * 2 + 1];
      let vx = p.vx[i] + (hx - p.x[i]) * L.spring;
      let vy = p.vy[i] + (hy - p.y[i]) * L.spring;
      if (near) {
        const dx = p.x[i] - lx;
        const dy = p.y[i] - ly;
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) || 1;
          const f = ((1 - d / R) * L.push) / d;
          vx += dx * f;
          vy += dy * f;
        }
      }
      vx *= L.damp;
      vy *= L.damp;
      const sp = Math.hypot(vx, vy);
      if (sp > L.maxv) {
        vx *= L.maxv / sp;
        vy *= L.maxv / sp;
      }
      p.vx[i] = vx;
      p.vy[i] = vy;
      p.x[i] += vx;
      p.y[i] += vy;
      if (Math.abs(p.x[i] - hx) > 0.35 || Math.abs(p.y[i] - hy) > 0.35)
        moving++;
    }
    return moving;
  }

  private paint(L: { ink: Rgb }, o: Cloud) {
    const p = o.buf;
    const [r, g, b] = L.ink;
    const col = (255 << 24) | (b << 16) | (g << 8) | r;
    const w = p.c.width;
    const h = p.c.height;
    p.b.fill(0);
    for (let i = 0; i < p.n; i++) {
      const X = Math.round(p.x[i]) + p.m;
      const Y = Math.round(p.y[i]) + p.m;
      if (X >= 0 && X < w && Y >= 0 && Y < h) p.b[Y * w + X] = col;
    }
    p.cx.putImageData(p.img, 0, 0);
  }

  private farRainInk() {
    const farL = this.farL;
    if (!farL) return INK[this.sky].far;
    const mid = INK[this.sky].mid;
    return farL.ink.map((c, i) => Math.round(c + (mid[i] - c) * FAR_INK_MIX));
  }

  private emitFar(dt: number) {
    const farL = this.farL;
    if (!this.rainOn || !farL || this.farDrops.length > 1600) return;
    const s = farL.sprite;
    const bot = bottoms(s);
    const step = farStep(s);
    for (let k = 0.13 * this.W * dt; k > 0; k--) {
      if (Math.random() > k) break;
      const x = Math.random() * this.W;
      const u = x - farL.off;
      const col = Math.floor(u - Math.floor(u / step) * step);
      const by = bot[col];
      if (by < 0) continue;
      if (this.snow) {
        if (Math.random() > 0.2) continue;
        const v = 9 + Math.random() * 9;
        this.farDrops.push({
          x,
          y: farL.y + by - Math.random() * 4,
          vx: 0.5,
          vy: v,
          pv: 0,
          sz: 1,
          ph: Math.random() * 6.28,
          amp: 2 + Math.random() * 2,
        });
        continue;
      }
      const v = 170 + Math.random() * 90;
      const y0 = farL.y + by - Math.random() * 4;
      this.farDrops.push({
        x,
        y: y0,
        y0,
        vx: v * 0.04,
        vy: v,
        max: 3 + Math.round(Math.random() * 3),
        pv: 0,
      });
    }
  }

  private drawFarDrops(dt: number) {
    const list = this.farDrops;
    if (!list.length) return;
    const { ctx } = this;
    ctx.fillStyle = `rgb(${this.farRainInk().join(",")})`;
    for (let i = list.length - 1; i >= 0; i--) {
      const d = list[i];
      d.y += d.vy * dt;
      d.x += d.vx * dt;
      if (d.y > this.H || !this.rainOn) {
        list[i] = list[list.length - 1];
        list.pop();
        continue;
      }
      this.pushDrop(d, 45, this.snow ? 900 : 1800, dt);
      if (d.sz) d.ph = (d.ph ?? 0) + dt * 1.3;
      if (!this.inView(d.x - 8, d.y - 8, 16, 16)) continue;
      if (d.sz) {
        ctx.fillRect(
          Math.round(d.x + Math.sin(d.ph ?? 0) * (d.amp ?? 0)),
          Math.round(d.y),
          d.sz,
          d.sz,
        );
      } else {
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, this.dropLen(d));
      }
    }
  }

  private emit(L: CloudLayer, o: Cloud, x: number, y: number, dt: number) {
    if (!this.rainOn || this.drops.length > 1400) return;
    const s = o.sprite;
    const bot = bottoms(s);
    const mid = L.name === "mid";
    const snow = this.snow;
    for (
      let k = (snow ? 0.035 : 0.09) * s.w * (mid ? (snow ? 1.2 : 0.6) : 1) * dt;
      k > 0;
      k--
    ) {
      if (Math.random() > k) break;
      let c = -1;
      let by = -1;
      for (let t = 0; t < 4 && by < 0; t++) {
        c = Math.floor(Math.random() * s.w);
        by = bot[o.flip ? s.w - 1 - c : c];
      }
      if (by < 0) continue;
      if (snow) {
        const v = (16 + Math.random() * 16) * (mid ? 0.7 : 1);
        this.drops.push({
          cs: L.speed,
          x: x + c,
          y: y + by - Math.random() * 6,
          vx: L.speed * 0.6,
          vy: v,
          mid,
          pv: 0,
          sz: mid ? 1 : 2,
          ph: Math.random() * 6.28,
          amp: (mid ? 3 : 5) + Math.random() * 3,
        });
        continue;
      }
      const v = (240 + Math.random() * 120) * (mid ? 0.7 : 1);
      const y0 = y + by - Math.random() * 6;
      this.drops.push({
        cs: L.speed,
        x: x + c,
        y: y0,
        y0,
        vx: L.speed + v * 0.06,
        vy: v,
        max: (mid ? 3 : 5) + Math.round(Math.random() * (mid ? 2 : 3)),
        mid,
        pv: 0,
      });
    }
  }

  private dropLen(d: Drop) {
    const max = d.max ?? 1;
    return Math.max(
      1,
      Math.round(1 + (max - 1) * Math.min(1, (d.y - (d.y0 ?? d.y)) / 90)),
    );
  }

  private pushDrop(d: Drop, R: number, A: number, dt: number) {
    if (dt <= 0) return;
    const dx = d.x - this.px;
    const dy = d.y - this.py;
    const d2 = dx * dx + dy * dy;
    if (d2 < R * R) {
      const dist = Math.sqrt(d2) || 1;
      d.pv += (dx / dist) * (1 - dist / R) * A * dt;
    }
    d.pv *= Math.exp(-3.5 * dt);
    d.x += d.pv * dt;
  }

  private drawDrops(dt: number) {
    const { ctx } = this;
    const list = this.drops;
    for (let i = list.length - 1; i >= 0; i--) {
      const d = list[i];
      d.y += d.vy * dt;
      d.x += d.vx * dt;
      if (d.y > this.H || !this.rainOn) {
        list[i] = list[list.length - 1];
        list.pop();
        continue;
      }
      this.pushDrop(
        d,
        d.mid ? 55 : 85,
        (d.mid ? 2600 : 4200) * (this.snow ? 0.5 : 1),
        dt,
      );
      if (d.sz) d.ph = (d.ph ?? 0) + dt * 1.4;
      if (!this.inView(d.x - 8, d.y - 8, 16, 16)) continue;
      if (d.sz) {
        ctx.fillStyle = d.mid ? "rgb(172,170,165)" : "rgb(96,94,90)";
        ctx.fillRect(
          Math.round(d.x + Math.sin(d.ph ?? 0) * (d.amp ?? 0)),
          Math.round(d.y),
          d.sz,
          d.sz,
        );
        continue;
      }
      ctx.fillStyle = d.mid ? "rgb(150,148,143)" : "rgb(82,80,76)";
      ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, this.dropLen(d));
    }
  }
}
