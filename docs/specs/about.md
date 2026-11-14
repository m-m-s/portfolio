# Spec: About

A room with a window. Reference: docs/design/about.png.

## Layout
- Shell as usual: house logo top left, weather/clock line top right, footer bottom right.
- Heading "Hi, I'm Maggie," in large Switzer bold.
- On wide screens (from 1280px), paragraphs zigzag down the page as in the frame: every other one is shifted right, keeping its full width, so it ends further right than the flush ones. Shifted but not widened, an indent just looks like a narrower paragraph. On smaller screens there's no room to shift, so they sit flush left.
- The text column widens on wider screens (34rem, 40rem from 1280px, 46rem from 1536px, where the body text also steps up a size), so the copy doesn't sit in a narrow strip.
- The window sits on the right, beside the text.
- **Phone:** the window is large (15rem) and sits top right, behind the heading and first paragraph. The text stays on top, with a page-colored halo (`halo`) so it reads over the clouds.

## Copy and links
- Copy lives in `content/` (see CLAUDE.md).
- Link phrases are Switzer bold and keep their square brackets on the page: `[a living library for screenshots]`.
- Punctuation right after the food-map button (`.`) rides inside it, in regular weight, so it never wraps onto a line by itself (a button can't share a wrapped line with the text after it).
- Link targets:
  - [a living library for screenshots] → `/projects/overlook`
  - [a way to discover movies and decide what to watch] → `/projects/film-jousting`
  - [weather] → styled like the other bracketed phrases. Its behavior comes later.
  - [behind a camera] → `/photography`
  - [thinking about my next meal] → opens the food map (see below)
  - [a team I care about] → `mailto:maggiemshen@gmail.com`
- These are inline links, not doors: they don't swing (only big links do, see shell.md). They underline on hover, brackets included. Links to rooms still get the camera walk into the room (`RoomLink`). Phrases that open something on the page are buttons, so they work by keyboard and screen reader.

## Food map
- Clicking or tapping [thinking about my next meal] opens the food map image as a card on the right side of the page, over the window area. Reference: docs/design/about-food-map.png.
- Image file: `public/about/food-map.png`. Use a placeholder image until it's added.
- Closes on its own after a few seconds (start at 4, tuned in the browser).
- On a phone it opens centered on screen.

## The window
- A shared `Window` component, also used on the Projects page.
- A four-pane window seen at an angle: it's turned on its vertical axis with its right side toward the viewer, so the right edge is taller and the top slopes up to the right, as if seen from near its foot. The frame is white like the wall. Each pane sits back in the frame, shown by a faint shadow along its top and left edges (the bezel). A plain sill runs under it: a thin ledge barely wider than the window, sticking out into the room, its top a touch darker than the wall and its front edge a little darker again, with a faint soft shadow on the wall just under it (`SILL`).
- The angle, eye height and frame sizes are constants at the top of `components/window.tsx`; the bezel and sill colors are the `bevel`, `sill` and `sill-edge` theme tokens.
- Through the panes you see the live NYC sky: the site's one shared sky, showing the part that's behind the window on screen (see sky.md). For it to show clouds, the window sits in the top part of the page.
- The sky through the panes isn't skewed by the angle: it's far away, so it looks the same as it would straight on, like a real window.
- The clouds drift as usual. The window is view-only: the dots stay put under the cursor.

## Light on the floor
- The room has a floor a shade darker than the wall (`floor` theme token), so there's always contrast and the window's light can show on it in the page's white.
- The room is worked out in 3D with the same camera as the window (`components/window.tsx`): the window sits in a wall turned 32° (`TURN`), and the floor is level about two-thirds of a window-height below the window (`FLOOR`). The floor's edge is where that wall meets it, so it slopes with the wall's turn.
- The light is the window's four panes projected along the light onto the floor, then drawn in perspective, in the page color.
- It follows the same light as the homepage shadow (`useLiveLight` in `components/house.tsx`): the sun by day and the moon by night, bright in sun, faint under clouds and at night (`LIGHT_STRENGTH`), always there. Morning light throws it left, afternoon right.
- Stylized to stay in the room: the light's height is held between 35° and 70° (`LIGHT_ALTITUDE`), it always comes in through the window and at most so far sideways (`MIN_INWARD`, `MAX_SIDEWAYS`), and its travel across the floor is shortened (`LIGHT_REACH`).
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
