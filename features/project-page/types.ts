import type { Photo } from "@/content/photography";

export type Side = "left" | "right";

export type Slide = {
  title?: string;
  paragraphs: string[];
  /** Replaces the slideshow's image while this slide shows. */
  image?: Photo;
};

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "image-text"; image: Photo; imageSide: Side; text: string }
  | { type: "two-columns"; columns: [string, string] }
  | { type: "slideshow"; image: Photo; imageSide: Side; slides: Slide[] }
  | { type: "break" };

export type ProjectPage = {
  platform: string;
  builtWith: string;
  blocks: Block[];
};
