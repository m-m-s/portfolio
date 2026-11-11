import { DoorLink } from "@/components/door-link";
import { IdleSwing } from "@/components/idle-swing";
import { intro } from "@/content/home";

export default function Home() {
  return (
    <main className="grid flex-1 grid-cols-[382fr_auto_618fr] grid-rows-[618fr_auto_382fr] px-4 py-12 sm:px-8">
      <div className="walk-up col-start-2 row-start-2">
        <IdleSwing>
          <h1 className="font-grotesk text-4xl leading-tight sm:text-5xl">
            {intro.map((line) => (
              <span
                key={line.map((part) => part.text).join("")}
                className="block"
              >
                {line.map((part) =>
                  part.href ? (
                    <DoorLink
                      key={part.text}
                      href={part.href}
                      className="font-sans font-bold"
                    >
                      {part.text}
                    </DoorLink>
                  ) : (
                    part.text
                  ),
                )}
              </span>
            ))}
          </h1>
        </IdleSwing>
      </div>
    </main>
  );
}
