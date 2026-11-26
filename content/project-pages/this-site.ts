import type { ProjectPage } from "@/features/project-page/types";

export const thisSite: ProjectPage = {
  platform: "Web",
  hosting: "Vercel",
  status: "Live at [maggiemshen.com](https://maggiemshen.com)",
  repo: "[github.com/m-m-s/portfolio](https://github.com/m-m-s/portfolio)",
  builtWith:
    "Next.js, React, TypeScript, Tailwind, Canvas (Floyd–Steinberg dithering), Open-Meteo API, Figma, Claude Code",
  blocks: [
    {
      type: "image",
      image: {
        src: "/projects/this-site/homepage-live.webp",
        alt: "The homepage: the intro text stacked into the outline of a house, its shadow beside it, under a partly cloudy dithered sky with the weather and clock line at the top",
        ratio: 1800 / 1029,
      },
    },
    {
      type: "text",
      paragraphs: [
        "If the internet is our digital world, a portfolio is the closest thing to building a home. I’ve always loved the idea that the places we make for ourselves reflect who we are. **So what happens when the entire place is meant to showcase who I am?**",
        "I wanted my home built on what I appreciate most in design: subtle excellence. Before designing anything I researched how good portfolios achieve this. The ones I liked best had a strong editorial style and one small, memorable bit of interactivity.",
      ],
    },
    {
      type: "image-text",
      image: {
        src: "/projects/this-site/type-studies.webp",
        alt: "Figma studies of the homepage intro in Inter, Switzer, Instrument Sans, and Switzer with Space Grotesk under dithered clouds",
        ratio: 1100 / 828,
      },
      imageSide: "right",
      paragraphs: [
        "I loved the idea of a house without wanting a literal one on the page. I was building a door animation for the links in my intro when I stacked the text line by line and noticed it happened to form the outline of a house. The outline stays untraced because drawing it took away the text’s editorial feel. **That house became the theme of the whole site and the structural center of the homepage.**",
        "When the house took shape it felt only natural that the space above it was the sky. **I love clouds and wanted the site’s interactivity to live inside them.** A clock and weather line at the top of every page ties that sky to live conditions in New York. Now drifting clouds reveal the house’s untraced outline as they pass behind the text while the sun casts its shadow.",
      ],
    },
    { type: "break" },
    {
      type: "slideshow",
      id: "sky",
      image: {
        alt: "A live dithered cloud whose dots scatter under the cursor or a finger",
        ratio: 1.5,
      },
      live: "cloud",
      imageSide: "left",
      slides: [
        {
          title: "Making clouds interactive",
          hint: "Try it on the cloud",
          paragraphs: [
            "I started by thinking about what makes digital interaction feel tactile on a screen made of pixels. Dithering can turn a cloud into individual pixels while keeping its shape and shading. Those dots scatter under the cursor to capture what touching a cloud feels like in your imagination. Soft and fluffy.",
            "With reduced motion turned on, the clouds stop drifting and the rain hangs still, but their dots still scatter when you touch them.",
          ],
        },
        {
          title: "Depth",
          image: {
            src: "/projects/this-site/cloud-depth.webp",
            alt: "The sky tuner previewing one front cloud at different heights, with the upper, middle, and lower bases marked",
            ratio: 1.5,
          },
          paragraphs: [
            "Giving the sky a sense of depth meant separating the clouds in space. I laid them on a grid of depth and height with three layers from near to far. For the interactive aspect, near clouds scatter quickly under the cursor while middle clouds drift apart more slowly. Each layer also has its own ink tone so farther clouds fade into lighter dots while nearer ones print darker and feel heavier.",
          ],
        },
        {
          title: "A sky for every forecast",
          image: {
            src: "/projects/this-site/cloud-library.webp",
            alt: "The sky tuner’s library of dithered clouds cut from stock photos, each with Add and Preview buttons",
            ratio: 1.5,
          },
          paragraphs: [
            "Matching New York’s live weather meant building a separate sky for every condition from clear sun to snow. I cut clouds from 42 stock photos and converted them to grayscale. Then I built a prototype sky tuner in Claude to compose each sky. Each cloud could be assigned to a layer and adjusted for size, height, contrast, brightness, and lightness before it was dithered. Once a sky looked right I saved it as a preset grouping for the sky engine.",
          ],
        },
        {
          title: "Lightness",
          image: {
            src: "/projects/this-site/sky-tuner.webp",
            alt: "The sky tuner’s partly cloudy front clouds, each with sliders for smallest and largest size, contrast, brightness, and lightness",
            ratio: 1.5,
          },
          paragraphs: [
            "Lightness was the hardest adjustment to get right. The tuner lightened a cloud by removing dots from the dithered result and left patchy holes. Lifting the gray tones in the stock image before dithering fixed it by spreading fewer dots evenly across the whole cloud.",
          ],
        },
        {
          title: "Rendering the sky",
          image: {
            src: "/projects/this-site/look-outside-rainy.webp",
            alt: "Look outside showing the Rainy sky full size: dark dithered clouds over falling rain, with the weather arrows and Refresh, Close, and More info below",
            ratio: 1625 / 1083,
          },
          paragraphs: [
            "The sky engine builds a new sky on every visit from a curated preset according to New York’s current weather. A randomly generated seed decides which clouds appear and the size and height of each one. The same sky follows visitors from page to page until they refresh. Clouds are dithered in the browser at the exact size they appear on screen to stay faithful to the shape and texture of each image.",
          ],
        },
      ],
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "The rest of the site carries the house and the sky through in smaller details. That same house shape turned into the favicon and the home button that brings you back to the front door. I chose Space Grotesk for the type partly because its square-tailed y looks like the corner of a house. A window on the About and Projects pages displays the same live sky beside the copy.",
        "Building the site took the same discipline as designing it. I designed every page in Figma and wrote a spec for each component before writing any code. **Those specs made the work divisible across several Claude Code agents running in parallel on separate branches.** I reviewed each branch before merging it and fixed any code that fell short of my standards.",
      ],
    },
    {
      type: "image",
      image: {
        src: "/projects/this-site/page-studies.webp",
        alt: "Figma studies of the About page, with the window and its sky beside the copy, above studies of the Projects page, with the projects as steps of a staircase, on desktop and phone",
        ratio: 1679 / 881,
      },
    },
    { type: "break" },
    {
      type: "text",
      paragraphs: [
        "That’s the house. I’m glad you stopped by. There will be more to see as new work moves in. Make yourself at home while you’re here and come back on a rainy day.",
      ],
    },
  ],
};
