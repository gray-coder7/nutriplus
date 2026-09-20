"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateMealPlan } from "@/lib/meal-plans";
import { toDateParam } from "@/lib/week";
import type { MealType } from "@/generated/prisma/enums";

export async function assignMealPlanItem(
  weekStartDateIso: string,
  dayOfWeek: number,
  mealType: MealType,
  formData: FormData,
): Promise<void> {
  // recipeId es required en el <select>, así que el navegador ya bloquea el
  // submit si está vacío; esto es solo una red de seguridad.
  const recipeId = String(formData.get("recipeId") ?? "");
  if (!recipeId) return;

  const servingsRaw = Number(formData.get("servings"));
  const servings = Number.isFinite(servingsRaw) && servingsRaw > 0 ? Math.round(servingsRaw) : 1;

  const weekStartDate = new Date(weekStartDateIso);
  const mealPlan = await getOrCreateMealPlan(weekStartDate);

  await prisma.mealPlanItem.create({
    data: { mealPlanId: mealPlan.id, recipeId, dayOfWeek, mealType, servings },
  });

  redirect(`/plan?week=${toDateParam(weekStartDate)}`);
}

export async function removeMealPlanItem(
  itemId: string,
  weekStartDateIso: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData,
): Promise<void> {
  await prisma.mealPlanItem.delete({ where: { id: itemId } });
  redirect(`/plan?week=${weekStartDateIso}`);
}
