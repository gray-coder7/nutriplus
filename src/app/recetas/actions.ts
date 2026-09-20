"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recipeFormSchema, recipeSourceSchema } from "@/lib/recipe-schema";
import { extractRecipeFromText, fetchUrlContent } from "@/lib/recipe-extraction";
import { RecipeSourceType } from "@/generated/prisma/enums";
import type { RecipeFormInitialValues } from "@/components/recipe-form";

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

export type ImportActionState =
  | { status: "error"; error: string }
  | {
      status: "success";
      values: RecipeFormInitialValues;
      sourceType: RecipeSourceType;
      sourceUrl?: string;
      sourceRawText: string;
      warning?: string;
    }
  | undefined;

export async function extractRecipe(
  _prevState: ImportActionState,
  formData: FormData,
): Promise<ImportActionState> {
  const mode = formData.get("mode");

  try {
    let contextText: string;
    let sourceType: RecipeSourceType;
    let sourceUrl: string | undefined;
    let warning: string | undefined;

    if (mode === "url") {
      const url = String(formData.get("url") ?? "").trim();
      if (!url) return { status: "error", error: "Pega un link para continuar" };

      const result = await fetchUrlContent(url);
      contextText = result.contextText;
      warning = result.warning;
      sourceType = RecipeSourceType.URL_IMPORT;
      sourceUrl = url;
    } else {
      const rawText = String(formData.get("rawText") ?? "").trim();
      if (rawText.length < 20) {
        return { status: "error", error: "Pega el texto completo de la receta" };
      }
      contextText = rawText;
      sourceType = RecipeSourceType.TEXT_IMPORT;
    }

    const values = await extractRecipeFromText(contextText);

    return {
      status: "success",
      values,
      sourceType,
      sourceUrl,
      sourceRawText: contextText,
      warning,
    };
  } catch (err) {
    return {
      status: "error",
      error:
        err instanceof Error
          ? err.message
          : "No se pudo procesar la receta, intenta de nuevo",
    };
  }
}
