import { type RefObject, useEffect } from "react";

export const EDGE = 0.12;
const EDGE_SPEED = 900;
const DRAG_SLOP = 6;
const FRICTION = 4;

type Row = {
  el: HTMLElement;
  track: HTMLElement;
  photos: HTMLElement[];
  offset: number;
  fling: number;
  ends: number[];
  start: number;
  lap: number;
  shifts: number[];
  shown: number;
};

type Drag = {
  row: Row;
  id: number;
  startX: number;
  startOffset: number;
  lastX: number;
  lastT: number;
  speed: number;
  moved: boolean;
};

export function useRowMotion(container: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = container.current;
    if (!root) return;
    const rows: Row[] = [
      ...root.querySelectorAll<HTMLElement>("[data-row]"),
    ].flatMap((el) => {
      const track = el.querySelector<HTMLElement>("[data-track]");
      if (!track) return [];
      return [
        {
          el,
          track,
          photos: [...track.children] as HTMLElement[],
          offset: 0,
          fling: 0,
          ends: [],
          start: 0,
          lap: 0,
          shifts: [],
          shown: 0,
        },
      ];
    });
    const mouse = matchMedia("(hover: hover) and (pointer: fine)");

    let raf = 0;
    let last = 0;
    let pointer: { x: number; y: number } | null = null;
    let drag: Drag | null = null;
    let swallowClick = false;

    const measure = () => {
      for (const row of rows) {
        const gap = Number.parseFloat(getComputedStyle(row.track).columnGap);
        const first = row.photos[0];
        const final = row.photos.at(-1);
        if (!first || !final) continue;
        row.start = first.offsetLeft;
        row.ends = row.photos.map((p) => p.offsetLeft + p.offsetWidth);
        row.lap = final.offsetLeft + final.offsetWidth + gap - row.start;
        row.shifts = row.photos.map(() => -1);
      }
    };

    /** Whether the row moved since it was last placed. */
    const place = (row: Row) => {
      if (!row.lap) return false;
      const o = ((row.offset % row.lap) + row.lap) % row.lap;
      const moved = o !== row.shown;
      row.shown = o;
      row.track.style.transform = o ? `translateX(${-o}px)` : "";
      row.photos.forEach((photo, i) => {
        const shift = row.ends[i] - o < 0 ? row.lap : 0;
        if (shift === row.shifts[i]) return;
        photo.style.transform = shift ? `translateX(${shift}px)` : "";
        row.shifts[i] = shift;
      });
      return moved;
    };

    const edgePull = () => {
      if (!pointer || drag) return 0;
      const zone = window.innerWidth * EDGE;
      if (pointer.x < zone) return -EDGE_SPEED * (1 - pointer.x / zone);
      const fromRight = window.innerWidth - pointer.x;
      if (fromRight < zone) return EDGE_SPEED * (1 - fromRight / zone);
      return 0;
    };

    const rowAt = (y: number) =>
      rows.find((row) => {
        const box = row.el.getBoundingClientRect();
        return y >= box.top && y <= box.bottom;
      });

    const frame = (now: number) => {
      // A frame can be stamped slightly before the wake that requested it.
      const dt = Math.min(0.05, Math.max(0, now - last) / 1000);
      last = now;
      let moving = drag !== null;

      const pull = edgePull();
      const hovered =
        pull && pointer && !document.querySelector("dialog[open]")
          ? rowAt(pointer.y)
          : undefined;
      if (hovered) {
        hovered.offset += pull * dt;
        moving = true;
      }

      let shifted = false;
      for (const row of rows) {
        if (row.fling && drag?.row !== row) {
          row.fling *= Math.exp(-FRICTION * dt);
          if (Math.abs(row.fling) < 20) row.fling = 0;
          else {
            row.offset += row.fling * dt;
            moving = true;
          }
        }
        if (place(row)) shifted = true;
      }
      if (shifted) root.dispatchEvent(new Event("rowmove"));
      raf = moving ? requestAnimationFrame(frame) : 0;
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onPointerDown = (e: PointerEvent) => {
      if (drag || (e.pointerType === "mouse" && e.button !== 0)) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-row]");
      const row = rows.find((r) => r.el === el);
      if (!row) return;
      row.fling = 0;
      drag = {
        row,
        id: e.pointerId,
        startX: e.clientX,
        startOffset: row.offset,
        lastX: e.clientX,
        lastT: e.timeStamp,
        speed: 0,
        moved: false,
      };
      wake();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "mouse") {
        pointer = mouse.matches ? { x: e.clientX, y: e.clientY } : null;
        // Released outside the window, where no pointerup arrives.
        if (drag && e.buttons === 0) endDrag(false);
      }
      if (drag && e.pointerId === drag.id) {
        const dx = e.clientX - drag.startX;
        if (!drag.moved && Math.abs(dx) > DRAG_SLOP) drag.moved = true;
        if (drag.moved) {
          drag.row.offset = drag.startOffset - dx;
          const gap = Math.max(1, e.timeStamp - drag.lastT);
          const speed = (-(e.clientX - drag.lastX) / gap) * 1000;
          drag.speed = drag.speed * 0.6 + speed * 0.4;
        }
        drag.lastX = e.clientX;
        drag.lastT = e.timeStamp;
      }
      if (drag || edgePull()) wake();
    };

    /** Without a fling when the release went unseen or the browser took the gesture (a page scroll), since the last speed is stale. */
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

    const onPointerUp = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) endDrag(true);
    };
    const onPointerCancel = (e: PointerEvent) => {
      if (drag && e.pointerId === drag.id) endDrag(false);
    };

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      const el = (e.target as Element).closest<HTMLElement>("[data-row]");
      const row = rows.find((r) => r.el === el);
      if (!row) return;
      // Also keeps the browser's swipe-to-go-back from firing.
      e.preventDefault();
      row.fling = 0;
      row.offset +=
        e.deltaMode === WheelEvent.DOM_DELTA_LINE ? e.deltaX * 16 : e.deltaX;
      wake();
    };

    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      e.preventDefault();
      e.stopPropagation();
      swallowClick = false;
    };

    const onFocus = (e: FocusEvent) => {
      const el = (e.target as Element).closest<HTMLElement>("[data-row]");
      const row = rows.find((r) => r.el === el);
      if (!row || !(e.target instanceof HTMLElement)) return;
      const box = e.target.getBoundingClientRect();
      const view = row.el.getBoundingClientRect();
      if (box.left >= view.left && box.right <= view.right) return;
      row.fling = 0;
      row.offset += box.left - view.left - row.start;
      wake();
    };

    const onLeave = () => {
      pointer = null;
    };

    measure();
    for (const row of rows) place(row);
    const resize = new ResizeObserver(() => {
      measure();
      for (const row of rows) place(row);
    });
    resize.observe(root);

    const abort = new AbortController();
    const opts = { signal: abort.signal, passive: true };
    window.addEventListener("pointermove", onPointerMove, opts);
    window.addEventListener("pointerup", onPointerUp, opts);
    window.addEventListener("pointercancel", onPointerCancel, opts);
    window.addEventListener("blur", onLeave, opts);
    document.documentElement.addEventListener("pointerleave", onLeave, opts);
    root.addEventListener("pointerdown", onPointerDown, opts);
    root.addEventListener("focusin", onFocus, opts);
    root.addEventListener("wheel", onWheel, {
      signal: abort.signal,
      passive: false,
    });
    root.addEventListener("click", onClick, {
      signal: abort.signal,
      capture: true,
    });
    root.addEventListener("dragstart", (e) => e.preventDefault(), {
      signal: abort.signal,
    });

    return () => {
      abort.abort();
      resize.disconnect();
      cancelAnimationFrame(raf);
      for (const row of rows) {
        row.track.style.transform = "";
        for (const photo of row.photos) photo.style.transform = "";
      }
    };
  }, [container]);
}
