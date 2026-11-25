import type { Metadata } from "next";
import { Gallery } from "@/features/photography/gallery";
import { galleryRows } from "@/features/photography/photos";

export const metadata: Metadata = { title: "Photography" };

export default function Photography() {
  return (
    <main className="flex-1 overflow-x-clip pt-6 pb-12 sm:pt-8">
      <h1 className="sr-only">Photography</h1>
      <Gallery rows={galleryRows()} />
    </main>
  );
}
