import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

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
