import type { ReactNode } from "react";

export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(/\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g)) {
    parts.push(text.slice(last, m.index));
    parts.push(
      m[1] ? (
        <strong key={m.index} className="font-semibold">
          {m[1]}
        </strong>
      ) : (
        <a
          key={m.index}
          href={m[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-link underline decoration-link/35 underline-offset-2 transition-colors hover:text-link-hover hover:decoration-link-hover"
        >
          {m[2]}
        </a>
      ),
    );
    last = m.index + m[0].length;
  }
  parts.push(text.slice(last));
  return parts;
}
