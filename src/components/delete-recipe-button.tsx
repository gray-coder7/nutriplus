"use client";

import { useTransition } from "react";
import { deleteRecipe } from "@/app/recetas/actions";
import { Button } from "@/components/ui/button";

export function DeleteRecipeButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="danger"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("¿Eliminar esta receta? No se puede deshacer.")) return;
        startTransition(() => {
          deleteRecipe(id);
        });
      }}
    >
      {pending ? "Eliminando..." : "Eliminar"}
    </Button>
  );
}
