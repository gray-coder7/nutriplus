import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { MealType } from "@/generated/prisma/enums";

const mealPlanItemInclude = {
  recipe: {
    select: { id: true, name: true, mealTypes: true, caloriesPerServing: true },
  },
} satisfies Prisma.MealPlanItemInclude;

export type MealPlanItemWithRecipe = Prisma.MealPlanItemGetPayload<{
  include: typeof mealPlanItemInclude;
}>;

export function getMealPlanForWeek(weekStartDate: Date) {
  return prisma.mealPlan.findUnique({
    where: { weekStartDate },
    include: { items: { include: mealPlanItemInclude } },
  });
}

export async function getOrCreateMealPlan(weekStartDate: Date) {
  const existing = await prisma.mealPlan.findUnique({ where: { weekStartDate } });
  if (existing) return existing;
  return prisma.mealPlan.create({ data: { weekStartDate } });
}

/**
 * Usado tanto por el form de cada slot del planeador (src/components/plan-slot.tsx)
 * como por el diálogo "Agregar al plan" del detalle de receta
 * (src/components/add-to-plan-button.tsx) — misma escritura, dos puntos de entrada.
 */
export async function addMealPlanItem({
  weekStartDate,
  dayOfWeek,
  mealType,
  recipeId,
  servings,
}: {
  weekStartDate: Date;
  dayOfWeek: number;
  mealType: MealType;
  recipeId: string;
  servings: number;
}) {
  const mealPlan = await getOrCreateMealPlan(weekStartDate);
  return prisma.mealPlanItem.create({
    data: { mealPlanId: mealPlan.id, recipeId, dayOfWeek, mealType, servings },
  });
}
