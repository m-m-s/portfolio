import type { ProjectPage } from "@/features/project-page/types";
import { filmJousting } from "./film-jousting";
import { overlook } from "./overlook";
import { thisSite } from "./this-site";

/** Keyed by the project's href in content/projects.ts. */
export const projectPages: Record<string, ProjectPage> = {
  "/projects/film-jousting": filmJousting,
  "/projects/overlook": overlook,
  "/projects/this-site": thisSite,
};
