import { contactLinks } from "@/content/site";

export function Footer() {
  return (
    <footer className="[view-transition-name:footer] with-sky flex justify-end px-4 py-6 font-grotesk text-sm sm:px-8 lg:px-12 2xl:text-base lg:py-8 2xl:px-16 2xl:py-10">
      <ul className="flex gap-[3.6em]">
        {contactLinks.map(({ label, href }) => (
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
