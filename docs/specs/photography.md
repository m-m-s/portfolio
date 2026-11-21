# Spec: Photography

One continuous gallery, images only.

## Layout
- Shell: house logo, weather/clock line, footer.
- 3 rows of large photos with generous space between rows, every photo the same height within the page. Widths follow each photo's own shape (landscape, portrait, wide), so nothing gets cropped.
- Rows come from a list in `content/`: each row is an ordered list of image files, shown in that order.
- Photos show without labels or captions.
- The page is light, like every other room.

## Placeholder photos
- Build the whole gallery with blank rectangles first, so the motion and slideshow can be tested before the real photos are chosen.
- Placeholder data goes in the same `content/` list the real photos will use, with each entry giving a width-to-height ratio in place of an image file. Mix common photo shapes: 3:2, 2:3, 4:3, 3:4, 16:9.
- 3 rows of 7 to 12 rectangles each, in a few light grays from the Tailwind theme.
- Swapping in the real photos later changes only the content list.

## Built so far
- Rows (`features/photography/gallery.tsx`, data in `content/photography.ts`) are endless loops, moved by script rather than native scrolling. Rows are 14rem tall on a phone, 20rem from 640px, and 28rem (at most 60% of the screen's height) from 1024px, with 2.5rem between rows on a phone and 5rem from 640px. Placeholder grays are the `photo-1` to `photo-3` theme tokens.
- The slideshow is a native `<dialog>`; its grow and slide are view transitions (`photoMotion` in `gallery.tsx`, styles under `data-photo-motion` in `app/globals.css`, timing `--photo-grow`, 450ms). See Slideshow.
- Row motion (`features/photography/row-motion.ts`, slide-in in `app/globals.css`): see Motion. Tuning: `--row-slide` (1.6s), `--row-ease` and `--row-slide-distance` (100vw) in CSS; scroll travel, edge and fling constants at the top of `row-motion.ts`.

## Motion
- Each row is an endless loop: after its last photo the first comes round again, with the usual gap, so scrolling a row never hits an end. Each photo is a single element; a photo that leaves one end is moved to the other, so the page holds no copies. A row has to be wider than the screen plus its widest photo for the loop to stay seamless (even 7 photos are, at 2560px).
- Rows slide in from alternating sides (left, right, left…), starting fully off screen, and keep moving in that direction while slowing to a stop, as one continuous motion with no pause. All rows arrive at the same time, with no stagger and no fade: the blank space a row leaves as it comes in is on purpose. Arriving through a room transition, the slide waits until the room is revealed (`--settle-delay`), out of sight.
- Rows travel with the page: scrolling down moves each row along in its own direction (0.4px per px of scroll, `SCROLL_TRAVEL`), scrolling up moves it back, and when scrolling stops they stop. Nothing springs back. (An earlier drift pushed rows aside with each scroll and eased them back, which read as a jiggle on phones.)
- Rows move sideways with a finger swipe, a mouse drag or a sideways trackpad swipe, and keep gliding a little when let go; a drag never opens a photo. An up-and-down swipe scrolls the page as usual. With a mouse, hovering the left or right edge of the screen (12% of its width) over a row moves that row that way, faster nearer the edge; not while the slideshow is open. Tabbing to a photo brings it into view.
- Reduced motion: rows appear in place, with no slide-in or scroll travel. Swiping, dragging and edge hover still work.
- With a mouse, hovering a photo dims the others (`--photo-hover-dim`, 0.6) so the one under the pointer stands out.

## Slideshow
- Tapping a photo opens a modal over the gallery, starting at that photo. The photo grows out of its spot in the row into the modal while the page fades under the backdrop.
- The rows are only layout: the slideshow runs through every photo in the gallery as one sequence, row after row, and wraps from the last photo to the first and back.
- Inside the modal: arrows, swiping (touch, mouse, or a sideways trackpad swipe, one photo per swipe), or arrow keys move through the photos. Each step slides the current photo out and the next one in, toward the direction of travel. No counter or numbers: just the photo and, under it, ← Close → on one line (Close a size smaller). Each arrow's tap area fills its side of that line, edge to Close, and runs to the bottom of the screen, so a near miss still steps instead of closing the slideshow. On touch screens the slideshow keeps a finger's drags for itself (pinch zoom still works), so the browser never cuts a swipe short.
- The photo fits a fixed stage above the controls, so the controls stay in the same place for every photo shape. The stage keeps 2rem at the sides on a phone and 4rem from 640px.
- The modal closes with Close, Esc, or a click outside the photo. Closing shrinks the photo back into its spot in the row (the spot of the photo showing, if the visitor stepped).
- Reduced motion: no grow or slide; photos fade in as they change.

## Performance
- Photos use `next/image`'s default lazy loading: on-screen photos load right away, the rest as they come within a screen or two of view (down the page or along a row). No photo is marked `preload`; once the real photos are in, decide whether the first one should be.
- Rows move with CSS transforms only, so the page stays smooth with many photos.

## Done when
- Rows slide in, settle and travel on scroll without stutter, on phone and desktop.
- Swiping or dragging a row sideways works, round and round.
- Every photo opens the slideshow, and closing returns it to its place.
