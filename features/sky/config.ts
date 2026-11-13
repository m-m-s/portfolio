import type { Sky } from "@/features/weather/sky";
import cloudy from "./config/cloudy.json";
import partlyCloudy from "./config/partly-cloudy.json";
import rainy from "./config/rainy.json";
import snowy from "./config/snowy.json";
import sunny from "./config/sunny.json";
import type { Band, Layer } from "./constants";

export type CloudSettings = {
  sizeMin: number;
  sizeMax: number;
  contrast: number;
  bright: number;
  light: number;
  height: Band[];
};

export type FarSettings = {
  size: number;
  shade: number;
  height: number;
  ink: number;
};

export type SkyConfig = {
  front: Record<string, CloudSettings>;
  mid: Record<string, CloudSettings>;
  far: Record<string, FarSettings>;
};

const DEF_CLOUD: CloudSettings = {
  sizeMin: 0.7,
  sizeMax: 1.45,
  contrast: 1,
  bright: 0,
  light: 0,
  height: ["high", "mid", "low"],
};
const DEF_FAR: FarSettings = { size: 1, shade: 1, height: 0, ink: 0 };

type RawConfig = {
  front?: Record<string, Partial<CloudSettings>>;
  mid?: Record<string, Partial<CloudSettings>>;
  far?: Record<string, Partial<FarSettings>>;
};

const RAW: Record<Sky, RawConfig> = {
  sunny: sunny as RawConfig,
  "partly-cloudy": partlyCloudy as RawConfig,
  cloudy: cloudy as RawConfig,
  rainy: rainy as RawConfig,
  snowy: snowy as RawConfig,
};

function withDefaults<T>(
  section: Record<string, Partial<T>> | undefined,
  defaults: T,
): Record<string, T> {
  return Object.fromEntries(
    Object.entries(section ?? {}).map(([id, v]) => [id, { ...defaults, ...v }]),
  );
}

export function configFor(sky: Sky): SkyConfig {
  const raw = RAW[sky];
  return {
    front: withDefaults(raw.front, DEF_CLOUD),
    mid: withDefaults(raw.mid, DEF_CLOUD),
    far: withDefaults(raw.far, DEF_FAR),
  };
}

export function cloudSettings(config: SkyConfig, layer: Layer, id: string) {
  return config[layer][id] ?? DEF_CLOUD;
}
