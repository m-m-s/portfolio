import { mkdir, writeFile } from "node:fs/promises";
import { get, list } from "@vercel/blob";
import sharp from "sharp";

const token = process.env.PHOTOS_READ_WRITE_TOKEN;
const storeId = process.env.PHOTOS_STORE_ID;
// Without the store (a local build), the gallery shows its placeholders.
if (token || storeId) {
  const auth = token ? { token } : { storeId };
  const dir = new URL("../public/photography/", import.meta.url);
  await mkdir(dir, { recursive: true });

  const blobs = [];
  let cursor;
  do {
    const page = await list({ ...auth, cursor });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const images = blobs.filter((b) =>
    /\.(jpe?g|png|webp|avif)$/i.test(b.pathname),
  );
  const unplaced = [];
  const photos = [];
  for (const blob of images) {
    const file = blob.pathname.split("/").pop();
    // Named row first, then place in the row: "r1-03-bridge.jpg".
    const [, row, position] = file.match(/^\D*(\d+)\D+(\d+)/) ?? [];
    if (!row) {
      unplaced.push(file);
      continue;
    }
    const access = blob.url.includes(".public.blob.") ? "public" : "private";
    const got = await get(blob.url, { access, ...auth });
    if (got?.statusCode !== 200) {
      console.error(
        `Couldn't download ${blob.pathname} from the photos Blob store.`,
      );
      process.exit(1);
    }
    const bytes = new Uint8Array(await new Response(got.stream).arrayBuffer());
    await writeFile(new URL(file, dir), bytes);
    // Phone photos often store their turn in EXIF; the displayed shape is after it.
    const { width, height, orientation } = await sharp(bytes).metadata();
    const turned = orientation >= 5;
    photos.push({
      file,
      row: Number(row),
      position: Number(position),
      width: turned ? height : width,
      height: turned ? width : height,
    });
  }

  if (unplaced.length) {
    console.error(
      `Photos need a row and place at the start of their name ("r1-03-bridge.jpg"): ${unplaced.join(", ")}`,
    );
    process.exit(1);
  }
  photos.sort((a, b) => a.row - b.row || a.position - b.position);
  await writeFile(
    new URL("../features/photography/photos.json", import.meta.url),
    `${JSON.stringify(photos, null, 2)}\n`,
  );
  console.log(`Photos: ${photos.length} files from the photos Blob store.`);
}
