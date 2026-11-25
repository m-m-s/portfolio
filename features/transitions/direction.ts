const ROOM_SELECTOR = "[data-room]";

export const ROOM_WALK = "room-walk";

function depth(pathname: string) {
  return pathname.split("/").filter(Boolean).length;
}

function parent(pathname: string) {
  return pathname.split("/").filter(Boolean).slice(0, -1).join("/");
}

function direction(from: string, to: string) {
  if (depth(to) < depth(from)) return "out";
  const sideBySide =
    depth(to) === depth(from) && depth(to) > 1 && parent(to) === parent(from);
  return sideBySide ? "across" : "in";
}

let revealAt: number | null = null;

// Must run before navigation starts: the browser snapshots the old page then.
// `holdFor` keeps the old page up until that many ms from now, however soon the new page is ready.
export function prepareNavigation(
  from: string,
  to: string,
  focus?: { x: number; y: number },
  holdFor = 0,
) {
  const root = document.documentElement;
  root.dataset.nav = direction(from, to);
  root.style.removeProperty("--settle-delay");
  revealAt = holdFor ? performance.now() + holdFor : null;

  const room = document.querySelector(ROOM_SELECTOR)?.getBoundingClientRect();
  const point = focus ?? { x: innerWidth / 2, y: innerHeight / 2 };
  root.style.setProperty("--camera-x", `${point.x - (room?.left ?? 0)}px`);
  root.style.setProperty("--camera-y", `${point.y - (room?.top ?? 0)}px`);
}

/** Runs as the page change starts: a held page starts crossfading when its hold ends, not after the usual delay. */
export function startReveal() {
  if (revealAt === null) return;
  const wait = Math.max(0, revealAt - performance.now());
  document.documentElement.style.setProperty("--settle-delay", `${wait}ms`);
  revealAt = null;
}
