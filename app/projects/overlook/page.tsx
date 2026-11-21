import type { Metadata } from "next";
import { projects } from "@/content/projects";
import { ProjectPage } from "@/features/project-page/project-page";

const href = "/projects/overlook";

export const metadata: Metadata = {
  title: projects.find((p) => p.href === href)?.name,
};

export default function Page() {
  return <ProjectPage href={href} />;
}
