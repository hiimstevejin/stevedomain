import type { ReactNode } from "react";

type CardProps = {
  /** Widget title shown in the header. Omit for a bare surface. */
  title?: string;
  /** Emoji or small node rendered in the header pill. */
  icon?: ReactNode;
  /** Pastel accent token used for the header pill background. */
  accent?: "blush" | "lavender" | "mint" | "butter" | "peach" | "sky";
  /** Action node rendered on the right side of the header. */
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
};

const accentBg: Record<NonNullable<CardProps["accent"]>, string> = {
  blush: "bg-blush",
  lavender: "bg-lavender",
  mint: "bg-mint",
  butter: "bg-butter",
  peach: "bg-peach",
  sky: "bg-sky",
};

export function Card({
  title,
  icon,
  accent = "blush",
  action,
  className = "",
  bodyClassName = "",
  children,
}: CardProps) {
  return (
    <section
      className={`bg-card/80 shadow-soft flex flex-col rounded-[var(--radius-cozy)] p-5 backdrop-blur-sm ring-1 ring-white/60 ${className}`}
    >
      {(title || action) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {icon != null && (
              <span
                className={`${accentBg[accent]} flex h-9 w-9 items-center justify-center rounded-2xl text-lg`}
                aria-hidden
              >
                {icon}
              </span>
            )}
            {title && (
              <h2 className="text-cocoa text-lg font-bold">{title}</h2>
            )}
          </div>
          {action}
        </header>
      )}
      <div className={`flex min-h-0 flex-1 flex-col ${bodyClassName}`}>
        {children}
      </div>
    </section>
  );
}
