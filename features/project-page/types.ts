import type { Photo } from "@/content/photography";

export type Side = "left" | "right";

export type Slide = {
  title?: string;
  paragraphs: string[];
  /** Replaces the slideshow's image while this slide shows. */
  image?: Photo;
  step?: string;
  hint?: string;
};

export type Diagram = "jousting-engine";

export type Block =
  | { type: "text"; paragraphs: string[] }
  | { type: "image"; image: Photo }
  | { type: "image-row"; images: Photo[]; onPhone?: number }
  | {
      type: "image-text";
      image: Photo;
      imageSide: Side;
      paragraphs: string[];
    }
  | {
      type: "slideshow";
      /** Lets other pages link straight to it (`/projects/this-site#sky`). */
      id?: string;
      imageSide?: Side;
      slides: Slide[];
      image?: Photo;
      /** Shows a live cloud in place of `image`, which still gives its shape and alt text. */
      live?: "cloud";
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
