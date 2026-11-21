import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { ProjectPlatforms } from "@/features/projects/project-platforms";

export const metadata: Metadata = { title: "Projects" };

export default function Projects() {
  return (
    // The room's wall: a layer behind the whole screen, part of this page only,
    // and the page color its window sill and label rims take their shade from.
    <main className="relative min-h-[26rem] flex-1 overflow-x-clip [--color-page:var(--color-wall)] before:fixed before:inset-0 before:-z-10 before:bg-wall">
      <ProjectPlatforms projects={projects} />
    </main>
  );
}
