import { prisma } from "@/lib/prisma";
import type { MealType } from "@/generated/prisma/enums";

export function listRecipes(mealTypes: MealType[] = [], query?: string) {
  return prisma.recipe.findMany({
    where: {
      mealTypes: mealTypes.length > 0 ? { hasSome: mealTypes } : undefined,
      name: query ? { contains: query, mode: "insensitive" } : undefined,
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { ingredients: true } },
      image: { select: { updatedAt: true } },
    },
  });
}

export function getRecipeById(id: string) {
  return prisma.recipe.findUnique({
    where: { id },
    include: {
      ingredients: { orderBy: { sortOrder: "asc" } },
      image: { select: { updatedAt: true } },
    },
  });
}
