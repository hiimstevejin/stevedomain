import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`bg-overlay/70 text-cocoa placeholder:text-cocoa-faint ring-cocoa-faint/40 focus:ring-blush-deep w-full rounded-2xl px-4 py-2.5 text-sm ring-1 outline-none transition focus:ring-2 ${className}`}
      {...props}
    />
  );
}
