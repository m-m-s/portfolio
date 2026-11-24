import type { ProjectPage } from "@/features/project-page/types";

/** Placeholder blocks, one of each type, until the copy and images are in. */
export const filmJousting: ProjectPage = {
  platform: "[COPY: Film Jousting platform]",
  status: "[COPY: Film Jousting status]",
  builtWith: "[COPY: Film Jousting built with], Claude Code",
  blocks: [
    { type: "text", paragraphs: ["[COPY: Film Jousting intro]"] },
    {
      type: "image-text",
      image: { alt: "[IMAGE: Film Jousting 1]", ratio: 3 / 2 },
      imageSide: "left",
      paragraphs: ["[COPY: Film Jousting paragraph beside image 1]"],
    },
    {
      type: "slideshow",
      image: { alt: "[IMAGE: Film Jousting slideshow]", ratio: 3 / 2 },
      imageSide: "left",
      slides: [
        { title: "[COPY: slide 1 title]", paragraphs: ["[COPY: slide 1]"] },
        { title: "[COPY: slide 2 title]", paragraphs: ["[COPY: slide 2]"] },
        { title: "[COPY: slide 3 title]", paragraphs: ["[COPY: slide 3]"] },
      ],
    },
    {
      type: "two-columns",
      columns: [
        "[COPY: Film Jousting left column]",
        "[COPY: Film Jousting right column]",
      ],
    },
    {
      type: "image-text",
      image: { alt: "[IMAGE: Film Jousting 2]", ratio: 3 / 2 },
      imageSide: "right",
      paragraphs: ["[COPY: Film Jousting paragraph beside image 2]"],
    },
    { type: "text", paragraphs: ["[COPY: Film Jousting closing]"] },
  ],
};
