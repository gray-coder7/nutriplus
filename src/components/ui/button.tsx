import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const VARIANT_CLASSES = {
  primary: "bg-coral text-white shadow-[0_8px_18px_rgba(255,106,61,.35)] hover:bg-coral-dark",
  secondary: "border-2 border-coral bg-surface text-coral-dark hover:bg-coral-tint",
  danger: "bg-transparent text-error hover:bg-error/10",
} as const;

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof VARIANT_CLASSES;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:border-none disabled:bg-disabled disabled:text-ink-faint disabled:shadow-none",
        VARIANT_CLASSES[variant],
        className,
      )}
      {...props}
    />
  );
}
