# Spec: Homepage

The front of the house. A short intro stacked into the shape of a house, standing under the live NYC sky.

## Layout (see docs/design/homepage.png)
- Off-white page, the shell's weather/clock line at the top right, the footer at the bottom right.
- The sky covers the top part of the page (see sky.md).
- The intro sits left of center, below the sky. The free space around it is split by the golden ratio: 38.2% to the left and 61.8% to the right, and vertically φ² to 1 (about 72% above, 28% below), which sits the house low on the page like it's standing on the ground. The split is of the whole screen, header included. Tuned with `--house-above` and `--house-below`.
- The house logo appears on every page except the homepage, since the homepage is already home.

## The intro
Copy lives in `content/` (see CLAUDE.md). Current copy:

```
Hi, I'm
Maggie Shen, a
Product Engineer
and Photographer
in New York City !
```

- Five fixed lines. The short first line is the house's chimney.
- Link words (Maggie Shen, Product Engineer, Photographer) are Switzer bold. The connecting words are Space Grotesk regular.
- Links: Maggie Shen → `/about`, Product Engineer → `/projects`, Photographer → `/photography`. All three are `DoorLink`s (see shell.md).
- "Product Engineer" stays on one line at every screen width. The intro's text size (`--text-intro`) shrinks with the screen so the widest line and the house's padding always fit, up to 3rem.
- The text stays real, selectable, readable text.

## The house
- A house-shaped panel sits behind the intro, filled with the page's background color. The outline (see docs/design/homepage-house.png):
  - the chimney: a small box around "Hi, I'm"
  - the body: a box around the other four lines, with its top-right corner cut at an angle to form the roof, sloping down to the right edge (exact shape in the reference image)
- The panel is drawn in front of the sky. When clouds and their dots drift behind it, they disappear inside the house shape, and the house shows as a clear shape against the sky. With an empty sky behind it, the house is invisible.
- The outline is built from the text's own size and position, so it fits the intro at every screen width: the chimney around line 1, the body around lines 2–5 as wide as the widest line, and the roof cut from just past the end of line 2 down to the right edge at the foot of line 3. The padding around the text is `--house-pad` above and below and `--house-pad-x` at the sides (both in em), so the house is wider than the text. It's re-measured when the text changes size.
- Drawn as an SVG polygon (`components/house.tsx`) behind the text; the shadow reuses the same polygon.

## The shadow

The shadow is on the homepage around the clock: the sun casts it by day and the moon by night. It's tuned in `/lab` (Shadow panel: time of day, length, steepness, strength, moonlight, blur); the defaults live in `SHADOW_TUNING` in `components/house.tsx`.

- The house casts a soft gray shadow onto the page, from the same outline. The house has no drawn outline: the shadow is what gives it its shape.
- It follows the sun in New York through the day:
  - **Direction:** morning shadow falls to the left and evening shadow to the right, as if you are facing north at a south-facing house.
  - **Length:** longest near sunrise and sunset, shortest around midday.
- **Night:** from sunset to sunrise the moon casts the shadow instead, the same way. It's fainter than the sun's (`moonlight`, a share of the sun's strength) and a little fainter again when less of the moon is lit.
- The shadow is stylized so it's always visible: it always falls behind the house (up the page), it's always at least 60% of the house's height (`MIN_REACH`; a shorter shadow hides behind the house), and a moon below the horizon still casts it, as if it were that far above.
- Sun and moon positions come from the time and NYC's coordinates, calculated in the browser (`features/weather/sun-and-moon.ts`, the standard low-precision formulas, good to about 1°). The shadow is the house outline slanted and stretched. The slant comes only from the light's direction (east–west against north–south, weighted by steepness), capped at 40° (`MAX_LEAN`). The stretch comes only from how low the light is, times the length. So changing the length never changes the angle.
- The shadow updates once a minute, so the movement is too slow to notice while watching. It's computed after the page loads, so it appears just after the house.
- **Weather:** a shadow in every weather, rain and snow included. Clouds soften the light: Sunny gives the darkest, sharpest shadow, Partly cloudy a little softer, and Cloudy, Rainy and Snowy a faint, blurry one (`WEATHER_LIGHT` in `components/house.tsx` multiplies the tuning's strength and blur). It follows the sky's weather; `/lab` casts its own shadow from its weather buttons.

## Load
- A fresh visit plays the walk-up: the house comes into view from far away (see shell.md).
- The idle door swings start 10 seconds after the page opens (see shell.md).

## Done when
- The intro keeps its five lines and house shape from a small phone to a wide screen, with "Product Engineer" on one line.
- Clouds disappear behind the house shape as they drift past, revealing it.
- The shadow points and stretches the right way for the current NYC time.
- The three links swing open into their rooms.
