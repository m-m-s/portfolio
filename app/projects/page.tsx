import { DoorLink } from "@/components/door-link";
import { projects } from "@/content/projects";

export default function Projects() {
  return (
    <main className="flex-1 px-4 py-12 sm:px-8">
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
