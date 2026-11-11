# Spec: Projects

The projects sit on platforms at three heights, like pieces on display in a room. References: docs/design/projects.png (desktop and phone frames).

## Layout
- Shell as usual: house logo top left, weather/clock line top right, footer bottom right.
- The window from About (the shared `Window` component: live sky, view-only, light on the floor) sits top left.
- The platforms take up the rest of the page.

## The platforms
- One platform per project, oldest at the bottom: Film Jousting, then Overlook, then This site on top.
- Projects come from one list in `content/` (name, tech line, link). Adding an entry adds a new platform at the top.
- Each platform is three flat faces (top, front and side), drawn as flat SVG shapes that read as 3D.
- One function calculates every face's corners from a few numbers: platform width, how much higher each platform sits than the one below, top-face depth, and side-face width.
- **Desktop:** platforms rise diagonally from bottom left to top right, as in the desktop frame.
- **Phone:** platforms stack up the page and shift right, as in the phone frame.
- Between the two, the numbers scale with the screen. Tune them in the browser.
- Face colors come from the Tailwind theme: top faces lightest, front and side faces in two grays.

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
