import { type ComponentProps } from "react";

const FIELD_CLASSES =
  "w-full rounded-lg border border-foreground/15 bg-white px-3 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-coral focus:outline-none focus:ring-2 focus:ring-coral/30";

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return (
    <label
      className={`mb-1 block text-sm font-semibold text-foreground/80 ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={`${FIELD_CLASSES} ${className}`} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={`${FIELD_CLASSES} ${className}`} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={`${FIELD_CLASSES} ${className}`} {...props} />;
}
