import Image from "next/image";
import type { Photo } from "@/content/photography";

const SIZES = {
  half: "(min-width: 1536px) 29rem, (min-width: 1280px) 25rem, (min-width: 640px) 21rem, 100vw",
  full: "(min-width: 1536px) 58rem, (min-width: 1280px) 50rem, (min-width: 640px) 42rem, 100vw",
  phone: "14rem",
};

export const isPhone = (media: Photo) => media.ratio < 1;

export function besideText(media: Photo[], imageRight: boolean) {
  if (media.length === 0 || !media.every(isPhone)) return "sm:grid-cols-2";
  return imageRight
    ? "sm:justify-center sm:grid-cols-[minmax(0,var(--spacing-beside-phone))_var(--spacing-phone)]"
    : "sm:justify-center sm:grid-cols-[var(--spacing-phone)_minmax(0,var(--spacing-beside-phone))]";
}

export function MediaBox({
  media,
  full = false,
  className = "",
}: {
  media: Photo;
  full?: boolean;
  className?: string;
}) {
  const phone = isPhone(media);
  return (
    <div
      style={{ aspectRatio: media.ratio }}
      className={`relative overflow-hidden bg-placeholder ${phone ? "mx-auto w-full max-w-(--spacing-phone) rounded-phone ring-1 ring-rule" : "w-full ring-1 ring-rule"} ${className}`}
    >
      {media.src ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={SIZES[phone ? "phone" : full ? "full" : "half"]}
          className="object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={media.alt}
          className="grid h-full place-items-center p-4 text-center text-xs text-ink/40"
        >
          {media.alt}
        </div>
      )}
    </div>
  );
}
