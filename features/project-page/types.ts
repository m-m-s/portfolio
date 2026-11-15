/** An image, or a gray placeholder of the same shape until `src` is added. */
export type Media = {
  src?: string;
  alt: string;
  /** Width over height. */
  ratio: number;
};

export type Side = "left" | "right";

export type Slide = {
  title?: string;
  paragraphs: string[];
  /** Replaces the slideshow's image while this slide shows. */
  image?: Media;
};

export type Block =
  | { type: "paragraph"; text: string }
  | { type: "image-text"; image: Media; imageSide: Side; text: string }
  | { type: "two-columns"; columns: [string, string] }
  | { type: "slideshow"; image: Media; imageSide: Side; slides: Slide[] };

export type ProjectPage = {
  platform: string;
  builtWith: string;
  blocks: Block[];
};
