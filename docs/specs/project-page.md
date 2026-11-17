# Spec: Project page template

One template for every project page (Film Jousting, Overlook, This site). Reference: docs/design/project-page.png (the Overlook mock).

## Layout
- Shell: house logo top left, weather/clock line at the top.
- Content sits in one column (42rem), centered on the page. Nothing runs past the page's right edge.
- Footer at the very end of the page, bottom right, the same as every other page.
- **Phone:** everything stacks in one column, image above its text.

## Header
- Project name, large Switzer bold.
- An info table with labeled columns: Platform, Built with. Claude Code is listed in Built with. Thin lines above and below it and between its columns (`rule` token) set it apart from the copy.

## Content blocks
Each project's page is a list of blocks in `content/project-pages/` (one file per project, keyed by its href), rendered in order by `features/project-page/`. Pages differ by project: any number of blocks, in any order, with more or fewer images and slideshows. The page copy has no section titles. Block types:

- **Paragraph:** full content width.
- **Break:** a thin line (`rule` token) between sections of a page, where the story moves on.
- **Image + text:** an image beside a paragraph. The image can sit on either side.
- **Two columns:** two paragraphs side by side.
- **Slideshow:** an image beside a slide of text (short title + paragraph). Advancing changes the text and can keep the same image or change it. Only the current slide shows; the slides to the right of the mock's frame are the ones still to come, not something to show off the page's edge.
  - Arrows move between slides, with a counter showing the position (`1/4`). They stop at the first and last slide.
  - Advancing eases the new text (and image, if it changes) in from the right; going back eases it in from the left. A slide can bring its own image, or keep the slideshow's.
  - Reduced motion: the text and image fade instead of sliding.
- In any block's copy, a phrase wrapped in `**…**` is set semi-bold, for emphasis or to anchor a section. Used sparingly: a few phrases a page, never whole first lines.
- Blocks below the fold wait out of sight and, the first time each scrolls into view, rise a little and fade in (once, over 800ms; `SettleIn` in `features/project-page/`). Blocks already on screen when the page opens arrive with the room transition, and without JavaScript every block just shows. Slideshows only animate when the reader changes slides, not when the page opens. Reduced motion: a fade only.
- Use placeholder images where the real ones aren't added yet: a gray box (`placeholder` token) at the image's shape, labelled with its `[IMAGE: …]` alt text. Adding `src` swaps in the real image (`next/image`, cropped to the same shape).

## Done when
- All three project pages render from their content files with the same template.
- Each block type matches the mock on desktop and stacks cleanly on a phone.
- Slideshows advance smoothly, and nothing runs off the page.
