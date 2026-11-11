# Spec: Site shell (DRAFT)

The shell is everything that wraps every page: the weather/clock line, the footer, door links, page transitions, and the stub pages for each route.

## Weather/clock line

Sits at the top of every page. Typeface: Space Grotesk regular.

**Layout, left to right:** weather icon · condition · temperature · time

Example: `[sun icon] Sunny 58°    06:10:37 PM ET`

**Weather**
- Condition uses the five sky names: Sunny, Partly cloudy, Cloudy, Rainy, Snowy (ids `sunny`, `partly-cloudy`, `cloudy`, `rainy`, `snowy`).
- Temperature in Fahrenheit, shown with the degree sign only (`58°`).
- Icons: one per sky. The set is still to be chosen, so use a simple placeholder icon until then.

**Time**
- New York time, 12-hour with seconds, leading zero on the hour, followed by `ET` (`06:10:37 PM ET`).
- Computed in the browser with `Intl` and the `America/New_York` time zone, ticking every second.
- The clock renders in the browser only, so the server's time never flashes on screen. Reserve its width on first render so the line doesn't shift when it appears.

**Weather data**
- A cached server function (`getWeather()` in `features/weather/`) fetches current weather for Manhattan (latitude 40.7831, longitude -73.9712) from Open-Meteo (`temperature_unit=fahrenheit`, current `temperature_2m` and `weather_code`). The weather is rendered into the page, so it's there on load.
- Caching: fresh for 15 minutes, refreshed in the background after that, discarded after 1 hour (the next visitor waits briefly for live weather). Nothing is fetched without visitors.
- A tab left open for an hour refreshes its data in place, only while the tab is visible.
- The same data feeds both this line and the homepage sky, from one fetch.
- If the fetch fails, the line and the sky both show Sunny (without a temperature). A failure is cached for only 5 minutes, so the next visit retries soon.

**Weather code → sky**

| Open-Meteo codes | Sky |
|---|---|
| 0, 1 (clear, mainly clear) | Sunny |
| 2 (partly cloudy) | Partly cloudy |
| 3 (overcast), 45, 48 (fog) | Cloudy |
| 51–57 (drizzle), 61–67 (rain, freezing rain), 80–82 (showers), 95–99 (thunderstorms) | Rainy |
| 71–77 (snow), 85–86 (snow showers) | Snowy |

**To revisit when the weather is finalized**
- Mainly clear (code 1) is grouped with Sunny for now. Maggie may try a version with a few wisps.
- Fog (45, 48) shows Cloudy for now. Maggie is deciding whether fog gets its own sky.

## Footer

Text links, written out: `Email   LinkedIn   GitHub`. Typeface: Space Grotesk regular.

- Email → `mailto:maggiemshen@gmail.com`
- LinkedIn → https://www.linkedin.com/in/shenmaggie/
- GitHub → https://github.com/m-m-s
- Appears bottom right on every page. On the three project pages it sits at the very end of the page.
- One footer component, placed the same way on every page that has it.

## Door links

A reusable `DoorLink` component for every big bold link (Switzer bold), on any page.

- **Click:** the link text swings open like a door, hinged on its left edge, outward toward the viewer. Only the text swings. The swing is smooth, not floppy (0.45s to start). The camera starts moving the instant the link is clicked, and the door swings open while the camera pushes in (full overlap, no pause). The door is a slab in the page color with the word on it, with some room around the letters (invisible at rest). It's cut from the page: behind it is the paper underneath, a shade darker and recessed with a soft shadow along the cut. The door casts a soft shadow.
- **Coming back:** the page you return to loads normally, with every door closed. No reverse swing.
- **Look:** styled the same as the text around it. On hover the word swings slightly ajar instead of underlining.
- **Idle swing (homepage):** the links take turns doing a small swing to invite a click, in reading order (Maggie Shen → Product Engineer → Photographer), looping. Each idle swing opens slowly (about 2s), lingers open for half a second, then drifts shut (about 2.5s). The first swing comes after 5 seconds of no activity (mouse, scroll, keys); after that, every 30 seconds while the visitor stays idle. Any activity restarts the wait. The cycle pauses while the visitor hovers a link or the tab is hidden.
- **Reduced motion:** the swing becomes a fade.

**House logo**
- The house logo goes home from every page, alongside the browser back button.
- It swings open like a door when clicked, using the same `DoorLink` motion.

## Page transitions

The camera walks up to, into and out of rooms. Built with the View Transitions API. Everything here is a starting point to test and tune in the browser.

- **Arriving at the homepage fresh** (typed URL, link from elsewhere, refresh): the intro text comes into view from far away, like walking up to a house.
- **Entering a room:** one continuous camera move from the click. The old page zooms forward gently while its door swings open, then it crossfades evenly into the new page, which keeps zooming the same way and slows into place. It should read as a single action, not one page leaving and then another arriving.
- **Going home from a room:** the same single move in reverse: the old page shrinks back slightly and crossfades into the homepage, which comes down to size the same way. This replaces the walk-up.
- **Going deeper** (Projects page → a project page): the same push forward, like stepping closer to one piece on the shelf. Coming back out pulls back the same way.
- **Duration:** about 0.8 seconds from the click, snappy rather than fadey: the door swings over 0.45s, and the pages crossfade quickly (0.2s, from 0.35s) while both keep zooming. Tuned in the browser.
- **Direction comes from page depth** (`/` is 0, rooms 1, project pages 2): deeper pushes in, shallower pulls back, same depth pushes in. This covers the browser's back and forward buttons too.
- **Back/forward** start at the top of the page instead of restoring the scroll position (the price of animating them). A phone's swipe-back gesture keeps the browser's own animation instead.
- The weather/clock line and footer stay still while the rest of the page moves.
- Timings are CSS variables in `app/globals.css` (`--door-swing`, `--camera`, `--walk-up`, `--door-nudge`).
- **Reduced motion:** a simple fade.

## To revisit: the doorway shows the room behind it
Shelved until the pages have real content (with stub pages, the room behind every door looks the same). The plan:
- Treat each page as a sheet lying on the next page, with the door cut out of it.
- **Hover and idle swing:** the doorway shows a screenshot of the destination page, pinned to the viewport (`background-attachment: fixed`), so the hole shows the part of the next page that sits at that spot. iPhone Safari ignores fixed backgrounds, so there it sits relative to the door instead.
- **Click:** no crossfade. The new page sits under the old one; the old page's snapshot gets a hole cut where the door was (a CSS `mask`), and it zooms toward the door until the hole fills the screen, so you walk through the doorway into the room. The new page grows slightly (0.9× to 1×) at a slower rate for depth. Going back out keeps the reverse move.
- **Screenshots:** an `npm run door-previews` script (Playwright) captures every page at desktop and phone sizes into `public/doors/`; rerun it when a page changes and commit the images.
- Watch for a small jump in the doorway at the click, where the still screenshot switches to the live page.

## Stub pages

Every route from CLAUDE.md exists from the start, with the shell around it and a placeholder heading (`[COPY: page name]`). That way the weather/clock line, footer, door links and transitions can be built and tested before any real page content exists.

## Film Jousting wake-up

- On the first page load of a visit, the browser sends one request to Film Jousting's backend to wake it from Render's sleep.
- It runs quietly in the background: the site's own loading never waits on it, and nothing shows if it fails.
- Call `GET https://filmjousting.onrender.com/api/health` (the same health route Film Jousting's own frontend calls on load). The server allows requests from any origin, so it works from maggiemshen.com as is.

## Done when
- Every route loads inside the shell, on phone and desktop.
- The clock ticks in New York time, and the weather line shows live NYC weather (or Sunny if the fetch fails).
- The footer shows on the right pages, and its links work.
- Every door link and the house logo swing open, and the homepage idle swing cycles through the three links.
- Transitions play: walk-up on a fresh homepage visit, push forward into rooms and deeper, pull back out, each as one smooth move.
- Reduced motion turns the swings and transitions into fades.
