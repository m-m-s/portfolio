const ROOM_SELECTOR = "[data-room]";

/** Marks a navigation as a walk between rooms: only these play the room transition. */
export const ROOM_WALK = "room-walk";

function depth(pathname: string) {
  return pathname.split("/").filter(Boolean).length;
}

// Must run before navigation starts: the browser snapshots the old page then.
export function prepareNavigation(
  from: string,
  to: string,
  focus?: { x: number; y: number },
) {
  const root = document.documentElement;
  root.dataset.nav = depth(to) < depth(from) ? "out" : "in";

  const room = document.querySelector(ROOM_SELECTOR)?.getBoundingClientRect();
  const point = focus ?? { x: innerWidth / 2, y: innerHeight / 2 };
  root.style.setProperty("--camera-x", `${point.x - (room?.left ?? 0)}px`);
  root.style.setProperty("--camera-y", `${point.y - (room?.top ?? 0)}px`);
}
