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
  SNACK: "Snacks",
};

/// Tag de comida: fondo (tint) + texto, tal cual el sistema de diseño.
export const MEAL_TYPE_COLORS: Record<MealType, string> = {
  BREAKFAST: "bg-[#FFF3D6] text-[#C28A00]",
  BRUNCH: "bg-[#DFF7F4] text-[#15837A]",
  LUNCH: "bg-[#FFE8DE] text-[#C2441E]",
  SNACK: "bg-[#EAF7D9] text-[#5C8A2A]",
  DINNER: "bg-[#FDE3EC] text-[#9E2C54]",
};

/// Solo el texto del tag (para labels de fila en el planeador, etc.)
export const MEAL_TYPE_TEXT_COLORS: Record<MealType, string> = {
  BREAKFAST: "text-[#C28A00]",
  BRUNCH: "text-[#15837A]",
  LUNCH: "text-[#C2441E]",
  SNACK: "text-[#5C8A2A]",
  DINNER: "text-[#9E2C54]",
};

/// Gradientes de respaldo para el hero de receta cuando aún no hay imagen
/// generada (se elige uno por id de receta para variedad visual).
export const RECIPE_FALLBACK_GRADIENTS = [
  "from-[#FFC633] to-[#FF6A3D]",
  "from-[#21C7B8] to-[#8CC63F]",
  "from-[#E14F82] to-[#FFC633]",
  "from-[#8CC63F] to-[#21C7B8]",
  "from-[#FF6A3D] to-[#E14F82]",
  "from-[#E14F82] to-[#21C7B8]",
];

export function recipeFallbackGradient(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return RECIPE_FALLBACK_GRADIENTS[hash % RECIPE_FALLBACK_GRADIENTS.length];
}

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
