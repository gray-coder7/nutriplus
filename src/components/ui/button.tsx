import { type ComponentProps } from "react";

const VARIANT_CLASSES = {
  primary: "bg-coral text-white hover:bg-coral-dark",
  secondary: "border border-foreground/15 bg-transparent hover:bg-foreground/5",
  danger: "bg-transparent text-red-600 hover:bg-red-50",
} as const;

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof VARIANT_CLASSES;
};

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
