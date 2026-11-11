import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

export default function Lab() {
  return <PlaceholderPage name="Lab" />;
}
