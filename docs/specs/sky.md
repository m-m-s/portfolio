# Spec: Sky

The live NYC weather sky behind the homepage: dithered clouds made of dots that drift across the page and scatter when you touch them. It's also seen through the window on the About and Projects pages. The house's reveal and shadow are in homepage.md.

## Source material (in this repo)
- `docs/reference/mock-snowy.html`: the finished mock. It holds the whole engine and every weather's tables (cloud counts, ink colors, layer physics, rain and snow). **This is the source of truth for behavior.** Port its behavior as is.
- `docs/reference/mock-rainy.html`: the Rainy mock, for comparing the rain.
- `features/sky/config/*.json`: the tuned cloud picks and settings, one file per weather. A cloud's `mirror` (optional, off when missing) draws every copy of it in that layer flipped; only Sunny reads it so far.
- `public/sky/clouds/`: 31 grayscale cloud cutouts, used in the middle and front layers.
- `public/sky/strips/`: 11 distant cloud strips, used in the far layer. These are already dot images.
- The mock loads images from `s/src/` and `s/far/`. Those are the same files under their new folder names.

The mock page also contains editing controls (cloud picker, sliders, saving to a database). Only the sky itself gets ported.

## Structure
- Lives in `features/sky/`. The weather ids are `sunny | partly-cloudy | cloudy | rainy | snowy`. The mock calls Partly cloudy `partly`; use `partly-cloudy` throughout.
- **One sky for the whole site.** It lives in the shell, behind every page, and is built once per visit. It keeps drifting while you move between rooms and is never rebuilt by a page change. A new visit gets a new layout. A weather change (the shell's hourly refresh) rebuilds it with the same seed.
- The weather comes from the same `getWeather()` as the weather/clock line, so the sky and the line always agree. If the fetch fails, both show Sunny.
- What each page shows:
  - **Home:** the whole sky. Dots and drops react to the cursor or finger. The homepage doesn't scroll, so it keeps a finger's drags for the sky (`touch-action: pinch-zoom` on the body while the full sky shows): otherwise the browser takes a moving finger over to pan the page and the dots stop following it. Pinch zoom still works.
  - **About and Projects:** the sky is hidden except through the window (`components/window.tsx`). It's the homepage's sky itself, the same clouds at the same size and drifting on: the window shows the part of it behind the window on screen, and moving between Home and a room never rebuilds it. View-only: nothing reacts to the cursor.
  - **Pages without a window:** the sky is hidden and stops drawing. When it shows again, the clouds have drifted on as if it had kept going.
- In page transitions the sky stays still, since it's far away, and fades in step with the rooms (see shell.md).
- `/lab` runs its own copy of the sky, from the same engine, with weather, seed and cloud size switches. The shared sky stays hidden there. The site's code has no hooks for the lab: the lab builds on it from outside. It is for development only: it exists on the dev server and returns a 404 in production builds.

## Layers
- **Far:** one distant strip per visit, picked at random from that weather's far list. It drifts the same way as the clouds at a third of the middle layer's speed, and its dots stir for the cursor or a finger more faintly than any cloud's: a smaller reach, a weaker push, slower dots (`FAR_LAYER`). (It used to stay still, which read as broken on a phone, where the strip spans most of the screen.) It tiles across the screen with each side thinned out over a quarter of its width (`FAR_SIDE_FADE`) and the tiles overlapping by that much, so the joins crossfade instead of showing a seam. (The mock mirrors every other tile instead, which left a dip and a hump at each join on wide screens.)
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
- The rules below hold for every weather except Sunny, which has its own (see Sunny, below).
- Each copy gets a random size between its Smallest and Largest, a random base height inside its ticked height bands, and is mirrored half the time. Two copies of the same cloud are kept well apart (`SAME_CLOUD_ROOM`, 2.5 mean cloud widths between centres, against 0.75 for other pairs): side by side, one usually mirrored, they read as a symmetric pair.
- Partly cloudy also spreads each layer's heights (one value per equal slice of the range, random within it, slices shuffled, so a small layer can't land all high) and caps large clouds: a cloud whose Smallest–Largest midpoint is 175% or more appears at most twice per layer. If the hand runs out of allowed clouds the layer draws from the whole list; if every cloud is capped it draws fewer. Both are per-weather settings (`PLACEMENT`).
- Spacing: each layer places its biggest clouds first, each into the most open stretch of sky (best of a few random tries). Smaller ones fill the gaps, with up to about a quarter overlap (`CLOUD_ROOM`). Front and middle are spaced separately, so they overlap each other for depth, with one exception: no stacking while the rest of the sky is empty. A front cloud that would open the sky stacked on a middle one (more than `CLOUD_ROOM` allows, across and up and down) moves to the best-spaced open stretch of the screen among a few random spots (`MOVE_TRIES`). With none open (a full sky, or a phone's narrow one) it stays where it was. Clouds off screen keep their places, so as many clouds show as before.

### Sunny
From the Sunny mock (24 Nov 2026). The loose placement is `LOOSE` in `constants.ts`, switched on by `loose` in `PLACEMENT`.
- **Count:** middle 3, front 2, grown for wide screens like every weather; middle is built first.
- **Loop:** each layer wraps over the screen width plus its widest cloud.
- **Across:** each cloud starts anywhere on the screen. No spacing inside a layer: clouds may bunch, touch and overlap.
- **Shapes:** each layer shuffles its picks and takes a hand of max(2, half its count rounded up), drawing at random from the hand. A shape shows at most twice in a layer and at most twice in the whole sky; front and middle may share one. A second copy in a layer is only drawn if the shape's size range can make it at least 25% wider or narrower than the first. With nothing in the hand allowed, the layer draws from any allowed pick, else draws fewer.
- **Sizes:** a shape's size range is split into as many equal slices as the layer has clouds; each copy takes a different slice and lands in its middle half. Copies of a shape differ in drawn width by at least 25% in a layer and 12% across layers: up to 12 re-rolls in the slice, then 12 anywhere in the range, then whichever end of the range is farthest from the other copies.
- **Heights:** one height per equal slice of the layer's range, random within it. Shapes with two copies go first, and slices are dealt 0, h, 1, h+1, … (h is half the count, rounded up), reversed on a coin flip, so two copies sit half the range apart.
- **Mirroring:** none at random. A cloud set to `mirror` in a layer's config is drawn flipped in that layer.
- **No stacking at load:** a front cloud may overlap a middle one by up to 30% of the smaller box, checked now and 5s on. The front layer first tries 96 offsets along its loop and keeps the least stacked; any front cloud still stacked then tries 64 spots across the screen, scored by its stacking plus 10× any overlap with another front cloud beyond a quarter of the smaller width, over its own width. After load, layers drift across each other freely.
- Height bands are fractions of the sky's height (`TOP`, `BOT`, `BASE` in the mock). Cloudy, Rainy and Snowy have a fourth band, Lowest. Unlike the mock, which adds Lowest below the other three, all weathers fit their bands between the same `TOP` and `BOT`, so with four bands each one is thinner and the lowest clouds stop at the same depth as in Sunny. The taller sky had dropped them too low. The far strips were raised to match, in their config Heights: Cloudy, Rainy and Snowy from −0.5 to −0.2 (the same squeeze applied to the strip's bottom edge), and the low Sunny strip by 0.2. Partly cloudy's strips keep the mock's heights.

## Size
- The canvas covers the full screen height; the sky is its top 40% (`SKY_FRACTION`). Clouds in the lower bands, and rain and snow, hang below it.
- Cloud sizes are the mock's (front 300px, middle 220px, times each cloud's size range) at every screen size, except on phones (narrower than 640px, `PHONE_WIDTH`), where a per-weather scale applies (`PHONE_CLOUD_SCALE`): 100% for Sunny and Partly cloudy, 80% for Cloudy, Rainy and Snowy. Resizing across 640px rebuilds the sky at the other size. A taller sky gives the same clouds more room: the height bands scale with the sky, the clouds don't.
- Bigger screens grow the sky, treating a 1440×900 window (`REFERENCE`) as 100%; smaller ones keep the tuned sizes, and phones keep their own scale.
  - **Far strip:** grows with the screen's height alone (1.42× on a 1280px-tall screen), so its top sits at the same share of the sky as at 1440×900. It's anchored by its bottom, so growing any faster lifted it toward the top of the screen.
  - **Clouds:** grow by a blend of the screen's height and width, weighted by `WIDE_WEIGHT` (0.5: the geometric mean, 1.59× on 2560×1280). Height alone left them small on a wide screen; width alone (2.06× at 2560) made them too tall for the sky and crowded the top. Each cloud is still dithered fresh at its final size.
  - **Count:** the grown clouds don't cover all the extra width, so the count scales by the width left over (`fill`: 12% more clouds on 2560×1280), keeping the spacing as tuned.

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
