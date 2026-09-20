import { prisma } from "@/lib/prisma";
import { INGREDIENT_CATEGORY_ORDER } from "@/lib/constants";
import type { IngredientCategory } from "@/generated/prisma/enums";

type ConsolidatedItem = {
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
  sourceRecipeIds: string[];
};

/** Suma los ingredientes de todas las recetas de un plan semanal, escalados
 * por las porciones que se le asignaron a cada una en el plan. */
export async function buildConsolidatedItems(mealPlanId: string): Promise<ConsolidatedItem[]> {
  const planItems = await prisma.mealPlanItem.findMany({
    where: { mealPlanId },
    include: { recipe: { include: { ingredients: true } } },
  });

  const byKey = new Map<
    string,
    { name: string; quantity: number; unit: string; category: IngredientCategory; recipeIds: Set<string> }
  >();

  for (const planItem of planItems) {
    const factor = planItem.servings / planItem.recipe.baseServings;
    for (const ingredient of planItem.recipe.ingredients) {
      const unit = ingredient.unit.trim();
      const key = `${ingredient.name.trim().toLowerCase()}|${unit.toLowerCase()}`;
      const scaledQuantity = ingredient.quantity * factor;

      const existing = byKey.get(key);
      if (existing) {
        existing.quantity += scaledQuantity;
        existing.recipeIds.add(planItem.recipeId);
      } else {
        byKey.set(key, {
          name: ingredient.name.trim(),
          quantity: scaledQuantity,
          unit,
          category: ingredient.category,
          recipeIds: new Set([planItem.recipeId]),
        });
      }
    }
  }

  return [...byKey.values()]
    .map((entry) => ({ ...entry, sourceRecipeIds: [...entry.recipeIds] }))
    .sort((a, b) => {
      const categoryDiff =
        INGREDIENT_CATEGORY_ORDER.indexOf(a.category) - INGREDIENT_CATEGORY_ORDER.indexOf(b.category);
      if (categoryDiff !== 0) return categoryDiff;
      return a.name.localeCompare(b.name, "es");
    });
}

export function getShoppingListById(id: string) {
  return prisma.shoppingList.findUnique({
    where: { id },
    include: {
      items: { orderBy: { sortOrder: "asc" } },
      mealPlan: { select: { id: true, weekStartDate: true } },
    },
  });
}

export function getShoppingListForMealPlan(mealPlanId: string) {
  return prisma.shoppingList.findFirst({
    where: { mealPlanId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getLatestShoppingListSummary() {
  const latest = await prisma.shoppingList.findFirst({
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!latest) return null;
  const pending = await prisma.shoppingListItem.count({
    where: { shoppingListId: latest.id, isChecked: false },
  });
  return { id: latest.id, pending };
}

export async function getPendingItemsCount(): Promise<number> {
  const summary = await getLatestShoppingListSummary();
  return summary?.pending ?? 0;
}

export function listShoppingLists() {
  return prisma.shoppingList.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      mealPlan: { select: { weekStartDate: true } },
      _count: { select: { items: true } },
    },
  });
}
