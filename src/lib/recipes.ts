import { prisma } from "@/lib/prisma";
import type { MealType } from "@/generated/prisma/enums";

export function listRecipes(mealTypes: MealType[] = []) {
  return prisma.recipe.findMany({
    where: mealTypes.length > 0 ? { mealTypes: { hasSome: mealTypes } } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { ingredients: true } } },
  });
}

export function getRecipeById(id: string) {
  return prisma.recipe.findUnique({
    where: { id },
    include: { ingredients: { orderBy: { sortOrder: "asc" } } },
  });
}
