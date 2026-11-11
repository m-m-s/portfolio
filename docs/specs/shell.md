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
- A Next.js server route fetches current weather for Manhattan (latitude 40.7831, longitude -73.9712) from Open-Meteo (`temperature_unit=fahrenheit`, current `temperature_2m` and `weather_code`), cached for 15 minutes.
- The same data feeds both this line and the homepage sky, from one fetch.
- If the fetch fails, the line and the sky both show Sunny.

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
- Appears on the homepage, About, Projects and Photography. The three project pages get it once Maggie's Figma mock settles where it sits.
- One footer component, placed the same way on every page that has it.

## Door links

A reusable `DoorLink` component for every big bold link (Switzer bold), on any page.

- **Click:** the link text swings open like a door, hinged on its left edge. Only the text swings. The swing is fast. Then the page transition takes over.
- **Back:** returning to the page plays the swing in reverse.
- **Look:** styled the same as the text around it, with an underline on hover.
- **Idle swing (homepage):** the links take turns doing a small swing to invite a click. 5 seconds after the page opens, the first link swings; 5 seconds later the next one; and so on in reading order (Maggie Shen → Product Engineer → Photographer), looping for as long as the page is open. The cycle pauses while the visitor hovers a link.
- **Reduced motion:** the swing becomes a fade.

**House logo**
- The house logo goes home from every page, alongside the browser back button.
- It swings open like a door when clicked, using the same `DoorLink` motion.

## Page transitions

The camera walks up to, into and out of rooms. Built with the View Transitions API. Everything here is a starting point to test and tune in the browser.

- **Arriving at the homepage fresh** (typed URL, link from elsewhere, refresh): the intro text comes into view from far away, like walking up to a house.
- **Entering a room:** after the door swings, the camera pushes forward through the doorway. The new page grows from small and far to full size.
- **Going home from a room:** the camera pulls back out of the room until the house is in view. This replaces the walk-up.
- **Going deeper** (Projects page → a project page): the same push forward, like stepping closer to one piece on the shelf. Coming back out pulls back the same way.
- **Duration:** 2 seconds in total, door swing included. Cinematic but gentle, tuned in the browser.
- **Reduced motion:** a simple fade.

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
- Transitions play: walk-up on a fresh homepage visit, push forward into rooms and deeper, pull back out, 2 seconds total.
- Reduced motion turns the swings and transitions into fades.
