import { DoorLink } from "@/components/door-link";
import { aboutHeading, aboutLinks } from "@/content/about";

export default function About() {
  return (
    <main className="flex-1 px-4 py-12 sm:px-8">
      <h1 className="text-4xl font-bold">{aboutHeading}</h1>
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
