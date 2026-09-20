"use client";

import { useActionState } from "react";
import { generateRecipeImage } from "@/app/recetas/image-actions";
import { Button } from "@/components/ui/button";

export function GenerateImageButton({
  recipeId,
  hasImage,
}: {
  recipeId: string;
  hasImage: boolean;
}) {
  const boundAction = generateRecipeImage.bind(null, recipeId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  return (
    <form action={formAction} className="flex flex-col items-center gap-2">
      <Button type="submit" variant={hasImage ? "secondary" : "primary"} disabled={pending}>
        {pending
          ? "Generando imagen..."
          : hasImage
            ? "🔄 Regenerar imagen"
            : "✨ Generar imagen con IA"}
      </Button>
      {state?.error && (
        <p className="max-w-xs text-center text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
