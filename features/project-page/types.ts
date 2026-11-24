import type { Photo } from "@/content/photography";

export type Side = "left" | "right";

export type Slide = {
  title?: string;
  paragraphs: string[];
  /** Replaces the slideshow's image while this slide shows. */
  image?: Photo;
  step?: string;
};

export type Diagram = "jousting-engine";

export type Block =
  | { type: "text"; paragraphs: string[] }
  | { type: "image"; image: Photo }
  | { type: "image-row"; images: Photo[] }
  | {
      type: "image-text";
      image: Photo;
      imageSide: Side;
      paragraphs: string[];
    }
  | { type: "two-columns"; columns: [string, string] }
  | {
      type: "slideshow";
      imageSide?: Side;
      slides: Slide[];
      image?: Photo;
      diagram?: Diagram;
    }
  | { type: "break" };

export type ProjectPage = {
  platform: string;
  builtWith: string;
  hosting?: string;
  status: string;
  blocks: Block[];
};
