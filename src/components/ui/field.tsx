import { type ComponentProps } from "react";
import { twMerge } from "tailwind-merge";

const FIELD_CLASSES =
  "w-full rounded-2xl border-[1.5px] border-border bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-placeholder focus:border-coral focus:outline-none";

export function Label({ className = "", ...props }: ComponentProps<"label">) {
  return (
    <label
      className={twMerge("mb-1.5 block text-[13px] font-bold text-[#4A4844]", className)}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }: ComponentProps<"input">) {
  return <input className={twMerge(FIELD_CLASSES, className)} {...props} />;
}

export function Textarea({ className = "", ...props }: ComponentProps<"textarea">) {
  return <textarea className={twMerge(FIELD_CLASSES, className)} {...props} />;
}

export function Select({ className = "", ...props }: ComponentProps<"select">) {
  return <select className={twMerge(FIELD_CLASSES, className)} {...props} />;
}
