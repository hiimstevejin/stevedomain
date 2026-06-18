import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "soft" | "ghost";
type Size = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-2xl font-semibold transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed cursor-pointer";

const variants: Record<Variant, string> = {
  primary:
    "bg-blush-deep text-white shadow-soft hover:brightness-105 hover:-translate-y-0.5",
  soft: "bg-overlay text-cocoa ring-1 ring-cocoa-faint/40 hover:bg-peach",
  ghost: "text-cocoa-soft hover:text-cocoa hover:bg-overlay",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  icon: "h-9 w-9 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}
