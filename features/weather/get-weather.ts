import { cacheLife } from "next/cache";
import { MANHATTAN } from "./nyc";
import { type Sky, skyFromWeatherCode } from "./sky";

export type Weather = {
  sky: Sky;
  temperature: number | null;
};

const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast" +
  `?latitude=${MANHATTAN.latitude}&longitude=${MANHATTAN.longitude}` +
  "&current=temperature_2m,weather_code&temperature_unit=fahrenheit";

export async function getWeather(): Promise<Weather> {
  "use cache";

  try {
    const response = await fetch(OPEN_METEO_URL, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);

    const data = (await response.json()) as {
      current?: { temperature_2m?: unknown; weather_code?: unknown };
    };
    const temperature = data.current?.temperature_2m;
    const code = data.current?.weather_code;
    if (typeof temperature !== "number" || typeof code !== "number") {
      throw new Error("Open-Meteo returned an unexpected shape");
    }

    cacheLife({ stale: 900, revalidate: 900, expire: 3600 });
    return {
      sky: skyFromWeatherCode(code),
      temperature: Math.round(temperature),
    };
  } catch (error) {
    console.error("Weather fetch failed, showing sunny:", error);
    // An expire under 5 minutes would stop pages being served as static files.
    cacheLife({ stale: 60, revalidate: 60, expire: 300 });
    return { sky: "sunny", temperature: null };
  }
}
