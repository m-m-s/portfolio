import { notFound } from "next/navigation";
import { RoomLink } from "@/components/room-link";
import { projectPages } from "@/content/project-pages";
import { projects } from "@/content/projects";
import { besideText, MediaBox } from "./media";
import { RichText } from "./rich-text";
import { SettleIn } from "./settle-in";
import { Slideshow } from "./slideshow";
import type { Block } from "./types";

const betweenBlocks = "mt-10 sm:mt-12";
const nearLine = "mt-6 sm:mt-8";

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "text":
      return (
        <div className="space-y-4">
          {block.paragraphs.map((text) => (
            <p key={text}>
              <RichText text={text} />
            </p>
          ))}
        </div>
      );
    case "image":
      return <MediaBox media={block.image} full />;
    case "image-row":
      return (
        <div className="flex justify-center gap-4 sm:gap-8">
          {block.images.map((media, i) => (
            <div
              key={media.src ?? media.alt}
              className={`min-w-0 max-w-(--spacing-phone) flex-1 ${i >= (block.onPhone ?? Number.POSITIVE_INFINITY) ? "max-sm:hidden" : ""}`}
            >
              <MediaBox media={media} />
            </div>
          ))}
        </div>
      );
    case "image-text":
      return (
        <div
          className={`grid items-start gap-6 sm:gap-8 ${besideText([block.image], block.imageSide === "right")}`}
        >
          <MediaBox
            media={block.image}
            className={block.imageSide === "right" ? "sm:order-last" : ""}
          />
          <div className="space-y-4">
            {block.paragraphs.map((text) => (
              <p key={text}>
                <RichText text={text} />
              </p>
            ))}
          </div>
        </div>
      );
    case "slideshow":
      return (
        <Slideshow
          image={block.image}
          live={block.live}
          diagram={block.diagram}
          imageSide={block.imageSide}
          slides={block.slides}
        />
      );
    case "break":
      return <hr className="border-rule" />;
  }
}

export function ProjectPage({ href }: { href: string }) {
  const at = projects.findIndex((p) => p.href === href);
  const project = projects[at];
  const page = projectPages[href];
  if (!project || !page) notFound();
  const n = projects.length;
  const rows: [string, string | undefined][] = [
    ["Platform", page.platform],
    ["Hosting", page.hosting],
    ["Status", page.status],
    ["Repo", page.repo],
    ["Built with", page.builtWith],
  ];
  const info = rows.filter((row): row is [string, string] => Boolean(row[1]));
  const [before, after] = [projects[(at - 1 + n) % n], projects[(at + 1) % n]];

  return (
    <main className="flex-1 overflow-x-clip px-4 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10">
      <div className="mx-auto max-w-2xl leading-relaxed xl:max-w-[50rem] 2xl:max-w-[58rem]">
        <SettleIn order={0} className="flex items-start justify-between gap-6">
          <h1 className="text-5xl font-bold sm:text-6xl">{project.name}</h1>
          <RoomLink
            href="/projects"
            className="shrink-0 font-grotesk text-sm hover:underline"
          >
            ← Projects
          </RoomLink>
        </SettleIn>
        <SettleIn order={1}>
          <hr className="mt-5 border-rule sm:mt-6" />
          <dl
            className={`${nearLine} flex flex-wrap gap-x-12 gap-y-5 *:last:basis-full`}
          >
            {info.map(([label, value]) => (
              <div key={label}>
                <dt className="font-grotesk text-xs tracking-wider text-ink/65 uppercase">
                  {label}
                </dt>
                <dd className="mt-1 text-sm">
                  <RichText text={value} />
                </dd>
              </div>
            ))}
          </dl>
          <hr className={`${nearLine} border-rule`} />
        </SettleIn>
        <div className={nearLine}>
          {page.blocks.map((block, i) => (
            <SettleIn
              // biome-ignore lint/suspicious/noArrayIndexKey: blocks are fixed content, never reordered.
              key={i}
              id={block.type === "slideshow" ? block.id : undefined}
              order={i + 2}
              className={
                i === 0
                  ? ""
                  : block.type === "break" ||
                      page.blocks[i - 1].type === "break"
                    ? nearLine
                    : betweenBlocks
              }
            >
              <BlockView block={block} />
            </SettleIn>
          ))}
          <SettleIn order={page.blocks.length + 2} className={nearLine}>
            <nav
              aria-label="Other projects"
              className="flex justify-between gap-8 border-t border-rule pt-8 font-grotesk sm:pt-10"
            >
              <RoomLink href={before.href} className="hover:underline">
                ← {before.name}
              </RoomLink>
              <RoomLink href={after.href} className="hover:underline">
                {after.name} →
              </RoomLink>
            </nav>
          </SettleIn>
        </div>
      </div>
    </main>
  );
}
