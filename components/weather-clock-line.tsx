import { getWeather } from "@/features/weather/get-weather";
import { SKY_LABELS } from "@/features/weather/sky";
import { WeatherRefresh } from "@/features/weather/weather-refresh";
import { Clock } from "./clock";
import { WeatherIcon } from "./weather-icon";

export async function WeatherClockLine() {
  const { sky, temperature } = await getWeather();

  return (
    <div
      style={{ viewTransitionName: "weather-line" }}
      className="halo flex flex-col items-end gap-x-8 gap-y-1 font-grotesk text-sm sm:flex-row sm:items-center"
    >
      <p className="flex items-center gap-2">
        <WeatherIcon sky={sky} />
        <span>
          {SKY_LABELS[sky]}
          {temperature !== null && ` ${temperature}°`}
        </span>
      </p>
      <Clock />
      <WeatherRefresh />
    </div>
  );
}
