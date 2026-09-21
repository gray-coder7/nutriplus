"use client";

import { useTransition } from "react";
import { deleteShoppingList } from "@/app/listas/actions";
import { Icon } from "@/components/icon-sprite";

export function DeleteShoppingListButton({
  id,
  className = "",
  iconOnly = false,
}: {
  id: string;
  className?: string;
  iconOnly?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="Eliminar lista"
      className={
        iconOnly
          ? `flex h-9 w-9 items-center justify-center rounded-full text-ink-faint hover:bg-error/10 hover:text-error disabled:opacity-50 ${className}`
          : `flex items-center justify-center gap-2 rounded-full border-2 border-error/30 px-6 py-3 text-sm font-bold text-error hover:bg-error/10 disabled:opacity-50 ${className}`
      }
      onClick={(event) => {
        event.preventDefault();
        if (!window.confirm("¿Eliminar esta lista de súper? No se puede deshacer.")) return;
        startTransition(() => {
          deleteShoppingList(id);
        });
      }}
    >
      <Icon name="trash" size={iconOnly ? 15 : 15} />
      {!iconOnly && (pending ? "Eliminando…" : "Eliminar lista")}
    </button>
  );
}
