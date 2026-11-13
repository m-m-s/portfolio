import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SkyLab } from "@/features/sky/sky-lab";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

export default function Lab() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <SkyLab />;
}
