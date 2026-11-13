import { getWeather } from "@/features/weather/get-weather";
import { SkyProvider } from "./sky-provider";

export async function SiteSky({ children }: { children: React.ReactNode }) {
  const { sky } = await getWeather();
  return <SkyProvider weather={sky}>{children}</SkyProvider>;
}
