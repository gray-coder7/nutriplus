"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateAndStoreRecipeImage } from "@/lib/recipe-image-generation";

export type ImageActionState = { error: string } | undefined;

// prevState/formData: unused, but required by the useActionState signature this is bound to.
export async function generateRecipeImage(
  recipeId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prevState: ImageActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData,
): Promise<ImageActionState> {
  const recipe = await prisma.recipe.findUnique({
    where: { id: recipeId },
    select: { imageStatus: true },
  });
  if (!recipe) {
    return { error: "No se encontró la receta" };
  }

  // Ya hay una generación en curso (disparada a mano o automáticamente tras
  // importar) — no se encola dos veces, solo se regresa al detalle.
  if (recipe.imageStatus !== "GENERATING") {
    await prisma.recipe.update({ where: { id: recipeId }, data: { imageStatus: "GENERATING" } });
    after(() => generateAndStoreRecipeImage(recipeId));
  }

  redirect(`/recetas/${recipeId}`);
}
