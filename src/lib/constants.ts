import { IngredientCategory, MealType } from "@/generated/prisma/enums";

/// Orden cronológico del día (desayuno -> almuerzo -> comida -> snack -> cena),
/// usado en filtros, formularios y el planeador semanal.
export const MEAL_TYPE_ORDER: MealType[] = [
  MealType.BREAKFAST,
  MealType.BRUNCH,
  MealType.LUNCH,
  MealType.SNACK,
  MealType.DINNER,
];

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  BREAKFAST: "Desayuno",
  LUNCH: "Comida",
  DINNER: "Cena",
  BRUNCH: "Almuerzo",
  SNACK: "Snack",
};

export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  BREAKFAST: "bg-sun/20 text-amber-800",
  LUNCH: "bg-coral/15 text-coral-dark",
  DINNER: "bg-turquoise/15 text-teal-800",
  BRUNCH: "bg-berry/15 text-pink-800",
  SNACK: "bg-lime/20 text-lime-900",
};

export const INGREDIENT_CATEGORY_ORDER: IngredientCategory[] = [
  IngredientCategory.PRODUCE,
  IngredientCategory.PROTEIN,
  IngredientCategory.DAIRY,
  IngredientCategory.PANTRY,
  IngredientCategory.SPICES,
  IngredientCategory.FROZEN,
  IngredientCategory.BEVERAGES,
  IngredientCategory.OTHER,
];

export const INGREDIENT_CATEGORY_LABELS: Record<IngredientCategory, string> = {
  PRODUCE: "Frutas y verduras",
  PROTEIN: "Proteína",
  DAIRY: "Lácteos",
  PANTRY: "Despensa",
  SPICES: "Especias",
  FROZEN: "Congelados",
  BEVERAGES: "Bebidas",
  OTHER: "Otro",
};
