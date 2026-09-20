import { z } from "zod";
import { IngredientCategory, MealType } from "@/generated/prisma/enums";

export const ingredientSchema = z.object({
  name: z.string().trim().min(1, "Falta el nombre del ingrediente"),
  quantity: z.coerce.number().positive("La cantidad debe ser mayor a 0"),
  unit: z.string().trim().min(1, "Falta la unidad"),
  category: z.enum(IngredientCategory),
});

export const recipeFormSchema = z.object({
  name: z.string().trim().min(1, "Falta el nombre de la receta"),
  description: z.string().trim().min(1, "Falta la descripción"),
  mealTypes: z
    .array(z.enum(MealType))
    .min(1, "Elige al menos una etiqueta de comida"),
  baseServings: z.coerce.number().int().positive("Debe ser al menos 1 porción"),
  caloriesPerServing: z.coerce.number().int().nonnegative(),
  proteinGPerServing: z.coerce.number().nonnegative(),
  carbsGPerServing: z.coerce.number().nonnegative(),
  fatGPerServing: z.coerce.number().nonnegative(),
  instructions: z
    .array(z.string().trim().min(1))
    .min(1, "Agrega al menos un paso de preparación"),
  ingredients: z.array(ingredientSchema).min(1, "Agrega al menos un ingrediente"),
});

export type RecipeFormValues = z.infer<typeof recipeFormSchema>;
