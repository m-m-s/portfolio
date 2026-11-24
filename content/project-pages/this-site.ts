import type { ProjectPage } from "@/features/project-page/types";

/** Placeholder blocks, one of each type, until the copy and images are in. */
export const thisSite: ProjectPage = {
  platform: "[COPY: This site platform]",
  status: "[COPY: This site status]",
  builtWith: "[COPY: This site built with], Claude Code",
  blocks: [
    { type: "text", paragraphs: ["[COPY: This site intro]"] },
    {
      type: "image-text",
      image: { alt: "[IMAGE: This site 1]", ratio: 3 / 2 },
      imageSide: "left",
      paragraphs: ["[COPY: This site paragraph beside image 1]"],
    },
    {
      type: "slideshow",
      image: { alt: "[IMAGE: This site slideshow]", ratio: 3 / 2 },
      imageSide: "right",
      slides: [
        { title: "[COPY: slide 1 title]", paragraphs: ["[COPY: slide 1]"] },
        { title: "[COPY: slide 2 title]", paragraphs: ["[COPY: slide 2]"] },
        { title: "[COPY: slide 3 title]", paragraphs: ["[COPY: slide 3]"] },
      ],
    },
    {
      type: "two-columns",
      columns: [
        "[COPY: This site left column]",
        "[COPY: This site right column]",
      ],
    },
    { type: "text", paragraphs: ["[COPY: This site closing]"] },
    {
      type: "text",
      paragraphs: ["[COPY: Open-Meteo credit, linking to open-meteo.com]"],
    },
  ],
};
