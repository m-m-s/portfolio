# Spec: Photography

One continuous gallery, images only.

## Layout
- Shell: house logo, weather/clock line, footer.
- 3 to 4 rows of large photos with generous space between rows, every photo the same height within the page. Widths follow each photo's own shape (landscape, portrait, wide), so nothing gets cropped.
- Rows come from a list in `content/`: each row is an ordered list of image files, shown in that order.
- Photos show without labels or captions.
- The page is light, like every other room.

## Placeholder photos
- Build the whole gallery with blank rectangles first, so the motion and slideshow can be tested before the real photos are chosen.
- Placeholder data goes in the same `content/` list the real photos will use, with each entry giving a width-to-height ratio in place of an image file. Mix common photo shapes: 3:2, 2:3, 4:3, 3:4, 16:9.
- 3 to 4 rows of 4 to 12 rectangles each, in a few light grays from the Tailwind theme.
- Swapping in the real photos later changes only the content list.

## Built so far
- Static rows (`features/photography/gallery.tsx`, data in `content/photography.ts`): each row scrolls sideways natively (touch, trackpad) with its scrollbar hidden. Rows are 14rem tall on a phone, 20rem from 640px, and 28rem (at most 60% of the screen's height) from 1024px, with 2.5rem between rows on a phone and 5rem from 640px. Placeholder grays are the `photo-1` to `photo-3` theme tokens.
- The slideshow opens in a native `<dialog>`, with arrows and a Close button, and stops at the row's ends. It fades between photos and opens with a plain fade.
- Not yet: the slide-in, drift and drag motion below, the photo growing out of its spot and back, and loading far rows only when they come near.

## Motion
- Rows slide in from alternating sides (left, right, left…) and keep drifting in that direction while slowing to a stop, as one continuous motion with no pause.
- While the visitor scrolls, each row drifts again in its own direction, then eases back to rest when scrolling stops.
- Rows can be dragged sideways.
- Reduced motion: rows appear in place, with no slide-in or drift.

## Slideshow
- Tapping a photo opens a modal over the gallery: a slideshow of that photo's row, starting at that photo. The photo grows out of its spot in the row into the modal.
- Inside the modal: arrows, swiping, or arrow keys move through the row. No counter or numbers: just the photo, the arrows and Close.
- The modal closes with a close button, Esc, or a click outside the photo. Closing shrinks the photo back into its spot in the row.

## Performance
- Photos in rows visible on the first screen load right away (marked priority with `next/image`).
- Every other photo loads when its row comes within about one screen height of view, so it's ready before the visitor reaches it.
- Rows move with CSS transforms only, so the page stays smooth with many photos.

## Done when
- Rows slide in, settle and drift on scroll without stutter, on phone and desktop.
- Dragging a row sideways works.
- Every photo opens its row's slideshow, and closing returns it to its place.
