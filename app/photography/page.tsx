import type { Metadata } from "next";
import { photoRows } from "@/content/photography";
import { Gallery } from "@/features/photography/gallery";

export const metadata: Metadata = { title: "Photography" };

export default function Photography() {
  return (
    <main className="flex-1 overflow-x-clip py-12 sm:pt-16">
      <h1 className="sr-only">Photography</h1>
      <Gallery rows={photoRows} />
    </main>
  );
}
