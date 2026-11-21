import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { ProjectPlatforms } from "@/features/projects/project-platforms";

export const metadata: Metadata = { title: "Projects" };

export default function Projects() {
  return (
    <main className="relative min-h-[26rem] flex-1 overflow-x-clip [--color-page:var(--color-wall)] before:fixed before:inset-0 before:-z-10 before:bg-wall">
      <ProjectPlatforms projects={projects} />
    </main>
  );
}
