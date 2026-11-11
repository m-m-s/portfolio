import { projects } from "@/content/projects";

export function ProjectStub({ href }: { href: string }) {
  const project = projects.find((p) => p.href === href);
  return (
    <main className="flex-1 px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold">{project?.name}</h1>
      <p className="mt-6">[COPY: {project?.name} page]</p>
    </main>
  );
}
