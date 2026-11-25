import { getWeather } from "@/features/weather/get-weather";
import { WeatherRefresh } from "@/features/weather/weather-refresh";
import { Clock } from "./clock";
import { WeatherCondition } from "./weather-condition";

export async function WeatherClockLine() {
  const { sky, temperature } = await getWeather();

  return (
    <div className="[view-transition-name:weather-line] with-sky halo flex flex-col items-end gap-x-8 gap-y-1 font-grotesk text-sm sm:flex-row sm:items-center 2xl:text-base">
      <WeatherCondition sky={sky} temperature={temperature} />
      <Clock />
      <WeatherRefresh />
    </div>
  );
}
