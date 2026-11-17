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
- Static rows (`features/photography/gallery.tsx`, data in `content/photography.ts`): each row scrolls sideways natively (touch, trackpad) with its scrollbar hidden. Rows are 14rem tall on a phone, 20rem from 640px, and 28rem (at most 60% of the screen's height) from 1024px, with 2.5rem between rows on a phone and 5rem from 640px. Placeholder grays are the `photo-1` to `photo-3` theme tokens.
- The slideshow is a native `<dialog>`; its grow and slide are view transitions (`photoMotion` in `gallery.tsx`, styles under `data-photo-motion` in `app/globals.css`, timing `--photo-grow`, 450ms). See Slideshow.
- Row motion (`features/photography/row-motion.ts`, slide-in in `app/globals.css`): see Motion. Tuning: `--row-slide` (1.6s), `--row-ease` and `--row-slide-distance` (40vw) in CSS; drift, edge and fling constants at the top of `row-motion.ts`.

## Motion
- Rows slide in from alternating sides (left, right, left…) and keep drifting in that direction while slowing to a stop, as one continuous motion with no pause. All rows arrive at the same time, with no stagger and no fade: the blank space a row leaves as it comes in is on purpose. Arriving through a room transition, the slide waits until the room is revealed (`--settle-delay`).
- While the visitor scrolls, each row drifts again in its own direction, further the faster the scroll (up to 48px), then eases back to rest when scrolling stops.
- With a mouse, hovering the left or right edge of the screen (12% of its width) over a row scrolls that row that way, faster nearer the edge. Not while the slideshow is open.
- Rows scroll sideways natively with touch and trackpads. With a mouse they can be dragged sideways and keep gliding a little when let go; a drag never opens a photo.
- Reduced motion: rows appear in place, with no slide-in or drift. Edge hover and dragging still work.
- With a mouse, hovering a photo dims the others (`--photo-hover-dim`, 0.6) so the one under the pointer stands out.

## Slideshow
- Tapping a photo opens a modal over the gallery, starting at that photo. The photo grows out of its spot in the row into the modal while the page fades under the backdrop.
- The rows are only layout: the slideshow runs through every photo in the gallery as one sequence, row after row, and wraps from the last photo to the first and back.
- Inside the modal: arrows, swiping (touch, mouse, or a sideways trackpad swipe, one photo per swipe), or arrow keys move through the photos. Each step slides the current photo out and the next one in, toward the direction of travel. No counter or numbers: just the photo and, under it, ← Close → on one line (Close a size smaller).
- The photo fits a fixed stage above the controls, so the controls stay in the same place for every photo shape. The stage keeps 2rem at the sides on a phone and 4rem from 640px.
- The modal closes with Close, Esc, or a click outside the photo. Closing shrinks the photo back into its spot in the row (the spot of the photo showing, if the visitor stepped).
- Reduced motion: no grow or slide; photos fade in as they change.

## Performance
- Photos use `next/image`'s default lazy loading: on-screen photos load right away, the rest as they come within a screen or two of view (down the page or along a row). No photo is marked `preload`; once the real photos are in, decide whether the first one should be.
- Rows move with CSS transforms only, so the page stays smooth with many photos.

## Done when
- Rows slide in, settle and drift on scroll without stutter, on phone and desktop.
- Dragging a row sideways works.
- Every photo opens the slideshow, and closing returns it to its place.
