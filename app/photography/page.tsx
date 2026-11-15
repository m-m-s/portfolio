import { photoRows } from "@/content/photography";
import { Gallery } from "@/features/photography/gallery";

export default function Photography() {
  return (
    <main className="flex-1 overflow-x-clip py-12 sm:pt-16">
      <Gallery rows={photoRows} />
    </main>
  );
}
