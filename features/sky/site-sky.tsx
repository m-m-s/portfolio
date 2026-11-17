import { getWeather } from "@/features/weather/get-weather";
import { SkyProvider } from "./sky-provider";
import { LookOutsideProvider } from "./sky-view";

export async function SiteSky({ children }: { children: React.ReactNode }) {
  const weather = await getWeather();
  return (
    <SkyProvider weather={weather.sky}>
      <LookOutsideProvider live={weather}>{children}</LookOutsideProvider>
    </SkyProvider>
  );
}
