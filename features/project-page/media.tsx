import Image from "next/image";
import type { Photo } from "@/content/photography";

/** Half the content column on a laptop, full width on a phone. */
const SIZES = "(min-width: 640px) 24rem, 100vw";

export function MediaBox({
  media,
  className = "",
}: {
  media: Photo;
  className?: string;
}) {
  return (
    <div
      style={{ aspectRatio: media.ratio }}
      className={`relative w-full overflow-hidden bg-placeholder ${className}`}
    >
      {media.src ? (
        <Image
          src={media.src}
          alt={media.alt}
          fill
          sizes={SIZES}
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
