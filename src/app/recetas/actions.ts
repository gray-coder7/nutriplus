"use server";

import { after } from "next/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recipeFormSchema, recipeSourceSchema } from "@/lib/recipe-schema";
import { processRecipeImport } from "@/lib/recipe-import";
import { RecipeSourceType } from "@/generated/prisma/enums";

export type RecipeActionState = { error: string } | undefined;

function parseRecipeFormData(formData: FormData) {
  const ingredientNames = formData.getAll("ingredientName").map(String);
  const ingredientQuantities = formData.getAll("ingredientQuantity").map(String);
  const ingredientUnits = formData.getAll("ingredientUnit").map(String);
  const ingredientCategories = formData.getAll("ingredientCategory").map(String);

  const ingredients = ingredientNames
    .map((name, i) => ({
      name: name.trim(),
      quantity: ingredientQuantities[i] ?? "",
      unit: (ingredientUnits[i] ?? "").trim(),
      category: ingredientCategories[i] ?? "OTHER",
    }))
    .filter((ingredient) => ingredient.name.length > 0);

  const instructions = formData
    .getAll("instructionStep")
    .map((step) => String(step).trim())
    .filter((step) => step.length > 0);

  return recipeFormSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description"),
    mealTypes: formData.getAll("mealTypes"),
    baseServings: formData.get("baseServings"),
    caloriesPerServing: formData.get("caloriesPerServing"),
    proteinGPerServing: formData.get("proteinGPerServing"),
    carbsGPerServing: formData.get("carbsGPerServing"),
    fatGPerServing: formData.get("fatGPerServing"),
    instructions,
    ingredients,
  });
}

export async function createRecipe(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const parsed = parseRecipeFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la receta" };
  }

  const source = recipeSourceSchema.parse({
    sourceType: formData.get("sourceType") ?? undefined,
    sourceUrl: formData.get("sourceUrl") ?? undefined,
    sourceRawText: formData.get("sourceRawText") ?? undefined,
  });

  const recipe = await prisma.recipe.create({
    data: {
      name: parsed.data.name,
      description: parsed.data.description,
      mealTypes: parsed.data.mealTypes,
      baseServings: parsed.data.baseServings,
      caloriesPerServing: parsed.data.caloriesPerServing,
      proteinGPerServing: parsed.data.proteinGPerServing,
      carbsGPerServing: parsed.data.carbsGPerServing,
      fatGPerServing: parsed.data.fatGPerServing,
      instructions: parsed.data.instructions,
      sourceType: source.sourceType,
      sourceUrl: source.sourceUrl,
      sourceRawText: source.sourceRawText,
      ingredients: {
        create: parsed.data.ingredients.map((ingredient, index) => ({
          ...ingredient,
          sortOrder: index,
        })),
      },
    },
  });

  redirect(`/recetas/${recipe.id}`);
}

export async function updateRecipe(
  id: string,
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const parsed = parseRecipeFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos de la receta" };
  }

  await prisma.$transaction([
    prisma.ingredient.deleteMany({ where: { recipeId: id } }),
    prisma.recipe.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        mealTypes: parsed.data.mealTypes,
        baseServings: parsed.data.baseServings,
        caloriesPerServing: parsed.data.caloriesPerServing,
        proteinGPerServing: parsed.data.proteinGPerServing,
        carbsGPerServing: parsed.data.carbsGPerServing,
        fatGPerServing: parsed.data.fatGPerServing,
        instructions: parsed.data.instructions,
        ingredients: {
          create: parsed.data.ingredients.map((ingredient, index) => ({
            ...ingredient,
            sortOrder: index,
          })),
        },
      },
    }),
  ]);

  redirect(`/recetas/${id}`);
}

export async function deleteRecipe(id: string): Promise<void> {
  await prisma.recipe.delete({ where: { id } });
  redirect("/recetas");
}

export type ImportActionState = { error: string } | undefined;

function createImportPlaceholder(
  source: { sourceType: RecipeSourceType; sourceUrl?: string; sourceRawText?: string },
) {
  return prisma.recipe.create({
    data: {
      name: "Importando receta…",
      description: "",
      mealTypes: [],
      baseServings: 1,
      caloriesPerServing: 0,
      proteinGPerServing: 0,
      carbsGPerServing: 0,
      fatGPerServing: 0,
      instructions: [],
      importStatus: "PROCESSING",
      ...source,
    },
  });
}

/**
 * Crea de inmediato un Recipe placeholder (importStatus: PROCESSING) y
 * redirige a su detalle; la extracción con IA (y, si sale bien, la
 * generación de imagen) corren después en segundo plano via
 * processRecipeImport (ver src/lib/recipe-import.ts) para que no dependan
 * del tab/conexión del navegador y para que la receta se guarde sola, sin
 * paso de revisión manual.
 */
export async function importRecipe(
  _prevState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const mode = formData.get("mode");

  if (mode === "url") {
    const url = String(formData.get("url") ?? "").trim();
    if (!url) return { error: "Pega un link para continuar" };

    const recipe = await createImportPlaceholder({
      sourceType: RecipeSourceType.URL_IMPORT,
      sourceUrl: url,
    });
    after(() => processRecipeImport(recipe.id, { mode: "url", url }));
    redirect(`/recetas/${recipe.id}`);
  }

  const rawText = String(formData.get("rawText") ?? "").trim();
  if (rawText.length < 20) {
    return { error: "Pega el texto completo de la receta" };
  }

  const recipe = await createImportPlaceholder({
    sourceType: RecipeSourceType.TEXT_IMPORT,
    sourceRawText: rawText,
  });
  after(() => processRecipeImport(recipe.id, { mode: "text", rawText }));
  redirect(`/recetas/${recipe.id}`);
}
