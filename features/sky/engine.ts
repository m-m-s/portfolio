// Ported from docs/reference/mock-snowy.html (build, frame, rain and dots).
// The order of random draws in build() matches the mock, so a seed gives the
// same sky in both.
import type { Sky } from "@/features/weather/sky";
import { cloudSettings, configFor, type SkyConfig } from "./config";
import {
  type Band,
  bandRanges,
  CLOUDS,
  COUNT,
  FAR,
  FAR_SIDE_FADE,
  INK,
  LARGE_CLOUD,
  LAYER,
  type Layer,
  MAX_LARGE,
  PHONE_CLOUD_SCALE,
  PHONE_WIDTH,
  REFERENCE,
  RETUNED_SKIES,
  type Rgb,
  SKY_FRACTION,
  WIDE_WEIGHT,
  WIDTH,
  WINDOW_CLOUD_SCALE,
} from "./constants";
import {
  bottoms,
  ditherCloud,
  farFromImage,
  resizeFar,
  type Sprite,
  tinted,
} from "./dither";

type Physics = (typeof LAYER)[Layer];

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

type FarLayer = { sprite: Sprite; ink: Rgb; y: number };

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

const FAR_INK_MIX = 0.35;
/** How much room two copies of the same cloud want between their centres, in mean cloud widths (other pairs: 0.75). */
const SAME_CLOUD_ROOM = 2.5;

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

/** Lets the page paint and respond between clouds, so a slow build doesn't freeze it. */
function nextTask() {
  return new Promise<void>((resolve) => setTimeout(resolve, 0));
}

/** Far tiles overlap by their faded sides, so they advance by less than their width. */
function farStep(s: Sprite) {
  return Math.max(1, Math.round(s.w * (1 - FAR_SIDE_FADE)));
}

export function randomSeed() {
  return 1 + Math.floor(Math.random() * 2147483645);
}

export class SkyEngine {
  private readonly ctx: CanvasRenderingContext2D;
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
  private scaleOverride: number | "window" | null = null;

  private readonly src = new Map<string, HTMLImageElement>();
  private readonly farBase = new Map<string, Sprite>();
  private readonly sprites = new Map<string, Sprite>();
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
  private stoppedAt = 0;
  private resizeTimer: ReturnType<typeof setTimeout> | undefined;
  private readonly resizeObserver: ResizeObserver;
  private readonly abort = new AbortController();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas unavailable");
    this.ctx = ctx;

    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        if (this.ready) void this.build();
      }, 150);
    });
    this.resizeObserver.observe(canvas);

    const { signal } = this.abort;
    const point = (e: PointerEvent) => {
      if (!this.interactive) return;
      const r = this.canvas.getBoundingClientRect();
      this.px = e.clientX - r.left;
      this.py = e.clientY - r.top;
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
  }

  /** Show a weather's sky. A new seed gives a new layout; leave it out for a random one. */
  async show(sky: Sky, seed = randomSeed()) {
    const id = ++this.loadId;
    this.sky = sky;
    this.config = configFor(sky);
    this.snow = sky === "snowy";
    this.rainOn = sky === "rainy" || sky === "snowy";
    this.layoutSeed = seed;

    const clouds = [
      ...new Set([
        ...Object.keys(this.config.front),
        ...Object.keys(this.config.mid),
      ]),
    ].filter((id) => !this.src.has(id));
    const strips = Object.keys(this.config.far).filter(
      (k) => !this.farBase.has(k),
    );
    await Promise.all([
      ...clouds.map(async (c) => {
        const im = await loadImage(`/sky/clouds/${c}.png`);
        if (im) this.src.set(c, im);
      }),
      ...strips.map(async (k) => {
        const im = await loadImage(`/sky/strips/${k}.png`);
        if (im) this.farBase.set(k, farFromImage(im));
      }),
    ]);
    if (id !== this.loadId) return;

    if (!(await this.build())) return;
    const first = !this.ready;
    this.ready = true;
    this.syncLoop();
    if (first) this.onReady?.();
  }

  /** Overrides the weather's cloud scale (null goes back to it). Keeps the layout. */
  setCloudScale(scale: number | "window" | null) {
    if (scale === this.scaleOverride) return;
    this.scaleOverride = scale;
    if (this.ready) void this.build();
  }

  /** The far strip grows with the sky's height alone: anchored by its bottom, growing any faster would lift its top above where it sits at the reference size. Window pages show a fixed-size window and don't grow. */
  private get farGrowth() {
    if (this.scaleOverride === "window") return 1;
    return Math.max(1, this.H / REFERENCE.height);
  }

  /** Clouds grow with a blend of the sky's height and the screen's width (WIDE_WEIGHT). */
  private get cloudGrowth() {
    if (this.scaleOverride === "window") return 1;
    const byWidth = this.W / REFERENCE.width;
    return Math.max(
      1,
      this.farGrowth ** (1 - WIDE_WEIGHT) * byWidth ** WIDE_WEIGHT,
    );
  }

  /** Extra clouds for the width the grown clouds don't cover, so the spacing stays as tuned. */
  private get fill() {
    if (this.scaleOverride === "window") return 1;
    return Math.max(1, this.W / (REFERENCE.width * this.cloudGrowth));
  }

  private get cloudScale() {
    const phone = this.W < PHONE_WIDTH;
    if (this.scaleOverride === "window")
      return WINDOW_CLOUD_SCALE[phone ? "phone" : "laptop"];
    const base =
      this.scaleOverride ?? (phone ? PHONE_CLOUD_SCALE[this.sky] : 1);
    return base * this.cloudGrowth;
  }

  /** Called after every frame is painted. */
  onFrame: (() => void) | null = null;
  /** Called once, when the first sky is built. */
  onReady: (() => void) | null = null;

  /** Stops drawing while nothing shows the sky; on return the clouds have drifted on. */
  setActive(active: boolean) {
    this.active = active;
    this.syncLoop();
  }

  /** When off, the dots and drops ignore the pointer. */
  setInteractive(on: boolean) {
    this.interactive = on;
    if (!on) {
      this.px = -1e5;
      this.py = -1e5;
    }
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

  // ---- loop ----

  private syncLoop() {
    const run = this.ready && this.active && !document.hidden;
    if (run && !this.raf) {
      const now = performance.now();
      if (this.stoppedAt) {
        const away = (now - this.stoppedAt) / 1000;
        for (const L of Object.values(this.layers)) L.off += L.speed * away;
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
    const { ctx, W, H } = this;
    // A frame can be stamped slightly before the wake that requested it.
    const dt = Math.min(0.05, Math.max(0, now - this.last) / 1000);
    this.last = now;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, W, H);

    const farL = this.farL;
    if (farL) {
      const tile = tinted(farL.sprite, farL.ink, false);
      for (let x = 0; x < W; x += farStep(farL.sprite)) {
        ctx.drawImage(tile, x, farL.y);
      }
      this.emitFar(dt);
      this.drawFarDrops(dt);
    }

    for (const name of ["mid", "front"] as const) {
      if (name === "front") this.drawDrops(dt);
      const L = this.layers[name];
      if (!L) continue;
      L.off += L.speed * dt;
      for (const o of L.inst) {
        const s = o.sprite;
        let v = (o.x0 + L.off) % L.span;
        if (v < 0) v += L.span;
        const x = v - L.margin;
        const y = o.y;
        if (x > W || x + s.w < 0) {
          o.p = null;
          continue;
        }
        this.emit(L, o, x, y, dt);
        const lx = this.px - x;
        const ly = this.py - y;
        const R = L.radius;
        const near = lx > -R && lx < s.w + R && ly > -R && ly < s.h + R;
        if (near && !o.p) this.wake(o);
        if (o.p) {
          const moving = this.step(L, o, lx, ly, near);
          if (!near && moving === 0) o.p = null;
          else {
            this.paint(L, o);
            ctx.drawImage(o.p.c, x - o.p.m, y - o.p.m);
            continue;
          }
        }
        ctx.drawImage(tinted(s, L.ink, o.flip), x, y);
      }
    }
    if (!this.layers.front) this.drawDrops(dt);
    this.onFrame?.();

    this.raf = requestAnimationFrame(this.frame);
  };

  // ---- composition ----

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
      const im = this.src.get(id);
      if (!im) return null;
      s = ditherCloud(im, w, t);
      this.sprites.set(key, s);
    }
    return s;
  }

  private farSize(k: string) {
    return this.config.far[k].size * this.farGrowth;
  }

  private farKey(k: string) {
    const f = this.config.far[k];
    const base = this.farBase.get(k);
    if (!base || !f) return null;
    const size = this.farSize(k);
    if (size === 1 && f.shade === 1) return null;
    return `fr/${k}/${Math.round(base.w * size)}/${f.shade}`;
  }

  private farSprite(k: string) {
    const base = this.farBase.get(k);
    const key = this.farKey(k);
    if (!base || !key) return base ?? null;
    let s = this.sprites.get(key);
    if (!s) {
      s = resizeFar(base, { ...this.config.far[k], size: this.farSize(k) });
      this.sprites.set(key, s);
    }
    return s;
  }

  /** Where a cloud's base lands: u from 0 to 1 runs through its allowed bands, top to bottom. */
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

  /** Resolves false if a newer build took over while this one waited. */
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
    this.S = this.H * SKY_FRACTION[this.sky];
    const { W, H } = this;

    const count = COUNT[this.sky];
    const n = {
      mid: Math.max(1, Math.round(count.mid * this.fill)),
      front: Math.max(1, Math.round(count.front * this.fill)),
    };
    const pickSize = (c: { sizeMin: number; sizeMax: number }) =>
      c.sizeMin + (c.sizeMax - c.sizeMin) * this.rnd();

    const layers: Partial<Record<Layer, CloudLayer>> = {};
    for (const name of ["mid", "front"] as const) {
      const pool = CLOUDS.filter(
        (id) => this.config[name][id] && this.src.has(id),
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
      const retuned = RETUNED_SKIES.has(this.sky);
      // One height per equal slice of the range, so a small layer can't land all high.
      const spread = retuned
        ? this.shuffled(
            Array.from(
              { length: n[name] },
              (_, i) => (i + this.rnd()) / n[name],
            ),
          )
        : null;
      const used = new Map<string, number>();
      const capped = (id: string) => {
        if (!retuned) return false;
        const c = cloudSettings(this.config, name, id);
        const large = (c.sizeMin + c.sizeMax) / 2 >= LARGE_CLOUD;
        return large && (used.get(id) ?? 0) >= MAX_LARGE;
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

      // Biggest clouds first, each into the most open stretch (best of a few tries).
      // Two copies of the same cloud want much more room between them: side by
      // side (one often mirrored) they read as a symmetric pair.
      items.sort((a, b) => b.w - a.w);
      const placed: { id: string; c: number; w: number }[] = [];
      const gap = (a: number, b: number) => {
        const d = Math.abs(a - b) % span;
        return Math.min(d, span - d);
      };
      const inst: Cloud[] = [];
      for (const it of items) {
        let bx = this.rnd() * span;
        let bs = -1e9;
        if (placed.length) {
          for (let t = 0; t < 8; t++) {
            const x = this.rnd() * span;
            const c = x + it.w / 2;
            let sc = 1e9;
            for (const p of placed) {
              const room = p.id === it.id ? SAME_CLOUD_ROOM : 0.75;
              sc = Math.min(sc, gap(c, p.c) - ((it.w + p.w) / 2) * room);
            }
            if (sc > bs) {
              bs = sc;
              bx = x;
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
      const margin = Math.max(...inst.map((o) => o.sprite.w));
      const ink = INK[this.sky][name];
      layers[name] = {
        ...LAYER[name],
        name,
        ink,
        inst,
        span: span + margin,
        margin,
        off: this.rnd() * span,
      };
      for (const o of inst) tinted(o.sprite, ink, o.flip);
    }

    // Far: one of this weather's strips, chosen at random each visit.
    const farPool = FAR.filter(
      (k) => this.config.far[k] && this.farBase.has(k),
    );
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
        sprite: fs,
        ink: fink,
        y: Math.round(this.S - fs.h - f.height * this.S),
      };
      tinted(fs, fink, false);
    }

    this.layers = layers;
    this.farL = farL;
    this.dpr = Math.min(2, window.devicePixelRatio || 1);
    this.canvas.width = Math.round(W * this.dpr);
    this.canvas.height = Math.round(H * this.dpr);

    // Start rain and snow already falling, as if it had been going for a while.
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

  // ---- dots scatter from the cursor and spring back ----

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

  private step(L: CloudLayer, o: Cloud, lx: number, ly: number, near: boolean) {
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

  private paint(L: CloudLayer, o: Cloud) {
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

  // ---- rain and snow ----

  private farRainInk() {
    const farL = this.farL;
    if (!farL) return INK[this.sky].far;
    const mid = INK[this.sky].mid;
    return farL.ink.map((c, i) => Math.round(c + (mid[i] - c) * FAR_INK_MIX));
  }

  /** Distant rain from the underside of the far strip: thinner, slower, paler. */
  private emitFar(dt: number) {
    const farL = this.farL;
    if (!this.rainOn || !farL || this.farDrops.length > 1600) return;
    const s = farL.sprite;
    const bot = bottoms(s);
    const step = farStep(s);
    for (let k = 0.13 * this.W * dt; k > 0; k--) {
      if (Math.random() > k) break;
      const x = Math.random() * this.W;
      const col = Math.floor(x - Math.floor(x / step) * step);
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
      if (d.sz) {
        d.ph = (d.ph ?? 0) + dt * 1.3;
        ctx.fillRect(
          Math.round(d.x + Math.sin(d.ph) * (d.amp ?? 0)),
          Math.round(d.y),
          d.sz,
          d.sz,
        );
      } else {
        ctx.fillRect(Math.round(d.x), Math.round(d.y), 1, this.dropLen(d));
      }
    }
  }

  /** Rain and snow from the underside of a cloud, drifting along with it. */
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

  /** A drop starts as a dot and stretches into a streak over its first ~90px. */
  private dropLen(d: Drop) {
    const max = d.max ?? 1;
    return Math.max(
      1,
      Math.round(1 + (max - 1) * Math.min(1, (d.y - (d.y0 ?? d.y)) / 90)),
    );
  }

  /** The cursor pushes nearby drops sideways; the push fades and the drop falls on. */
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
      if (d.sz) {
        d.ph = (d.ph ?? 0) + dt * 1.4;
        ctx.fillStyle = d.mid ? "rgb(172,170,165)" : "rgb(96,94,90)";
        ctx.fillRect(
          Math.round(d.x + Math.sin(d.ph) * (d.amp ?? 0)),
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
