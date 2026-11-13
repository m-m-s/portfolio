import { DoorLink } from "@/components/door-link";
import { Window } from "@/components/window";
import { aboutHeading, aboutLinks } from "@/content/about";

export default function About() {
  return (
    <main className="flex-1 px-4 py-12 sm:px-8">
      <div className="flex items-start justify-between gap-6">
        <h1 className="text-4xl font-bold">{aboutHeading}</h1>
        <Window className="w-24 shrink-0 sm:mr-[8%] sm:w-56" />
      </div>
      <p className="mt-6">[COPY: about paragraphs]</p>
      <ul className="mt-6 space-y-2 font-bold">
        {aboutLinks.map(({ text, href }) => (
          <li key={text}>
            {href?.startsWith("/") ? (
              <DoorLink href={href}>{text}</DoorLink>
            ) : href ? (
              <a href={href} className="hover:underline">
                {text}
              </a>
            ) : (
              text
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
