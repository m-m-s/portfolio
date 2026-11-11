const LINKS = [
  { label: "Email", href: "mailto:maggiemshen@gmail.com" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/shenmaggie/" },
  { label: "GitHub", href: "https://github.com/m-m-s" },
];

export function Footer() {
  return (
    <footer className="flex justify-end px-4 py-6 font-grotesk text-sm sm:px-8">
      <ul className="flex gap-8">
        {LINKS.map(({ label, href }) => (
          <li key={label}>
            <a
              href={href}
              className="hover:underline"
              {...(href.startsWith("http") && {
                target: "_blank",
                rel: "noopener noreferrer",
              })}
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </footer>
  );
}
