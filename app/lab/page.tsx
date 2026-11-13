import type { Metadata } from "next";
import { SkyLab } from "@/features/sky/sky-lab";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

export default function Lab() {
  return <SkyLab />;
}
