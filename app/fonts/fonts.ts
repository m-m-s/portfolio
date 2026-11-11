import localFont from "next/font/local";

// Switzer: the standard typeface. Variable files cover every weight.
export const switzer = localFont({
  src: [
    { path: "./Switzer-Variable.woff2", weight: "100 900", style: "normal" },
    {
      path: "./Switzer-VariableItalic.woff2",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
});

// Space Grotesk Regular: homepage connecting words, weather/clock line, footer.
export const spaceGrotesk = localFont({
  src: "./SpaceGrotesk-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-space-grotesk",
  display: "swap",
});
