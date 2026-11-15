import type { ProjectPage } from "@/features/project-page/types";

/** Placeholder blocks, one of each type, until the copy and images are in. */
export const thisSite: ProjectPage = {
  platform: "[COPY: This site platform]",
  builtWith: "[COPY: This site built with], Claude Code",
  blocks: [
    { type: "paragraph", text: "[COPY: This site intro]" },
    {
      type: "image-text",
      image: { alt: "[IMAGE: This site 1]", ratio: 3 / 2 },
      imageSide: "left",
      text: "[COPY: This site paragraph beside image 1]",
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
    { type: "paragraph", text: "[COPY: This site closing]" },
    {
      type: "paragraph",
      text: "[COPY: Open-Meteo credit, linking to open-meteo.com]",
    },
  ],
};
