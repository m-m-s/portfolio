"use client";

import Link from "next/link";
import { useRef } from "react";
import { prepareNavigation, ROOM_WALK } from "@/features/transitions/direction";
import { usePath } from "@/features/transitions/use-path";

export function RoomLink({
  href,
  className = "font-bold hover:underline",
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pathname = usePath();
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
      className={className}
    >
      {children}
    </Link>
  );
}
