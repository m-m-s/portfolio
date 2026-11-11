# Spec: Homepage

The front of the house. A short intro stacked into the shape of a house, standing under the live NYC sky.

## Layout (see docs/design/homepage.png)
- Off-white page, the shell's weather/clock line at the top right, the footer at the bottom right.
- The sky covers the top part of the page (see sky.md).
- The intro sits left of center, below the sky.
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
- "Product Engineer" stays on one line at every screen width. The intro's text size scales with the screen width to keep the shape.
- The text stays real, selectable, readable text.

## The house
- A house-shaped panel sits behind the intro, filled with the page's background color. The outline (see docs/design/homepage-house.png):
  - the chimney: a small box around "Hi, I'm"
  - the body: a box around the other four lines, with its top-right corner cut at an angle to form the roof, sloping down to the right edge (exact shape in the reference image)
- The panel is drawn in front of the sky. When clouds and their dots drift behind it, they disappear inside the house shape, and the house shows as a clear shape against the sky. With an empty sky behind it, the house is invisible.
- The outline is built from the text's own size and position, so it fits the intro at every screen width.

## The shadow
- The house casts a soft gray shadow onto the page, from the same outline.
- It follows the sun in New York through the day:
  - **Direction:** morning shadow falls to the left and evening shadow to the right, as if you are facing north at a south-facing house.
  - **Length:** longest near sunrise and sunset, shortest around midday.
- Sun position comes from the time and NYC's coordinates, calculated in the browser.
- The shadow updates slowly with the clock, so the movement is too slow to notice while watching.
- **Weather:** crisp on sunny days, fainter on partly cloudy, faint or gone on cloudy, rainy and snowy. A starting point to test in `/lab`.
- **Night:** no shadow between sunset and sunrise.

## Load
- A fresh visit plays the walk-up: the house comes into view from far away (see shell.md).
- The idle door swings start 5 seconds after the page opens (see shell.md).

## Done when
- The intro keeps its five lines and house shape from a small phone to a wide screen, with "Product Engineer" on one line.
- Clouds disappear behind the house shape as they drift past, revealing it.
- The shadow points and stretches the right way for the current NYC time.
- The three links swing open into their rooms.
