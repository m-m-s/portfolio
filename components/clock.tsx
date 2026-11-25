"use client";

import { useEffect, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
});

function nycTime() {
  return `${formatter.format(new Date())} ET`;
}

export function Clock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    // Recomputed from the real time each tick: background tabs slow timers down.
    const tick = () => {
      setTime(nycTime());
      timeout = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    tick();
    return () => clearTimeout(timeout);
  }, []);

  return (
    // Until the time is known its width is held by generated text, which isn't page text, so no false time is read.
    <time
      className={`whitespace-nowrap tabular-nums ${time ? "" : "before:invisible before:content-['00:00:00_PM_ET']"}`}
    >
      {time}
    </time>
  );
}
