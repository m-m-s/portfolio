export const SKIES = [
  "sunny",
  "partly-cloudy",
  "cloudy",
  "rainy",
  "snowy",
] as const;

export type Sky = (typeof SKIES)[number];

export const SKY_LABELS: Record<Sky, string> = {
  sunny: "Sunny",
  "partly-cloudy": "Partly cloudy",
  cloudy: "Cloudy",
  rainy: "Rainy",
  snowy: "Snowy",
};

/** The condition's name for the weather line: a sunny sky at night is clear. */
export function conditionLabel(sky: Sky, night: boolean) {
  return night && sky === "sunny" ? "Clear" : SKY_LABELS[sky];
}

export function skyFromWeatherCode(code: number): Sky {
  if (code === 0 || code === 1) return "sunny";
  if (code === 2) return "partly-cloudy";
  if (code === 3 || code === 45 || code === 48) return "cloudy";
  if (
    (code >= 51 && code <= 57) ||
    (code >= 61 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  ) {
    return "rainy";
  }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return "snowy";
  return "sunny";
}
