import { access, writeFile } from "node:fs/promises";
import { get, list } from "@vercel/blob";

const token = process.env.LOCALFONTS_READ_WRITE_TOKEN;
const storeId = process.env.LOCALFONTS_STORE_ID;
// Without the store (a local build), app/fonts/ already holds the files.
if (token || storeId) {
  const auth = token ? { token } : { storeId };
  const dir = new URL("../app/fonts/", import.meta.url);

  const files = [];
  let cursor;
  do {
    const page = await list({ ...auth, cursor });
    files.push(...page.blobs.map((b) => b.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const fonts = files.filter((f) => f.endsWith(".woff2"));
  if (fonts.length === 0) {
    console.error(
      `No .woff2 files in the fonts Blob store. It holds: ${files.join(", ") || "nothing"}`,
    );
    process.exit(1);
  }

  for (const pathname of fonts) {
    // Flattened: fonts.ts refers to each file by its name alone.
    const target = new URL(pathname.split("/").pop(), dir);
    try {
      await access(target);
      continue;
    } catch {}
    const file = await get(pathname, { access: "private", ...auth });
    if (file?.statusCode !== 200) {
      console.error(`Couldn't download ${pathname} from the fonts Blob store.`);
      process.exit(1);
    }
    await writeFile(
      target,
      new Uint8Array(await new Response(file.stream).arrayBuffer()),
    );
  }
  console.log(`Fonts: ${fonts.length} files from the fonts Blob store.`);
}
