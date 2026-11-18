"use client";

/**
 * A button that wraps across lines like the text around it. A real <button>
 * stays one box, so a long phrase near a line's end jumps whole to the next line.
 */
export function InlineButton({
  onClick,
  onPointerDown,
  className = "",
  children,
  ...aria
}: {
  onClick: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
  className?: string;
  children: React.ReactNode;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: "dialog";
}) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: see above; role, focus and keys make it a button.
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={`cursor-pointer ${className}`}
      {...aria}
    >
      {children}
    </span>
  );
}
