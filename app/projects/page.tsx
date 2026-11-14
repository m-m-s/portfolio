import { DoorLink } from "@/components/door-link";
import { Window } from "@/components/window";
import { projects } from "@/content/projects";

export default function Projects() {
  return (
    <main className="flex-1 px-4 py-12 sm:px-8">
      <Window flip className="mb-12 w-28 sm:ml-[8%] sm:w-48" />
      <ul className="space-y-8">
        {[...projects].reverse().map(({ name, href, tech }) => (
          <li key={href}>
            <DoorLink href={href} className="text-4xl font-bold sm:text-5xl">
              {name}
            </DoorLink>
            <p className="text-sm">{tech}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
