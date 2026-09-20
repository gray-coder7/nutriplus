"use client";

import { useActionState } from "react";
import { generateRecipeImage } from "@/app/recetas/image-actions";
import { Icon } from "@/components/icon-sprite";
import { Button } from "@/components/ui/button";

export function GenerateImageButton({
  recipeId,
  hasImage,
  compact = false,
}: {
  recipeId: string;
  hasImage: boolean;
  compact?: boolean;
}) {
  const boundAction = generateRecipeImage.bind(null, recipeId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  if (compact) {
    return (
      <form action={formAction} className="flex flex-col items-end gap-1.5">
        <button
          type="submit"
          disabled={pending}
          aria-label={hasImage ? "Regenerar imagen" : "Generar imagen con IA"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-coral-dark transition-opacity disabled:opacity-60"
        >
          <Icon name="sparkles" size={19} className={pending ? "animate-pulse" : ""} />
        </button>
        {state?.error && (
          <p className="max-w-[220px] rounded-xl bg-white/95 px-3 py-2 text-right text-xs font-medium text-error">
            {state.error}
          </p>
        )}
      </form>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-center gap-2">
      <Button type="submit" variant="secondary" disabled={pending}>
        <Icon name="sparkles" size={16} />
        {pending ? "Generando imagen…" : hasImage ? "Regenerar imagen" : "Generar imagen con IA"}
      </Button>
      {state?.error && (
        <p className="max-w-xs text-center text-sm text-error">{state.error}</p>
      )}
    </form>
  );
}
