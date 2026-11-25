# Spec: About

A room with a window. Reference: docs/design/about.png.

## Layout
- Shell as usual: house logo top left, weather/clock line top right, footer bottom right.
- Heading "Hi, I'm Maggie," in large Switzer bold.
- Paragraphs sit flush left at every width. (The frame zigzags them, every other one shifted right; with the tighter gaps that read as a formatting quirk rather than a rhythm.)
- Type: 16px body and 48px heading at every size from 640px; larger type on the widest screens felt too big. The text column stops growing at 40rem (from 1280px), so lines stay readable.
- Paragraphs are 1.5 times the text size apart at every width (24px at 16px text), not wider on desktop. From 1024px the copy starts lower than the window's top (4rem more space above the heading, 6rem from 1536px); the window stays put.
- Margins above phone size: 3rem at the sides from 640px, 4rem from 768px, and 10% on both sides from 1024px. On the widest screens (from 1536px) the text starts 20% in from the left, so text and window read as one composition instead of leaving a wide empty middle.
- The text column widens on wider screens (34rem, 40rem from 1280px, 46rem from 1536px, where the body text also steps up a size), so the copy doesn't sit in a narrow strip.
- The window sits on the right, beside the text.
- **Window size:** 14rem wide from 640px. On the widest screens (from 1536px) it's wider but not taller: the window's shape widens from 100 to 130 units (its height is 150; `wide` on `<Window>`), and its height stays 26.25rem, so the floor keeps its place and only the panes and their light on the floor get wider.
- **Phone:** the window is large (15rem) and sits top right, behind the heading and first paragraph. The text stays on top, with a page-colored halo (`halo`) so it reads over the clouds.

## Copy and links
- Copy lives in `content/` (see CLAUDE.md).
- Link phrases are Switzer bold and keep their square brackets on the page: `[a living library for screenshots]`.
- Punctuation right after a link or button phrase (`.`) rides inside it, in regular weight, so it never wraps onto a line by itself.
- Link targets:
  - [a living library for screenshots] → `/projects/overlook`
  - [a way to discover movies and decide what to watch] → `/projects/film-jousting`
  - [weather] → opens Look outside (see below).
  - [behind a camera] → `/photography`
  - [thinking about my next meal] → opens the food map (see below)
  - [a team I care about] → `mailto:maggiemshen@gmail.com`
- These are inline links, not doors: they don't swing (only big links do, see shell.md). They underline on hover, brackets included. Links to rooms switch pages without the camera walk: only door links walk into rooms. Phrases that open something on the page are buttons that wrap like the text around them (`InlineButton`: `role="button"`, focusable, Enter and Space), so a long phrase near a line's end doesn't jump whole to the next line and leave its paragraph looking narrower; they work by keyboard and screen reader.

## Food map
- Clicking or tapping [thinking about my next meal] opens the food map image as a card on the right side of the page, over the window area. From 1024px it starts where the window's column does, just after the copy (the grid's 3rem gap), and never runs past 3rem from the screen's right edge. Reference: docs/design/about-food-map.png.
- The image is a screenshot of Maggie's saved places on Google Maps (`public/about/food-map.png`, 938×1133). The card takes its shape: nearly the full width on a phone (1rem margins), 24rem from 640px and 28rem from 1024px; a blurred preview shows the instant it opens, and the image loads straight away. Its description is in `content/about.ts`, as is Google's credit, "Map data ©2026 Google", shown in the map's bottom-right corner where Google prints it: Google requires the credit next to the map and legible (not in the footer).
- Image file: `public/about/food-map.png`. Use a placeholder image until it's added.
- It's a popover. It fades in, stays 4 seconds, and fades out. Esc or a click or tap outside closes it at once.
- Closes on its own after a few seconds (start at 4, tuned in the browser).
- On a phone it opens centered on screen.

## Look outside
Clicking [weather] shows off the sky system: the window becomes a full-size view of the sky. With a mouse, clicking any window opens it too, on About and Projects alike (a pointer, and the glass brightens slightly on hover); on touch screens only [weather] does, since a tap on the window would trip it while reading or scrolling past. The view lives in the site shell (`LookOutsideProvider` in `SiteSky`), so every room's window can open it.
- The window's glass grows out of its spot into a big window (a view transition, `--outside-grow`, 0.5s), while the page fades under it. The big window keeps a margin of page around it (`--outside-x` 22vw at the sides, 1rem on a phone; `--outside-top` 7vh, 12vh on a phone; `--outside-bottom` 18vh, where the controls sit) and has a white frame (`--outside-frame`) with the small window's bevel and a soft shadow. Its sky is screen-sized, so clouds are their homepage size, and starts at the window's top so the window frames the whole cloud band. It opens on the homepage's own sky: the same clouds where they've drifted to, and stepping back round to today's weather returns to it. The view runs its own copy of that sky (`features/sky/sky-view.tsx`, built from the shared sky's seed at the shared sky's size), with drifting clouds, dots that scatter from the cursor or a finger, and rain or snow; it fades in as soon as it's built. Opening it starts loading all five weathers' cloud images, and every sky on the page shares the images already loaded (`preloadSkies` in `engine.ts`), so stepping to another weather only has to draw it. The room's own window sky keeps running underneath.
- A line under the window, in Space Grotesk: `← Live from New York: partly cloudy, 41° →`, with a smaller `Refresh · Close · More info` under it, the dots faint, set apart from the line. The arrows' clickable areas reach well past the glyphs (about 50×44px). The line is a fixed 30 characters wide so the arrows don't move as it changes, but never wider than the screen leaves room for both arrows; on the narrowest phones it wraps onto two lines instead of pushing the arrows off the edge, breaking only after "Live from New York:". The arrows, arrow keys and touch swipes step through the other four skies, named on their own (`← Snowy →`), starting from today's weather and wrapping both ways. Each change fades the old sky out and the new one in once built (`--sky-swap`). If building takes longer than half a second, a small spinner (a faint ring with a darker arc, round-ended) turns in the empty window until the new sky fades in. Refresh re-rolls the weather showing into a new arrangement of clouds, with the same fade. More info goes to the sky slides on the This site page (`/projects/this-site#sky`), closing the view; it takes over the history entry the view added, so Back from there returns to the room. On touch screens the view keeps a finger's drags for itself (pinch zoom still works), so swipes and the dots' scatter aren't cut short by the browser.
- Close, Esc or a click on the sky fades the view out (`--sky-swap`), and focus returns to [weather]. It doesn't shrink back into the window: on the way out, that was more motion than it earned. The browser's Back (button or swipe) closes it too and stays on About: opening adds a history entry for the same address, and closing any other way removes it.
- Reduced motion: it fades open instead of growing; the sky still moves.
- [weather] is an inline button, like the food map's. The view is a `<dialog>`; opening it focuses the dialog itself rather than its first arrow, so a mouse opening doesn't show a focus ring.
- Later: once the This site project page explains the system, the line gets a `how this sky works →` link.

## The window
- A shared `Window` component, also used on the Projects page.
- A four-pane window seen at an angle: it's turned on its vertical axis with its right side toward the viewer, so the right edge is taller and the top slopes up to the right, as if seen from near its foot. No frame is drawn: the panes sit on the wall itself, each shown sitting back by a faint shadow along its top and left edges (the bezel). A light ledge runs right under the glass, exactly as wide as the panes, so all of it sits in the window's light: just a top surface with no front edge, lighter than the wall because it catches the window's light (the wall mixed 40% toward white), and a faint soft shadow on the wall just under it (`SILL`), so it reads as a light shelf, not a built object. The glass is the homepage's off-white (`glass` token, `#fcfbf9`), so the sky through it looks like the homepage's. The wall is the site's usual off-white too; the Projects wall (once `#f9f7f2`) read too yellow here. Like Projects, About paints its wall as a layer behind the whole screen and sets its own page color to it. Look outside's big window keeps the homepage's page color behind its sky instead, so the full-size view matches the homepage.
- The angle, eye height and frame sizes are constants at the top of `components/window.tsx`; the bezel color is the `bevel` token, and the sill's is `sill`, a lit version of the page color, so it matches any wall the window is on.
- Through the panes you see the live NYC sky: the site's one shared sky, showing the part that's behind the window on screen (see sky.md). For it to show clouds, the window sits in the top part of the page.
- The sky through the panes isn't skewed by the angle: it's far away, so it looks the same as it would straight on, like a real window.
- A small `↑ Look out the window` sits under the window from 640px (Space Grotesk, extra small, 65% ink; `LookOutsideHint` in `components/look-outside-hint.tsx`). It's a button that opens Look outside, so it works on touch too, and it lies along the wall: sheared to the slope of the wall's level lines at its height (`wallSlant` in `components/window.tsx`). Hovering it lights the window as hovering the window does; the words don't change. On a phone, where the window sits behind the heading, it's left out.
- The clouds drift as usual. The window is view-only: the dots stay put under the cursor.

## Light on the floor
- The room has a floor a shade darker than the wall (`floor` theme token, `#eae9e7`, darkened for more contrast), so there's always contrast and the window's light can show on it in the page's white.
- The room is worked out in 3D with the same camera as the window (`components/window.tsx`): the window sits in a wall turned 24° (About passes `turn={24}`; 32°, the `TURN` default, made the floor's edge too steep), and the floor is level about two-thirds of a window-height below the window (`FLOOR`). The floor's edge is where that wall meets it, so it slopes with the wall's turn.
- The light is the window's four panes projected along the light onto the floor, then drawn in perspective, in the page color.
- It follows the same light as the homepage shadow (`useLiveLight` in `components/house.tsx`): the sun by day and the moon by night, bright in sun, faint under clouds and at night (`LIGHT_STRENGTH`), always there. On page load it fades in with the sky. Morning light throws it left, afternoon right.
- The patch is the true projection of the four panes along the light, so its length, lean and mullion lines match the window and the sun's angle. Stylized to stay in the room: it starts at the foot of the wall below the window (`LIGHT_START` 0, as if the window sat lower; shortening the whole projection instead squashed its shape), the light's height is held between 50° and 70° (`LIGHT_ALTITUDE`; lower, the patch runs off the page), and it always comes in through the window and at most so far sideways (`MIN_INWARD`, `MAX_SIDEWAYS`).
- On About only (`<Window floorLight>`), at every width.

## Done when
- On a phone the window sits behind the heading and first paragraph, and the text stays legible over it.
- The window shows the live sky for the current NYC weather.
- The floor light moves with the time of day, and with the moon at night.
- Every bracketed link and button is live:
  - the project and photography links underline on hover and walk into the right rooms
  - [thinking about my next meal] opens the food map, and it closes on its own after a few seconds
  - [a team I care about] opens a new email
  - [weather] shows in place, with its behavior still to come
