# Spec: Photography

One continuous gallery, images only.

## Layout
- Shell: house logo, weather/clock line, footer. A visually hidden "Photography" heading names the page for screen readers.
- Rows of large photos (as many as the file names give) with space between rows (2rem, 3rem from 640px), every photo the same height within the page. Widths follow each photo's own shape (landscape, portrait, wide), so nothing gets cropped.
- Rows come from a list in `content/`: each row is an ordered list of image files, shown in that order.
- Photos show without labels or captions.
- The page is light, like every other room.

## Photos
- The photos live in a Vercel Blob store connected to the project with the prefix `PHOTOS`, so builds on Vercel get `PHOTOS_READ_WRITE_TOKEN`. They aren't in the repo.
- Each file name starts with its row and its place in that row: `r1-03-bridge.jpg` is the third photo in row 1 (anything before the row number is ignored). A build stops with an error naming any photo without them.
- Before each build, `scripts/fetch-photos.mjs` downloads the photos into `public/photography/` (git-ignored), turned upright and no larger than 3840px (next/image's largest size), and writes each one's row, place and shape to `features/photography/photos.json`, which `galleryRows()` in `features/photography/photos.ts` turns into rows. Public and private stores both work.
- Alt text is copy: `photoAlts` in `content/photography.ts`, keyed by file name. A photo without one shows `[COPY: alt for …]`.
- Where a build has no store (a local build), `photos.json` stays empty and the gallery shows placeholders: 3 rows of 7 to 12 rectangles in common photo shapes (3:2, 2:3, 4:3, 3:4, 16:9), in a few light grays from the Tailwind theme.

## Built so far
- Rows (`features/photography/gallery.tsx`, data from `galleryRows()`) are endless loops, moved by script rather than native scrolling. Rows are 14rem tall on a phone, 20rem from 640px, and 28rem (at most 60% of the screen's height) from 1024px, with 2.5rem between rows on a phone and 5rem from 640px. Placeholder grays are the `photo-1` to `photo-3` theme tokens.
- The slideshow is a native `<dialog>`; its grow and slide are view transitions (`photoMotion` in `gallery.tsx`, styles under `data-photo-motion` in `app/globals.css`, timing `--photo-grow`, 450ms). See Slideshow.
- Row motion (`features/photography/row-motion.ts`, slide-in in `app/globals.css`): see Motion. Tuning: `--row-slide` (1.6s), `--row-ease` and `--row-slide-distance` (100vw) in CSS; edge and fling constants at the top of `row-motion.ts`.

## Motion
- Each row is an endless loop: after its last photo the first comes round again, with the usual gap, so scrolling a row never hits an end. Each photo is a single element; a photo that leaves one end is moved to the other, so the page holds no copies. A row has to be wider than the screen plus its widest photo for the loop to stay seamless (even 7 photos are, at 2560px).
- Rows slide in from alternating sides (left, right, left…), starting fully off screen, and keep moving in that direction while slowing to a stop, as one continuous motion with no pause. All rows arrive at the same time, with no stagger and no fade: the blank space a row leaves as it comes in is on purpose. Arriving through a room transition, the slide waits until the old page is gone (`--arrive`), out of sight.
- Scrolling the page up and down never moves the rows sideways.
- Rows move sideways with a finger swipe, a mouse drag or a sideways trackpad swipe, and keep gliding a little when let go; a drag never opens a photo. An up-and-down swipe scrolls the page as usual. With a mouse, hovering the left or right edge of the screen (12% of its width) over a row moves that row that way, faster nearer the edge; not while the slideshow is open. Tabbing to a photo brings it into view.
- Reduced motion: rows appear in place, with no slide-in. Swiping, dragging and edge hover still work.
- With a mouse, resting the pointer on a photo dims the others (`--photo-hover-dim`, 0.6) so it stands out. The dim waits until the pointer has stopped on a photo for 0.3s (`HOVER_REST` in `gallery.tsx`), so sweeping across the gallery never dims it; once dimmed, moving within that photo keeps the dim, and moving to another photo clears it until the pointer stops again.

## Slideshow
- Tapping a photo opens a modal over the gallery, starting at that photo. The photo grows out of its spot in the row into the modal while the page fades under the backdrop.
- The rows are only layout: the slideshow runs through every photo in the gallery as one sequence, row after row, and wraps from the last photo to the first and back.
- Inside the modal: arrows, swiping (touch, mouse, or a sideways trackpad swipe, one photo per swipe), or arrow keys move through the photos. Each step slides the current photo out and the next one in, toward the direction of travel. No counter or numbers: just the photo and, under it, ← Close → on one line (Close a size smaller). Each arrow's tap area fills its side of that line, edge to Close, and runs to the bottom of the screen, so a near miss still steps instead of closing the slideshow. On touch screens the slideshow keeps a finger's drags for itself (pinch zoom still works), so the browser never cuts a swipe short.
- The photo fits a fixed stage above the controls, so the controls stay in the same place for every photo shape. The stage keeps 2rem at the sides on a phone and 4rem from 640px.
- The modal closes with Close, Esc, or a click outside the photo. Closing shrinks the photo back into its spot in the row (the spot of the photo showing, if the visitor stepped).
- Reduced motion: no grow or slide; photos fade in as they change.

## Performance
- Gallery photos load lazily (`next/image`), except the first three of the top row (`FIRST_SEEN`), which are on screen as the page opens and load straight away.
- The slideshow asks for a photo no wider than it can show it (fitting the screen, so a portrait photo is narrow), not the whole screen's width. It opens on the row's copy of the photo, already loaded, and the sharper one replaces it as it arrives. The photos either side load while one is shown, and resting the pointer on a gallery photo starts loading its slideshow size, so opening and stepping find them ready.
- Rows move with CSS transforms only, so the page stays smooth with many photos.

## Done when
- Rows slide in, settle and travel on scroll without stutter, on phone and desktop.
- Swiping or dragging a row sideways works, round and round.
- Every photo opens the slideshow, and closing returns it to its place.
