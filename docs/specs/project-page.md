# Spec: Project page template

One template for every project page (Film Jousting, Overlook, This site). Reference: docs/design/project-page.png (the Overlook mock).

## Layout
- Shell: house logo top left, weather/clock line at the top.
- Content sits in one column, centered on the page. It widens on bigger screens like About's: 42rem, 50rem from 1280px, and 58rem from 1536px. Text stays the same size at every width (16px body), so wide screens don't read large. Nothing runs past the page's right edge.
- Footer at the very end of the page, bottom right, the same as every other page.
- **Phone:** everything stacks in one column, image above its text.

## Header
- Project name, large Switzer bold. At the right, level with the top of the title (so it stays at the top when the name wraps on a phone), a small "← Projects" link back (Space Grotesk, like the footer; a room link, so the camera walks back out).
- The project's facts, laid out like film credits, with no lines or boxes: Platform, Hosting (only where a project has it), Status and Repo (a link to its GitHub repo) side by side, wrapping as the width needs, then Built with, the long one, on a line of its own. Each label is small Space Grotesk capitals in a lighter gray (`ink` at half strength), with its value under it. Claude Code is listed in Built with. Values can hold a link, like Status's live site.
- Thin lines (`rule` token) under the title and under the facts. The line under the title sits close to it (1.25rem, 1.5rem from 640px); the one under the facts is spaced like the breaks between sections.

## Other projects
- At the end of the content, after a thin line, the projects on either side of this one in the staircase's order (`content/projects.ts`, oldest first), looping round so every page has both: the earlier one at the left ("← This site"), the later one at the right ("Overlook →"). Space Grotesk regular at body size, like the back link, as room links. The page leaves 2rem below them before the footer (2.5rem from 640px).

## Content blocks
Each project's page is a list of blocks in `content/project-pages/` (one file per project, keyed by its href), rendered in order by `features/project-page/`. Pages differ by project: any number of blocks, in any order, with more or fewer images and slideshows. The page copy has no section titles. Block types:

- **Text:** one or more paragraphs across the full content width. Paragraphs that follow on from each other share a block, so they sit closer together than the gap between blocks.
- **Image:** one image across the full content width. Every image on the page has a thin `rule` outline.
- **Image row:** a few images side by side, the same size, centered. On a phone they shrink to stay in one row; a row can show fewer there (`onPhone`), dropping the ones after (Overlook's intro row shows the sidebar, home screen and a saved screenshot, and only the first two on a phone).
- **Break:** a thin line (`rule` token) between sections of a page, where the story moves on. Every line on the page has less space around it (1.5rem, 2rem from 640px) than blocks without a line between them (2.5rem, 3rem from 640px).
- **Image + text:** an image beside one or more paragraphs. The image can sit on either side.
- **Phone screens:** a portrait image is a phone screen (Overlook's). It shows whole, at most phone width (`phone` spacing token), with rounded corners (`phone` radius) and a thin `rule` outline. Beside text (image + text, slideshow) it sits in a column of phone width beside a text column of at most 30rem (`beside-phone` spacing token), 4rem apart from 1024px, and the pair is centered, so on wide screens the text keeps a readable line length. On a phone it keeps that width, centered above its text. Screens are captured from the app with the system status and gesture bars cropped off.
- **Slideshow:** an image beside a slide of text (short title + paragraph). Advancing changes the text and can keep the same image or change it. Only the current slide shows; the slides to the right of the mock's frame are the ones still to come, not something to show off the page's edge.
  - Arrows move between slides, with a counter showing the position (`1/4`), centered under the whole slideshow. They stop at the first and last slide.
  - Every slide's text and image stay in the page, stacked in one spot, so nothing has to load when the reader moves and the slideshow is always as tall as its tallest slide (the page below never shifts). Moving crossfades to the new slide over 450ms (`--slide-move`): the text slides in a little from the right going forward, from the left going back; an image only fades. A slide can bring its own image, or keep the slideshow's. A slideshow can also be text only, across the full width.
  - Reduced motion: a plain crossfade, no sliding.
  - **Live cloud:** a slideshow can show a live cloud in place of its image (`live: "cloud"`; the image entry still gives its shape and alt text). It's one front cloud from the sky (`58-2`, from Partly cloudy, with more dots than the sky's tuning), dithered fresh to 85% of the box and centered, still, in the page color with the image outline. The cursor or a finger scatters its dots exactly as in the sky. On touch screens a drag that starts on the cloud's dots (within 16px, `REACH` in `live-cloud.tsx`) stays with the cloud, in any direction; one that starts on the white around it scrolls the page. Pinch zoom still works. It runs only while its slide shows and it's on screen, and stops drawing once its dots have settled. This site's first sky slide uses it.
  - **Hint:** a slide can carry a short hint under its text (`hint`), in Space Grotesk at 14px and 65% ink, with an arrow toward the visual: ← (→ when the image is on the right) side by side, ↑ on a phone where the image sits above. This site's live cloud slide says `← Try it on the cloud`. A hint can instead be a button that opens Look outside (`hintOpens`), with no arrow: This site’s “Rendering the sky” slide says `Look out the window`.
  - A slideshow can carry an `id`, so other pages can link straight to it (This site's sky slides are `#sky`). Arriving there centers it on screen (or puts its top at the top of the screen when it's taller than the screen), and the blocks on screen settle in.
  - In place of an image, a slideshow can show a diagram drawn in code (`diagram`, from `features/project-page/diagrams/`), and each slide can name the `step` it's about: that step's boxes get a dark outline and the rest fade to 60%, moving with the slides. A diagram reads as one picture to a screen reader, with its own description (`role="img"` and `aria-label` on the figure). A box can belong to more than one step (Your filters, Filter and score every film and Ranked recommendations light up on every step, since every path runs through them). Film Jousting's search engine uses one (`jousting-engine`), drawn from what its server and client code actually do. On a phone a diagram goes under the slide's text and the arrows (an image stays on top), so the reader can read and move on without scrolling past it, and only the highlighted steps keep their detail lines, so it stays short.
- In any block's copy (and the info table's values), `[label](https://…)` is a link that opens in a new tab, in the `link` color with a faint underline that darkens with the text (`link-hover`) on hover, and a phrase wrapped in `**…**` is set semi-bold, for emphasis or to anchor a section. Used sparingly: a few phrases a page, never whole first lines.
- The page rises into place (`SettleIn` in `features/project-page/`): the title, the info table and the blocks on screen as it opens settle in one after another (1.2s each with a gentle ease-out, 150ms apart; arriving through a room transition, once the new room shows). Blocks below the fold wait out of sight and settle in once, the first time each scrolls into view, at the same speed and ease, so every block on every page arrives alike. Without JavaScript everything still shows. Reduced motion: a fade only.
- Use placeholder images where the real ones aren't added yet: a gray box (`placeholder` token) at the image's shape, labelled with its `[IMAGE: …]` alt text. Adding `src` swaps in the real image (`next/image`, cropped to the same shape).

## Done when
- All three project pages render from their content files with the same template.
- Each block type matches the mock on desktop and stacks cleanly on a phone.
- Slideshows advance smoothly, and nothing runs off the page.
