# Spec: About

A room with a window. Reference: docs/design/about.png.

## Layout
- Shell as usual: house logo top left, weather/clock line top right, footer bottom right.
- Heading "Hi, I'm Maggie," in large Switzer bold.
- Paragraphs zigzag down the page, alternating flush left and indented, as in the frame.
- The window sits on the right, beside the text.
- **Phone:** the window moves above the text, smaller, tucked beside the heading.

## Copy and links
- Copy lives in `content/` (see CLAUDE.md).
- Link phrases are Switzer bold and keep their square brackets on the page: `[a living library for screenshots]`.
- Link targets:
  - [a living library for screenshots] → `/projects/overlook`
  - [a way to discover movies and decide what to watch] → `/projects/film-jousting`
  - [weather] → styled like the other bracketed phrases. Its behavior comes later.
  - [behind a camera] → `/photography`
  - [thinking about my next meal] → opens the food map (see below)
  - [a team I care about] → `mailto:maggiemshen@gmail.com`
- Links to rooms use `DoorLink` (see shell.md). Phrases that open something on the page are buttons, so they work by keyboard and screen reader.

## Food map
- Clicking or tapping [thinking about my next meal] opens the food map image as a card on the right side of the page, over the window area. Reference: docs/design/about-food-map.png.
- Image file: `public/about/food-map.png`. Use a placeholder image until it's added.
- Closes on its own after a few seconds (start at 4, tuned in the browser).
- On a phone it opens centered on screen.

## The window
- A shared `Window` component, also used on the Projects page.
- A four-pane window frame, drawn to match the frame in the Figma mock.
- Through the panes you see the live NYC sky: the same weather and the same Sky component as the homepage, clipped to the panes.
- The clouds drift as usual. The window is view-only: the dots stay put under the cursor.

## Light on the floor
- Light through the window falls on the floor at the bottom of the page, in the shape of the panes.
- It moves with the sun like the homepage shadow (same sun calculation, same direction logic): its angle and stretch follow the time of day.
- Fades with cloudy weather like the homepage shadow, and is gone at night.

## Done when
- The zigzag layout matches the frame on desktop, and the window sits beside the heading on a phone.
- The window shows the live sky for the current NYC weather.
- The floor light moves with the time of day.
- Every bracketed link and button is live:
  - the project and photography links swing open into the right rooms
  - [thinking about my next meal] opens the food map, and it closes on its own after a few seconds
  - [a team I care about] opens a new email
  - [weather] shows in place, with its behavior still to come
