import { notFound } from "next/navigation";
import { projectPages } from "@/content/project-pages";
import { projects } from "@/content/projects";
import { MediaBox } from "./media";
import { RichText } from "./rich-text";
import { SettleIn } from "./settle-in";
import { Slideshow } from "./slideshow";
import type { Block } from "./types";

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p>
          <RichText text={block.text} />
        </p>
      );
    case "image-text":
      return (
        <div className="grid items-start gap-6 sm:grid-cols-2 sm:gap-8">
          <MediaBox
            media={block.image}
            className={block.imageSide === "right" ? "sm:order-last" : ""}
          />
          <p>
            <RichText text={block.text} />
          </p>
        </div>
      );
    case "two-columns":
      return (
        <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
          {block.columns.map((text) => (
            <p key={text}>
              <RichText text={text} />
            </p>
          ))}
        </div>
      );
    case "slideshow":
      return (
        <Slideshow
          image={block.image}
          imageSide={block.imageSide}
          slides={block.slides}
        />
      );
    case "break":
      return <hr className="border-rule" />;
  }
}

export function ProjectPage({ href }: { href: string }) {
  const project = projects.find((p) => p.href === href);
  const page = projectPages[href];
  if (!project || !page) notFound();

  return (
    <main className="flex-1 overflow-x-clip px-4 py-12 sm:px-8 sm:pt-16">
      <div className="mx-auto max-w-2xl leading-relaxed">
        <h1 className="text-5xl font-bold sm:text-6xl">{project.name}</h1>
        <dl className="mt-8 flex divide-x divide-rule border-y border-rule *:px-6 *:py-5 *:first:pl-0">
          <div>
            <dt className="font-semibold">Platform</dt>
            <dd className="mt-1 text-sm">{page.platform}</dd>
          </div>
          <div>
            <dt className="font-semibold">Built with</dt>
            <dd className="mt-1 text-sm">{page.builtWith}</dd>
          </div>
        </dl>
        <div className="mt-12 space-y-12 sm:mt-16 sm:space-y-16">
          {page.blocks.map((block, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: blocks are fixed content, never reordered.
            <SettleIn key={i}>
              <BlockView block={block} />
            </SettleIn>
          ))}
        </div>
      </div>
    </main>
  );
}
