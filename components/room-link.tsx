"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { prepareNavigation, ROOM_WALK } from "@/features/transitions/direction";

/** An inline link to another room: no door swing, but the camera still walks toward it. */
export function RoomLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const link = useRef<HTMLAnchorElement>(null);
  return (
    <Link
      ref={link}
      href={href}
      transitionTypes={[ROOM_WALK]}
      onNavigate={() => {
        const box = link.current?.getBoundingClientRect();
        prepareNavigation(
          pathname,
          href,
          box && { x: box.left + box.width / 2, y: box.top + box.height / 2 },
        );
      }}
      className="font-bold hover:underline"
    >
      {children}
    </Link>
  );
}
