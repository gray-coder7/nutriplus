"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addMealPlanItem } from "@/lib/meal-plans";
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
  await addMealPlanItem({ weekStartDate, dayOfWeek, mealType, recipeId, servings });

  // Se preserva el día (además de la semana) para no regresar siempre al
  // lunes — antes el redirect perdía el ?day= y se sentía como que "saltaba"
  // de vuelta a lunes en la vista de un día a la vez en mobile.
  redirect(`/plan?week=${toDateParam(weekStartDate)}&day=${dayOfWeek}`);
}

export async function removeMealPlanItem(
  itemId: string,
  weekStartDateIso: string,
  dayOfWeek: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData,
): Promise<void> {
  await prisma.mealPlanItem.delete({ where: { id: itemId } });
  redirect(`/plan?week=${weekStartDateIso}&day=${dayOfWeek}`);
}

/**
 * Contraparte de assignMealPlanItem para el diálogo "Agregar al plan" del
 * detalle de receta (src/components/add-to-plan-button.tsx): ahí día/comida
 * se eligen dentro del diálogo (no se conocen al momento de renderizar la
 * página), así que en vez de bind() todo viaja por FormData.
 */
export async function addRecipeToPlan(formData: FormData): Promise<void> {
  const recipeId = String(formData.get("recipeId") ?? "");
  const mealType = String(formData.get("mealType") ?? "") as MealType;
  const dayOfWeek = Number(formData.get("dayOfWeek"));
  const weekStartDateIso = String(formData.get("weekStartDate") ?? "");
  if (!recipeId || !mealType || !weekStartDateIso || !Number.isFinite(dayOfWeek)) return;

  const servingsRaw = Number(formData.get("servings"));
  const servings = Number.isFinite(servingsRaw) && servingsRaw > 0 ? Math.round(servingsRaw) : 1;

  const weekStartDate = new Date(weekStartDateIso);
  await addMealPlanItem({ weekStartDate, dayOfWeek, mealType, recipeId, servings });

  redirect(`/plan?week=${toDateParam(weekStartDate)}&day=${dayOfWeek}`);
}
