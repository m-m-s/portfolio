import type { Metadata } from "next";
import { spaceGrotesk, switzer } from "./fonts/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maggie Shen",
  description: "[COPY: site description]",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${switzer.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-page font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
