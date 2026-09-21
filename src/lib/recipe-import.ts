import { prisma } from "@/lib/prisma";
import { extractRecipeFromText, fetchUrlContent } from "@/lib/recipe-extraction";
import { generateAndStoreRecipeImage } from "@/lib/recipe-image-generation";

export type RecipeImportInput =
  | { mode: "text"; rawText: string }
  | { mode: "url"; url: string };

/**
 * Corre en segundo plano (dentro de after(), ver importRecipe en
 * src/app/recetas/actions.ts) tras crear el Recipe placeholder. Extrae la
 * receta con IA, la guarda, y si todo salió bien encadena la generación de
 * imagen automáticamente — así Jorge no tiene que acordarse de generarla.
 */
export async function processRecipeImport(
  recipeId: string,
  input: RecipeImportInput,
): Promise<void> {
  try {
    const { contextText } =
      input.mode === "url" ? await fetchUrlContent(input.url) : { contextText: input.rawText };

    const values = await extractRecipeFromText(contextText);

    await prisma.$transaction([
      prisma.ingredient.deleteMany({ where: { recipeId } }),
      prisma.recipe.update({
        where: { id: recipeId },
        data: {
          name: values.name,
          description: values.description,
          mealTypes: values.mealTypes,
          baseServings: values.baseServings,
          caloriesPerServing: values.caloriesPerServing,
          proteinGPerServing: values.proteinGPerServing,
          carbsGPerServing: values.carbsGPerServing,
          fatGPerServing: values.fatGPerServing,
          instructions: values.instructions,
          sourceRawText: contextText,
          importStatus: "READY",
          importError: null,
          ingredients: {
            create: values.ingredients.map((ingredient, index) => ({
              ...ingredient,
              sortOrder: index,
            })),
          },
        },
      }),
    ]);
  } catch (err) {
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        importStatus: "FAILED",
        importError:
          err instanceof Error ? err.message : "No se pudo procesar la receta, intenta de nuevo",
      },
    });
    return;
  }

  await prisma.recipe.update({ where: { id: recipeId }, data: { imageStatus: "GENERATING" } });
  await generateAndStoreRecipeImage(recipeId);
}
