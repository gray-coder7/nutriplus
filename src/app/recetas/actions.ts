"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { recipeFormSchema } from "@/lib/recipe-schema";

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
