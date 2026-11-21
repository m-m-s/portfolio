import type { Metadata } from "next";
import { FilmJoustingWake } from "@/components/film-jousting-wake";
import { Footer } from "@/components/footer";
import { HouseLogo } from "@/components/house-logo";
import { WeatherClockLine } from "@/components/weather-clock-line";
import { SiteSky } from "@/features/sky/site-sky";
import { RoomTransition } from "@/features/transitions/room-transition";
import { spaceGrotesk, switzer } from "./fonts/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Maggie Shen", template: "%s · Maggie Shen" },
  description: "[COPY: site description]",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${switzer.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-page font-sans text-ink">
        <SiteSky>
          {/* Fixed at the header's inset: change both together. */}
          <HouseLogo />
          <header className="flex items-start justify-end px-4 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pt-10 2xl:px-16 2xl:pt-12">
            <WeatherClockLine />
          </header>
          <RoomTransition>{children}</RoomTransition>
          <Footer />
        </SiteSky>
        <FilmJoustingWake />
      </body>
    </html>
  );
}
