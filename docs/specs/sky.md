# Spec: Sky

The live NYC weather sky behind the homepage: dithered clouds made of dots that drift across the page and scatter when you touch them. It's also seen through the window on the About and Projects pages. The house's reveal and shadow are in homepage.md.

## Source material (in this repo)
- `docs/reference/mock-snowy.html`: the finished mock. It holds the whole engine and every weather's tables (cloud counts, ink colors, layer physics, rain and snow). **This is the source of truth for behavior.** Port its behavior as is.
- `docs/reference/mock-rainy.html`: the Rainy mock, for comparing the rain.
- `features/sky/config/*.json`: the tuned cloud picks and settings, one file per weather.
- `public/sky/clouds/`: 31 grayscale cloud cutouts, used in the middle and front layers.
- `public/sky/strips/`: 11 distant cloud strips, used in the far layer. These are already dot images.
- The mock loads images from `s/src/` and `s/far/`. Those are the same files under their new folder names.

The mock page also contains editing controls (cloud picker, sliders, saving to a database). Only the sky itself gets ported.

## Structure
- Lives in `features/sky/`. The weather ids are `sunny | partly-cloudy | cloudy | rainy | snowy`. The mock calls Partly cloudy `partly`; use `partly-cloudy` throughout.
- **One sky for the whole site.** It lives in the shell, behind every page, and is built once per visit. It keeps drifting while you move between rooms and is never rebuilt by a page change. A new visit gets a new layout. A weather change (the shell's hourly refresh) rebuilds it with the same seed.
- The weather comes from the same `getWeather()` as the weather/clock line, so the sky and the line always agree. If the fetch fails, both show Sunny.
- What each page shows:
  - **Home:** the whole sky. Dots and drops react to the cursor or finger.
  - **About and Projects:** the sky is hidden except through the window (`components/window.tsx`). Its clouds are drawn at half size there, and at a quarter on a phone, where the window is smaller (`WINDOW_CLOUD_SCALE`), so a few fit in the panes; the sky rebuilds at the new size when you move between Home and a window page. Each frame, the window copies the part of the sky that is behind it on screen, so it shows exactly the clouds that would be there on Home. View-only: nothing reacts to the cursor.
  - **Pages without a window:** the sky is hidden and stops drawing. When it shows again, the clouds have drifted on as if it had kept going.
- In page transitions the sky stays still, since it's far away, and fades in step with the rooms (see shell.md).
- `/lab` runs its own copy of the sky, from the same engine, with weather, seed and cloud size switches, plus the house shadow panel. The shared sky stays hidden there. The site's code has no hooks for the lab: the lab builds on it from outside. It is for development only: it exists on the dev server and returns a 404 in production builds.

## Layers
- **Far:** one distant strip per visit, picked at random from that weather's far list. It stays still.
- Far strip settings (from the config): Size; Shade, which thickens or thins the dots; Ink, which darkens the dot color from the far grey toward the front ink; and Height, a number that shifts the strip up or down as a fraction of the sky's height.
- **Middle:** clouds drift slowly. Dots respond gently to the cursor and settle back slowly, which reads as distance.
- **Front:** clouds drift faster. Dots scatter from the cursor or finger and spring back. Soft and fluffy is the feel.
- Physics values per layer are in the mock (`LAYER`).

## Dithering
- Floyd–Steinberg, applied to each cloud at its final pixel size, so the dots stay crisp.
- Per-cloud settings from the config: contrast, brightness, and Lighter (a midtone lift before dithering).
- Each layer has its own ink color per weather (`INK` in the mock): farther is lighter, nearer is darker.
- The sky re-dithers once a resize finishes.

## Composition (every visit is different)
- Seed the random layout with a new random value on each visit. When porting, replace the mock's fixed seed (`seed=11`, `layoutSeed=11`).
- Each weather has a pool of clouds per layer (the config). Every visit composes a fresh sky from it.
- Cloud count per weather (middle / front): Sunny 3 / 2, Partly cloudy 5 / 3, Cloudy, Rainy and Snowy 12 / 7.
- Each copy gets a random size between its Smallest and Largest, a random base height inside its ticked height bands, and is mirrored half the time.
- Spacing: each layer places its biggest clouds first, each into the most open stretch of sky (best of a few random tries). Smaller ones fill the gaps, with up to about a quarter overlap. Front and middle are spaced separately, so they overlap each other for depth.
- Height bands are fractions of the sky's height (`TOP`, `BOT`, `BASE` in the mock). Cloudy, Rainy and Snowy have a fourth band, Lowest. Unlike the mock, which adds Lowest below the other three, all weathers fit their bands between the same `TOP` and `BOT`, so with four bands each one is thinner and the lowest clouds stop at the same depth as in Sunny. The taller sky had dropped them too low. The far strips were raised to match, in their config Heights: Cloudy, Rainy and Snowy from −0.5 to −0.2 (the same squeeze applied to the strip's bottom edge), the low Sunny strip by 0.2 and both Partly cloudy strips by 0.3.

## Size
- The canvas covers the full screen height; the sky is its top 40% (`SKY_FRACTION`), tuned in `/lab` on phone and laptop. Clouds in the lower bands, and rain and snow, hang below it.
- Cloud sizes are the mock's (front 300px, middle 220px, times each cloud's size range) at every screen size, except on phones (narrower than 640px, `PHONE_WIDTH`), where a per-weather scale applies (`PHONE_CLOUD_SCALE`): 100% for Sunny and Partly cloudy, 80% for Cloudy, Rainy and Snowy. Resizing across 640px rebuilds the sky at the other size. A taller sky gives the same clouds more room: the height bands scale with the sky, the clouds don't. `/lab` has a Clouds switch (the weather's own scale, or 100/80/65/50%, or `?scale=0.65`) to compare sizes.

## Rain and snow
- Rain and snow fall from the underside of each front and middle cloud and drift with it, plus a sparse distant fall from the far strip.
- Rain: each drop starts as a dot and stretches into a short streak.
- Snow: flakes sway side to side as they fall slowly.
- The cursor pushes nearby drops and flakes aside, hardest in front.
- Speeds, sizes, colors and reach are all in the mock.

## Performance
- One animation loop (`requestAnimationFrame`), paused when the tab is hidden or nothing on the page shows the sky.
- Dither once per cloud and size, then reuse.
- **Loading:** the first visit's sky builds behind the homepage walk-up, then fades in (`--sky-fade`). The weather/clock line, the footer, the house shadow and the window light fade in with it (the `with-sky` class, switched on by `data-sky-ready` on the page), so everything live arrives together. It builds one cloud at a time and hands control back to the page between clouds, so the clock and doors keep responding on a slow phone. With the CPU slowed 4×, the sky is ready about 4.4s after the page starts loading, and the page is never blocked for more than about 0.4s at a time.
- Check it stays smooth on a mid-range phone in `/lab`.

## Reduced motion
- The sky keeps moving as normal: drift, dot scatter, rain and snow. The mock freezes all of these for reduced motion; leave that out when porting.

## Accessibility
- The canvas is decorative (`aria-hidden`).

## Done when
- `/lab` shows all five weathers, each looking like its mock.
- Dots scatter and spring back on desktop (cursor) and phone (finger).
- The sky looks right at 40% height on a phone and a laptop, with clouds scaled to fit.
- It stays smooth on a phone, and pauses when the tab is hidden.
