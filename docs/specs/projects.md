# Spec: Projects

The projects sit on platforms at three heights, like pieces on display in a room. References: docs/design/projects.png (desktop and phone frames).

## Layout
- Shell as usual: house logo top left, weather/clock line top right, footer bottom right.
- The window from About (the shared `Window` component: live sky, view-only) sits top left, in the plane of the steps' sides (the side wall): turned with its right side away (`flip`), its foot rising to the right at the same slope as the steps' side edges, so its turn follows the staircase's numbers at every width (about 20° on desktop, capped at 45° on a phone, where the sides recede steeply). The viewer's eye is level with the window's top (`eye={0}`), since the room is seen from above the step tops; that's what lets the foot slope that steeply. `turnForSlope` in `components/window.tsx` finds the turn.
- The window's left edge is at 10% of the room's width (`WINDOW_LEFT` in `features/projects/project-platforms.tsx`), moving to 16% between 1440px and 2560px. Its height on the wall and its size both come from one distance: from the room's top down to the highest project step whose front the sill's far corner can reach. The window's top sits 15% of the way down (rising to 7% from 1440px to 2560px, so it doesn't hang low on the widest screens), and the window fills the rest, so the sill's corner lands just behind that step. Width stays between 100px and 45% of the room on a phone, 40% from 640px, easing to 28% from 1024px to 1440px so on desktop it doesn't outweigh the steps; it's never taller than 55% of the room. Where that cap stops it short of the step (big screens), it simply ends above the step; where no step is in reach, it measures to the lowest one.
- The window stays tall (2:3) at every width: its upright shape against the long, low steps is part of the composition.
- The window shows the site's one live sky, the part behind it on screen, shifted as if it hung a tenth of its own height higher (`skyDrop` on `Window`) so more of the clouds are in it.
- The platforms take up the rest of the page.
- The room's wall (`wall` token, `#f8f7f5`) is painted by the Projects page itself, as a layer behind the whole screen, so no other page picks it up; the page also sets its own page color to it, so its window sill and label rims match. It's a touch darker than the rest of the site, so the white step tops show against it while the steps' fronts and sides carry the contrast; a darker wall made the empty space heavier. The window is faint on it on purpose: a mood more than a physical window. The project names have a soft white rim (the `halo` in the step-top color), so a name that crosses from a step top onto a riser or the wall stays crisp.

## The platforms
- One platform per project, oldest at the bottom: Film Jousting, then Overlook, then This site on top.
- Projects come from one list in `content/` (name, link). Adding an entry adds a new platform at the top.
- The platforms are steps of one staircase: each stands on the back edge of the one below, so their sides are flush, one wall. Each step is a top and a front face, and the sides are drawn as one shape (no seams), all flat SVG shapes that read as 3D.
- One function calculates every face's corners from a few numbers: the lowest step's near corner, the top's front edge (width and rise), its receding edge (width and rise), and each step's front-face height.
- **Desktop:** platforms rise diagonally from bottom left to top right, as in the desktop frame.
- **Phone:** seen almost head on from the left: front faces are level, tops recede up and right at about 45°, and the steps shift right as they climb, off the right edge, as in the phone frame.
- Between the two, the numbers scale with the screen. Tune them in the browser.
- The numbers live in `features/projects/platforms.ts`: one set for a phone (390px) and one for desktop (1280px), as shares of the room's width, blended between those widths. Front faces and the side wall run down past the page's foot.
- Each name is centered left to right on the part of its step's top face that's on screen (on a phone most of the face is off the right edge), and stands on the face: the bottom of the label rests on the top surface 30% of the way back from its front edge, so the text looks like it's sitting on the step.
- **Height cap:** the highest project's step tops out no higher than 70% of the room's height on phones and tablets; on desktop the steps take more of it, up to 80% at 1280px, easing back to 70% by 1920px, so they hold the eye instead of the empty wall. Where the numbers would put it higher, the whole staircase shrinks in proportion and keeps to the right edge; the spare room goes on its left. On the widest screens the staircase also stops growing with the room: from 1440px it shrinks, to a quarter smaller at 2560px, and from 1600px it slides further right, by up to 10% of the room at 2560px, so it doesn't look oversized there.
- **Empty top step:** one empty step carries the staircase on above the projects. On short screens it rises out of view at the room's top rather than shrinking the staircase or making the page scroll (the room has no minimum height). From 1536px (`EXTRA_STEP_WIDTH`) the staircase also shrinks so the empty step's near corner is on screen, so big screens get more steps, not giant ones. A new project takes the empty step, and a new empty one appears above it.
- On a phone the lowest step sits close to the room's foot (`bottom` 0.03).
- Not yet: the light on the floor (the window here has none so far).
- Face colors come from the Tailwind theme (`platform-top`, `platform-front`, `platform-side`): white tops, fronts `#e2e0dd`, sides `#d3d1cd`, against the wall. The tops stay the brightest surface; tops darker than their surroundings make the steps look lit from below.

## Project names
- Each project's name (Switzer bold, large) sits on its platform's top face as real text, with nothing under it: no tagline. On desktop it grows with the screen, in step with the stairs (60px up to about 2300px wide and 67px at 2560px); below 1024px it keeps its fixed sizes. What each project is and its tech stack live on its project page.
- Each name is a plain link to its project page, not a door: a door swinging open on a platform made no sense. Hovering over a name, or focusing it, lifts its step a little (15% of a riser). The hover area stays put while the label rises, so the step can't bounce under a still pointer; clicking it raises the step most of the way to the next (70%, over 350ms: `LIFT`, `LIFT_MS`) while the page change starts at the same moment, so the rise never adds a pause before the transition. The step's top, front and its own piece of side wall rise together, with the name. Reduced motion: no rise.
- The whole platform is part of the click area: hovering any face of a project's step (top, front or side) lifts it like hovering its name, and clicking it raises it and opens the page. The name stays the real link, for keyboards and screen readers; the faces are a larger pointer target on top. The empty top step isn't interactive.
- Clicking goes deeper into the room (see shell.md).

## Done when
- The platforms match the desktop frame on a laptop and the phone frame on a phone, and look right at every width in between.
- Names stay readable and sit on their top faces at every width.
- Adding a fourth project to the list adds a fourth platform at the top, without layout changes.
- Each name lifts its step on hover, and raises it on click before opening its project page.
