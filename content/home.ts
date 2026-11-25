type IntroPart = { text: string; href?: string };

export const intro: IntroPart[][] = [
  [{ text: "Hi, I’m" }],
  [{ text: "Maggie Shen", href: "/about" }, { text: ", a" }],
  [{ text: "Product Engineer", href: "/projects" }],
  [{ text: "and " }, { text: "Photographer", href: "/photography" }],
  [{ text: "in New York City !" }],
];
