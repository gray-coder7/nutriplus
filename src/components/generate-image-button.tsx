"use client";

import { useActionState } from "react";
import { generateRecipeImage } from "@/app/recetas/image-actions";
import { Icon } from "@/components/icon-sprite";
import { Button } from "@/components/ui/button";
import type { RecipeImageStatus } from "@/generated/prisma/enums";

export function GenerateImageButton({
  recipeId,
  hasImage,
  imageStatus,
  compact = false,
}: {
  recipeId: string;
  hasImage: boolean;
  imageStatus: RecipeImageStatus;
  compact?: boolean;
}) {
  const boundAction = generateRecipeImage.bind(null, recipeId);
  const [state, formAction, pending] = useActionState(boundAction, undefined);

  // imageStatus viene del servidor y sigue siendo "GENERATING" aunque la
  // acción ya haya retornado (el trabajo real sigue en segundo plano) — es
  // la señal real de "hay un job en curso", no el `pending` local del hook.
  // Mientras esté en curso, el ícono no se muestra clickeable (ni siquiera
  // deshabilitado) para no dar a entender que se puede volver a disparar y
  // encimar el request.
  const generating = pending || imageStatus === "GENERATING";

  if (compact) {
    if (generating) {
      return (
        <div
          aria-label="Generando imagen con IA"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-coral-dark"
        >
          <Icon name="sparkles" size={19} className="animate-pulse" />
        </div>
      );
    }

    return (
      <form action={formAction} className="flex flex-col items-end gap-1.5">
        <button
          type="submit"
          aria-label={hasImage ? "Regenerar imagen" : "Generar imagen con IA"}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-coral-dark"
        >
          <Icon name="sparkles" size={19} />
        </button>
        {state?.error && (
          <p className="max-w-[220px] rounded-xl bg-white/95 px-3 py-2 text-right text-xs font-medium text-error">
            {state.error}
          </p>
        )}
      </form>
    );
  }

  if (generating) {
    return (
      <div className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-semibold text-ink-soft">
        <Icon name="sparkles" size={16} className="animate-pulse" />
        Generando imagen…
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col items-center gap-2">
      <Button type="submit" variant="secondary">
        <Icon name="sparkles" size={16} />
        {hasImage ? "Regenerar imagen" : "Generar imagen con IA"}
      </Button>
      {state?.error && (
        <p className="max-w-xs text-center text-sm text-error">{state.error}</p>
      )}
    </form>
  );
}
