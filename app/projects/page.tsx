import { Window } from "@/components/window";
import { projects } from "@/content/projects";
import { ProjectPlatforms } from "@/features/projects/project-platforms";

export default function Projects() {
  return (
    <main
      data-wall
      className="relative isolate min-h-[36rem] flex-1 overflow-x-clip"
    >
      <Window
        flip
        className="absolute top-4 left-[12%] w-[40%] max-w-56 sm:left-[14%] sm:w-[18%]"
      />
      <ProjectPlatforms projects={projects} />
    </main>
  );
}
