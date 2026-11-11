# Spec: Project page template

One template for every project page (Film Jousting, Overlook, This site). Reference: docs/design/project-page.png (the Overlook mock).

## Layout
- Shell: house logo top left, weather/clock line at the top.
- Content fills the page width, as in the mock. Slideshows' upcoming slides run past the right edge of the page.
- Footer at the very end of the page, bottom right, the same as every other page.
- **Phone:** everything stacks in one column, image above its text.

## Header
- Project name, large Switzer bold.
- An info table with labeled columns: Platform, Built with. Claude Code is listed in Built with.

## Content blocks
Each project's page is a list of blocks in `content/`, rendered in order. Pages differ by project: any number of blocks, in any order, with more or fewer images and slideshows. The page copy has no section titles. Block types:

- **Paragraph:** full content width.
- **Image + text:** an image beside a paragraph. The image can sit on either side.
- **Two columns:** two paragraphs side by side.
- **Slideshow:** an image beside a slide of text (short title + paragraph). Advancing changes the text and can keep the same image or change it. The next slides sit to the right, running off the edge of the page, so you can see there's more.
  - Arrows move between slides, with a counter showing the position (`1/4`).
- Use placeholder images where the real ones aren't added yet.

## Done when
- All three project pages render from their content files with the same template.
- Each block type matches the mock on desktop and stacks cleanly on a phone.
- Slideshows advance smoothly, and the next slides show off to the right.
