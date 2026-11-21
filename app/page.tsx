import { LiveHouse } from "@/components/house";
import { IdleSwing } from "@/components/idle-swing";

export default function Home() {
  return (
    <main className="pointer-events-none absolute inset-x-0 top-0 grid h-dvh grid-cols-[382fr_auto_618fr] grid-rows-[var(--house-above)_auto_var(--house-below)] px-4 sm:px-8">
      <div className="walk-up pointer-events-auto col-start-2 row-start-2">
        <IdleSwing>
          <LiveHouse />
        </IdleSwing>
      </div>
    </main>
  );
}
