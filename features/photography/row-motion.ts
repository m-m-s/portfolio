import { type RefObject, useEffect } from "react";

/** Drift in px per px/s of page scroll speed, up to DRIFT_MAX px. */
const DRIFT_PER_SPEED = 0.03;
const DRIFT_MAX = 48;
/** How quickly the drift follows the scroll, and settles back once it stops (per second). */
const DRIFT_EASE = 5;
/** A pause in scroll events longer than this, in ms, means scrolling stopped. */
const SCROLL_REST = 120;
/** Hovering this share of the screen's width at either side scrolls a row, up to EDGE_SPEED px/s at the very edge. */
const EDGE = 0.12;
const EDGE_SPEED = 900;
/** A mouse drag shorter than this, in px, is a click. */
const DRAG_SLOP = 5;
/** How quickly a flung row slows down (per second). */
const FRICTION = 4;

type Row = {
  el: HTMLElement;
  /** 1 if the row moves right, -1 left. */
  dir: number;
  drift: number;
  fling: number;
  /** Sub-pixel scroll not yet applied: scrollLeft can round small steps away. */
  carry: number;
};

type Drag = {
  row: Row;
  startX: number;
  startScroll: number;
  lastX: number;
  lastT: number;
  speed: number;
  moved: boolean;
};

/** Drifts rows on page scroll, scrolls them when the mouse hovers a screen edge, and lets a mouse drag and fling them. Rows are the `[data-row]` elements, their value the direction they move. */
export function useRowMotion(container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const rows: Row[] = [
      ...root.querySelectorAll<HTMLElement>("[data-row]"),
    ].map((el) => ({
      el,
      dir: Number(el.dataset.row),
      drift: 0,
      fling: 0,
      carry: 0,
    }));
    const still = matchMedia("(prefers-reduced-motion: reduce)");
    const mouse = matchMedia("(hover: hover) and (pointer: fine)");

    let raf = 0;
    let last = 0;
    let scrollY = window.scrollY;
    let scrolledAt = -Infinity;
    let scrollSpeed = 0;
    let pointer: { x: number; y: number } | null = null;
    let drag: Drag | null = null;
    let swallowClick = false;

    const scrollBy = (row: Row, px: number) => {
      const { el } = row;
      const max = el.scrollWidth - el.clientWidth;
      if ((px < 0 && el.scrollLeft <= 0) || (px > 0 && el.scrollLeft >= max)) {
        row.carry = 0;
        return false;
      }
      row.carry += px;
      const whole = Math.trunc(row.carry);
      el.scrollLeft += whole;
      row.carry -= whole;
      return true;
    };

    /** The edge-hover scroll speed at the pointer's x, before checking which row it's over. */
    const edgePull = () => {
      if (!pointer || drag) return 0;
      const zone = window.innerWidth * EDGE;
      if (pointer.x < zone) return -EDGE_SPEED * (1 - pointer.x / zone);
      const fromRight = window.innerWidth - pointer.x;
      if (fromRight < zone) return EDGE_SPEED * (1 - fromRight / zone);
      return 0;
    };

    const rowUnder = (y: number) =>
      rows.find((row) => {
        const box = row.el.getBoundingClientRect();
        return y >= box.top && y <= box.bottom;
      });

    const frame = (now: number) => {
      // A frame can be stamped slightly before the wake that requested it.
      const dt = Math.min(0.05, Math.max(0, now - last) / 1000);
      last = now;
      const scrolling = now - scrolledAt < SCROLL_REST;
      if (!scrolling) scrollSpeed = 0;
      const target = still.matches
        ? 0
        : Math.min(DRIFT_MAX, scrollSpeed * DRIFT_PER_SPEED);
      const follow = 1 - Math.exp(-DRIFT_EASE * dt);
      let moving = scrolling || drag !== null;

      // Measure before any writes, so the frame never forces a second layout.
      const pull = edgePull();
      const hovered =
        pull && pointer && !document.querySelector("dialog[open]")
          ? rowUnder(pointer.y)
          : undefined;
      if (hovered && scrollBy(hovered, pull * dt)) moving = true;

      for (const row of rows) {
        if (row.fling && drag?.row !== row) {
          row.fling *= Math.exp(-FRICTION * dt);
          if (Math.abs(row.fling) < 20 || !scrollBy(row, row.fling * dt)) {
            row.fling = 0;
          } else moving = true;
        }

        row.drift += (target - row.drift) * follow;
        if (target === 0 && row.drift < 0.1) row.drift = 0;
        else moving = true;
        const transform = row.drift
          ? `translateX(${row.dir * row.drift}px)`
          : "";
        if (row.el.style.transform !== transform) {
          row.el.style.transform = transform;
        }
      }
      raf = moving ? requestAnimationFrame(frame) : 0;
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onScroll = () => {
      const now = performance.now();
      const gap = Math.max(16, now - scrolledAt);
      const speed = (Math.abs(window.scrollY - scrollY) / gap) * 1000;
      scrollSpeed = scrollSpeed * 0.5 + speed * 0.5;
      scrollY = window.scrollY;
      scrolledAt = now;
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer = mouse.matches ? { x: e.clientX, y: e.clientY } : null;
      // Released outside the window, where no pointerup arrives.
      if (drag && e.buttons === 0) endDrag(false);
      if (drag) {
        const dx = e.clientX - drag.startX;
        if (!drag.moved && Math.abs(dx) > DRAG_SLOP) drag.moved = true;
        if (drag.moved) {
          drag.row.el.scrollLeft = drag.startScroll - dx;
          const gap = Math.max(1, e.timeStamp - drag.lastT);
          const speed = (-(e.clientX - drag.lastX) / gap) * 1000;
          drag.speed = drag.speed * 0.6 + speed * 0.4;
        }
        drag.lastX = e.clientX;
        drag.lastT = e.timeStamp;
      }
      if (drag || edgePull()) wake();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-row]");
      const row = rows.find((r) => r.el === el);
      if (!row) return;
      row.fling = 0;
      drag = {
        row,
        startX: e.clientX,
        startScroll: row.el.scrollLeft,
        lastX: e.clientX,
        lastT: e.timeStamp,
        speed: 0,
        moved: false,
      };
      wake();
    };

    /** Without a fling when the release happened unseen, since the last speed is stale. */
    const endDrag = (fling: boolean) => {
      if (!drag) return;
      if (drag.moved) {
        if (fling) drag.row.fling = drag.speed;
        swallowClick = true;
        // The click, if any, comes right after pointerup in the same task.
        setTimeout(() => {
          swallowClick = false;
        });
      }
      drag = null;
      wake();
    };

    const onPointerUp = () => endDrag(true);

    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      e.preventDefault();
      e.stopPropagation();
      swallowClick = false;
    };

    const onLeave = () => {
      pointer = null;
    };

    const abort = new AbortController();
    const opts = { signal: abort.signal, passive: true };
    window.addEventListener("scroll", onScroll, opts);
    window.addEventListener("pointermove", onPointerMove, opts);
    window.addEventListener("pointerup", onPointerUp, opts);
    window.addEventListener("pointercancel", onPointerUp, opts);
    window.addEventListener("blur", onLeave, opts);
    document.documentElement.addEventListener("pointerleave", onLeave, opts);
    root.addEventListener("pointerdown", onPointerDown, opts);
    root.addEventListener("click", onClick, {
      signal: abort.signal,
      capture: true,
    });
    root.addEventListener("dragstart", (e) => e.preventDefault(), {
      signal: abort.signal,
    });

    return () => {
      abort.abort();
      cancelAnimationFrame(raf);
      for (const row of rows) row.el.style.transform = "";
    };
  }, [container]);
}
