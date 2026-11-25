export type Project = {
  name: string;
  href: string;
  /** A few words on what the project is, under its name on Projects. */
  tagline: string;
};

// Oldest first.
export const projects: Project[] = [
  {
    name: "Film Jousting",
    href: "/projects/film-jousting",
    tagline: "Film discovery with a tournament mechanic",
  },
  {
    name: "Overlook",
    href: "/projects/overlook",
    tagline: "A living library for saved images",
  },
  {
    name: "This site",
    href: "/projects/this-site",
    tagline: "The portfolio you're in right now",
  },
];
