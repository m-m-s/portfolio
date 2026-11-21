"use client";

import { conditionLabel, type Sky } from "@/features/weather/sky";
import { useMoon } from "@/features/weather/use-moon";
import { WeatherIcon } from "./weather-icon";

export function WeatherCondition({
  sky,
  temperature,
}: {
  sky: Sky;
  temperature: number | null;
}) {
  const moon = useMoon();
  return (
    <p className="flex items-center gap-2">
      <WeatherIcon sky={sky} moon={moon} />
      <span>
        {conditionLabel(sky, moon !== null)}
        {temperature !== null && ` ${temperature}°`}
      </span>
    </p>
  );
}
