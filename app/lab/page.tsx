import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

// Private workbench for building and tuning the sky. Not linked anywhere.
export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

export default function Lab() {
  return <PlaceholderPage name="lab" />;
}
