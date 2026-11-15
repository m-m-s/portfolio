# Spec: Projects

The projects sit on platforms at three heights, like pieces on display in a room. References: docs/design/projects.png (desktop and phone frames).

## Layout
- Shell as usual: house logo top left, weather/clock line top right, footer bottom right.
- The window from About (the shared `Window` component: live sky, view-only, light on the floor) sits top left, mirrored so its left side is toward the viewer (`<Window flip>`).
- The platforms take up the rest of the page.
- The room's wall (the whole page, `wall` token) is a shade darker than the other pages, so the white step tops stand out against it, as in the frames.

## The platforms
- One platform per project, oldest at the bottom: Film Jousting, then Overlook, then This site on top.
- Projects come from one list in `content/` (name, tech line, link). Adding an entry adds a new platform at the top.
- The platforms are steps of one staircase: each stands on the back edge of the one below, so their sides are flush, one wall. Each step is a top and a front face, and the sides are drawn as one shape (no seams), all flat SVG shapes that read as 3D.
- One function calculates every face's corners from a few numbers: the lowest step's near corner, the top's front edge (width and rise), its receding edge (width and rise), and each step's front-face height.
- **Desktop:** platforms rise diagonally from bottom left to top right, as in the desktop frame.
- **Phone:** seen almost head on from the left: front faces are level, tops recede up and right at about 45°, and the steps shift right as they climb, off the right edge, as in the phone frame.
- Between the two, the numbers scale with the screen. Tune them in the browser.
- The numbers live in `features/projects/platforms.ts`: one set for a phone (390px) and one for desktop (1280px), as shares of the room's width, blended between those widths. Front faces and the side wall run down past the page's foot.
- Each name is centered on the part of its top face that's on screen (on a phone most of the face is off the right edge).
- Not yet: the light on the floor (the window here has none so far), and room for a fourth platform on desktop, where it would land off the top right.
- Face colors come from the Tailwind theme (`platform-top`, `platform-front`, `platform-side`): top faces white, lighter than the wall; front and side faces in two grays darker than it.

## Project names
- Each project's name (Switzer bold, large) and its tech line (small) sit on its platform's top face as real text.
- The tech lines in the frame are placeholder copy.
- Each name is a `DoorLink` to its project page. On hover it does a small swing, the same motion as the homepage's idle swing.
- Clicking goes deeper into the room (see shell.md).

## Done when
- The platforms match the desktop frame on a laptop and the phone frame on a phone, and look right at every width in between.
- Names and tech lines stay readable and sit on their top faces at every width.
- Adding a fourth project to the list adds a fourth platform at the top, without layout changes.
- Each name swings on hover and opens its project page.
