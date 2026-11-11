# Spec: Sky (DRAFT)

The live NYC weather sky behind the homepage: dithered clouds made of dots that drift across the page and scatter when you touch them. It's also seen through the window on the About page.

## Source material (in this repo)
- `docs/reference/mock-snowy.html`: the finished mock. It holds the whole engine and every weather's tables (cloud counts, ink colors, layer physics, rain and snow). **This is the source of truth for behavior.** Port its behavior as is.
- `docs/reference/mock-rainy.html`: the Rainy mock, for comparing the rain.
- `features/sky/config/*.json`: Maggie's tuned cloud picks and settings, one file per weather, exported from the mocks.
- `public/sky/clouds/`: 31 grayscale cloud cutouts, used in the middle and front layers.
- `public/sky/strips/`: 11 distant cloud strips, used in the far layer. These are already dot images.
- The mock loads images from `s/src/` and `s/far/`. Those are the same files under their new folder names.

The mock page also contains editing controls (cloud picker, sliders, saving to a database). Only the sky itself gets ported.

## Structure
- Lives in `features/sky/`, as a client-only canvas component that takes one prop: the weather (`sunny | partly-cloudy | cloudy | rainy | snowy`). The mock calls Partly cloudy `partly`; use `partly-cloudy` throughout.
- Built and tuned on a private `/lab` page first, with a switch for all five weathers, before it goes on the homepage.
- The weather comes from the shell's weather route, so the sky and the weather/clock line always agree.

## Layers
- **Far:** one distant strip per visit, picked at random from that weather's far list. It stays still, as in the mock. **[CONFIRM with Maggie: still, or a very slow drift?]**
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
- The mock starts from a fixed random seed so it looks the same while editing. The site seeds randomly on each visit.
- Each weather has a pool of clouds per layer (the config). Every visit composes a fresh sky from it.
- Cloud count per weather (middle / front): Sunny 3 / 2, Partly cloudy 5 / 3, Cloudy, Rainy and Snowy 12 / 7.
- Each copy gets a random size between its Smallest and Largest, a random base height inside its ticked height bands, and is mirrored half the time.
- Spacing: each layer places its biggest clouds first, each into the most open stretch of sky (best of a few random tries). Smaller ones fill the gaps, with up to about a quarter overlap. Front and middle are spaced separately, so they overlap each other for depth.
- Height bands are fractions of the sky's height (`TOP`, `BOT`, `BASE` in the mock). Cloudy, Rainy and Snowy have a fourth band, Lowest, which reaches down over the intro text.

## Size
- Sky height: 40% of the screen height to start, tuned in `/lab` on phone and laptop.
- Cloud size scales with the sky's height. The mock's fixed widths (front 300px, middle 220px) were tuned on a laptop, so use them as the laptop reference and scale from there.

## Rain and snow
- Rain and snow fall from the underside of each front and middle cloud and drift with it, plus a sparse distant fall from the far strip.
- Rain: each drop starts as a dot and stretches into a short streak.
- Snow: flakes sway side to side as they fall slowly.
- The cursor pushes nearby drops and flakes aside, hardest in front.
- Speeds, sizes, colors and reach are all in the mock.

## Performance
- One animation loop (`requestAnimationFrame`), paused when the tab is hidden.
- Dither once per cloud and size, then reuse.
- Check it stays smooth on a mid-range phone in `/lab`.

## Reduced motion
- The sky keeps moving as normal, rain and snow included (decided in CLAUDE.md). This differs from the mock, which switches rain and snow off for reduced motion.

## Accessibility
- The canvas is decorative (`aria-hidden`).

## To revisit
- Rainy and Snowy currently use the same cloud picks as Cloudy. Their own ink colors make them look different. Maggie may tune them separately later.
- Fog: Maggie is deciding whether it gets its own sky.
- Homepage-specific behavior (the house text appearing as clouds pass behind it, the moving shadow) goes in the homepage spec.

## Done when
- `/lab` shows all five weathers, each looking like its mock.
- Dots scatter and spring back on desktop (cursor) and phone (finger).
- The sky looks right at 40% height on a phone and a laptop, with clouds scaled to fit.
- It stays smooth on a phone, and pauses when the tab is hidden.
