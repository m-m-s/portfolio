import localFont from "next/font/local";

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

export const spaceGrotesk = localFont({
  src: "./SpaceGrotesk-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-space-grotesk",
  display: "swap",
});
