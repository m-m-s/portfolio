"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, ViewTransition } from "react";
import { usePath } from "@/features/transitions/use-path";
import { prepareNavigation, ROOM_WALK } from "./direction";

export function RoomTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePath();
  const router = useRouter();
  const current = useRef(pathname);

  useEffect(() => {
    current.current = pathname;
  }, [pathname]);

  useEffect(() => {
    // React renders anything started inside a popstate event synchronously,
    // which skips view transitions. So back/forward is taken over here (capture
    // runs before Next's listener) and replayed as a normal navigation.
    const onPopState = (event: PopStateEvent) => {
      const to = window.location.pathname;
      const browserAnimates =
        "hasUAVisualTransition" in event && event.hasUAVisualTransition;
      if (to === current.current || browserAnimates) return;

      event.stopImmediatePropagation();
      prepareNavigation(current.current, to);
      const url = to + window.location.search + window.location.hash;
      setTimeout(() => router.replace(url, { transitionTypes: [ROOM_WALK] }));
    };
    window.addEventListener("popstate", onPopState, { capture: true });
    return () =>
      window.removeEventListener("popstate", onPopState, { capture: true });
  }, [router]);

  return (
    <ViewTransition
      name="room"
      default={{ [ROOM_WALK]: "auto", default: "none" }}
    >
      <div data-room className="flex flex-1 flex-col">
        {children}
      </div>
    </ViewTransition>
  );
}
