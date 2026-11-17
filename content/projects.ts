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
    tagline: "[COPY: Film Jousting tagline]",
  },
  {
    name: "Overlook",
    href: "/projects/overlook",
    tagline: "[COPY: Overlook tagline]",
  },
  {
    name: "This site",
    href: "/projects/this-site",
    tagline: "[COPY: This site tagline]",
  },
];
