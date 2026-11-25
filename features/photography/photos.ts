import { type Photo, photoAlts, placeholderRows } from "@/content/photography";
import stored from "./photos.json";

/** Written by scripts/fetch-photos.mjs during a build with the photos store. */
type Stored = {
  file: string;
  row: number;
  position: number;
  width: number;
  height: number;
};

export function galleryRows(): Photo[][] {
  const photos = stored as Stored[];
  if (photos.length === 0) return placeholderRows;
  const rows = new Map<number, Photo[]>();
  for (const { file, row, width, height } of photos) {
    const photo = {
      src: `/photography/${file}`,
      alt: photoAlts[file] ?? `[COPY: alt for ${file}]`,
      ratio: width / height,
    };
    rows.set(row, [...(rows.get(row) ?? []), photo]);
  }
  return [...rows.values()];
}
