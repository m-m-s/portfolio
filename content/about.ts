import { email } from "./site";

export type AboutPart =
  | string
  | { text: string; href: string }
  | { text: string; action: "weather" | "food-map" };

export const aboutHeading = "Hi! I’m Maggie,";

export const foodMapDescription =
  "A Google Maps screenshot with New York City covered in different colored pins";

export const foodMapCredit = "Map data ©2026 Google";

export const aboutParagraphs: AboutPart[][] = [
  [
    "a product thinker, builder, and fixer. I love making tools that turn messy, real-world information into something structured and explorable, and finding fun ways to expand how people interact with their world. I’ve been building ",
    { text: "[a living library for screenshots]", href: "/projects/overlook" },
    " and ",
    {
      text: "[a way to discover movies and decide what to watch]",
      href: "/projects/film-jousting",
    },
    ".",
  ],
  [
    "I’ve always been curious about people and everything around them. The history behind a habit, the culture behind a taste, the room they’re standing in. Even the ",
    { text: "[weather]", action: "weather" },
    ", which says more about how people behave than we give it credit for.",
  ],
  [
    "Previously, I spent seven years working on consumer products, tech, and business software, at agencies, a consultancy, and a handful of startups. I’ve run campaigns in over 30 markets, worked on strategy with leadership teams, and set up a startup’s marketing from the ground up. Along the way I learned how to think through what users need, what clients are trying to achieve, and how to get product, design, and sales on the same page.",
  ],
  [
    "When I’m not coding, I’m usually ",
    { text: "[behind a camera]", href: "/photography" },
    ", watching a film, or ",
    { text: "[thinking about my next meal]", action: "food-map" },
    ".",
  ],
  [
    "Next, I want to help ",
    { text: "[a team I care about]", href: `mailto:${email}` },
    " build bigger, more complex systems.",
  ],
];
