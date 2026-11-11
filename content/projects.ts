export type Project = { name: string; href: string; tech: string };

// Oldest first. Tech lines are placeholder copy from the Figma mock.
export const projects: Project[] = [
  {
    name: "Film Jousting",
    href: "/projects/film-jousting",
    tech: "React Native - Typescript - REST",
  },
  { name: "Overlook", href: "/projects/overlook", tech: "React - Typescript" },
  {
    name: "This site",
    href: "/projects/this-site",
    tech: "React - Typescript - Nextjs",
  },
];
