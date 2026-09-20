import Link from "next/link";
import { PlanSlot } from "@/components/plan-slot";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/lib/constants";
import { getMealPlanForWeek, type MealPlanItemWithRecipe } from "@/lib/meal-plans";
import { listRecipes } from "@/lib/recipes";
import {
  WEEKDAY_LABELS,
  addDays,
  addWeeks,
  formatWeekRangeLabel,
  parseWeekParam,
  toDateParam,
} from "@/lib/week";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const params = await searchParams;
  const weekStartDate = parseWeekParam(params.week);
  const weekParam = toDateParam(weekStartDate);

  const [mealPlan, recipes] = await Promise.all([
    getMealPlanForWeek(weekStartDate),
    listRecipes(),
  ]);

  const itemsBySlot = new Map<string, MealPlanItemWithRecipe[]>();
  for (const item of mealPlan?.items ?? []) {
    const key = `${item.dayOfWeek}-${item.mealType}`;
    const existing = itemsBySlot.get(key);
    if (existing) existing.push(item);
    else itemsBySlot.set(key, [item]);
  }

  const totalSlots = 7 * MEAL_TYPE_ORDER.length;
  const plannedSlots = itemsBySlot.size;

  const prevWeekParam = toDateParam(addWeeks(weekStartDate, -1));
  const nextWeekParam = toDateParam(addWeeks(weekStartDate, 1));
  const thisWeekParam = toDateParam(new Date());

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Plan semanal</h1>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Link
            href={`/plan?week=${prevWeekParam}`}
            className="rounded-full border border-foreground/15 px-3 py-1.5 hover:border-coral/50"
          >
            ← Anterior
          </Link>
          <Link
            href={`/plan?week=${thisWeekParam}`}
            className="rounded-full border border-foreground/15 px-3 py-1.5 hover:border-coral/50"
          >
            Esta semana
          </Link>
          <Link
            href={`/plan?week=${nextWeekParam}`}
            className="rounded-full border border-foreground/15 px-3 py-1.5 hover:border-coral/50"
          >
            Siguiente →
          </Link>
        </div>
      </div>

      <p className="mb-1 text-foreground/70">{formatWeekRangeLabel(weekStartDate)}</p>
      <p className="mb-8 text-sm text-foreground/50">
        {plannedSlots} de {totalSlots} comidas planeadas esta semana
      </p>

      {recipes.length === 0 && (
        <div className="mb-6 rounded-xl bg-sun/15 px-4 py-3 text-sm">
          Todavía no tienes recetas.{" "}
          <Link href="/recetas/nueva" className="font-semibold underline">
            Agrega la primera
          </Link>{" "}
          para poder planear la semana.
        </div>
      )}

      <div className="overflow-x-auto">
        <div
          className="grid min-w-[900px] gap-2"
          style={{ gridTemplateColumns: "110px repeat(7, minmax(150px, 1fr))" }}
        >
          <div />
          {WEEKDAY_LABELS.map((label, dayIndex) => (
            <div key={label} className="px-1 text-center">
              <div className="text-sm font-bold">{label}</div>
              <div className="text-xs text-foreground/50">
                {addDays(weekStartDate, dayIndex).getUTCDate()}
              </div>
            </div>
          ))}

          {MEAL_TYPE_ORDER.map((mealType) => (
            <div key={mealType} className="contents">
              <div className="flex items-center justify-end pr-2 text-right text-sm font-semibold text-foreground/70">
                {MEAL_TYPE_LABELS[mealType]}
              </div>
              {WEEKDAY_LABELS.map((_, dayIndex) => (
                <PlanSlot
                  key={`${dayIndex}-${mealType}`}
                  items={itemsBySlot.get(`${dayIndex}-${mealType}`) ?? []}
                  recipes={recipes}
                  dayOfWeek={dayIndex}
                  mealType={mealType}
                  weekParam={weekParam}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
