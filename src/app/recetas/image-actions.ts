"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateImage } from "@/lib/kie";
import { craftImagePrompt } from "@/lib/recipe-image-prompt";

export type ImageActionState = { error: string } | undefined;

// prevState/formData: unused, but required by the useActionState signature this is bound to.
export async function generateRecipeImage(
  recipeId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  prevState: ImageActionState,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData,
): Promise<ImageActionState> {
  try {
    const recipe = await prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      select: { name: true, description: true },
    });

    const prompt = await craftImagePrompt(recipe.name, recipe.description);
    const { data, mimeType } = await generateImage(prompt);

    await prisma.$transaction([
      prisma.recipeImage.upsert({
        where: { recipeId },
        create: { recipeId, data, mimeType },
        update: { data, mimeType },
      }),
      prisma.recipe.update({
        where: { id: recipeId },
        data: { imageUrl: `/api/recipe-images/${recipeId}`, imagePrompt: prompt },
      }),
    ]);
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : "No se pudo generar la imagen",
    };
  }

  // redirect() (en vez de solo revalidatePath) es intencional: un Server
  // Action que no redirige y tarda ~90s+ se queda sin responder cuando se
  // invoca via el fallback de formulario sin JS (probado exhaustivamente).
  // redirect() sí entrega la respuesta de forma confiable sin importar
  // cuánto tarde la acción.
  redirect(`/recetas/${recipeId}`);
}
