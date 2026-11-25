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

// Must run before navigation starts: the browser snapshots the old page then.
// `revealAfter` (ms) replaces the camera's usual delay before the crossfade.
export function prepareNavigation(
  from: string,
  to: string,
  focus?: { x: number; y: number },
  revealAfter?: number,
) {
  const root = document.documentElement;
  root.dataset.nav = direction(from, to);
  if (revealAfter !== undefined)
    root.style.setProperty("--settle-delay", `${revealAfter}ms`);
  else root.style.removeProperty("--settle-delay");

  const room = document.querySelector(ROOM_SELECTOR)?.getBoundingClientRect();
  const point = focus ?? { x: innerWidth / 2, y: innerHeight / 2 };
  root.style.setProperty("--camera-x", `${point.x - (room?.left ?? 0)}px`);
  root.style.setProperty("--camera-y", `${point.y - (room?.top ?? 0)}px`);
}
