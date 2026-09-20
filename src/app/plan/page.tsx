import Link from "next/link";
import { generateOrRegenerateShoppingList } from "@/app/listas/actions";
import { PlanSlot } from "@/components/plan-slot";
import { Button } from "@/components/ui/button";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER, MEAL_TYPE_TEXT_COLORS } from "@/lib/constants";
import { getMealPlanForWeek, type MealPlanItemWithRecipe } from "@/lib/meal-plans";
import { listRecipes } from "@/lib/recipes";
import { getShoppingListForMealPlan } from "@/lib/shopping-list";
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

  const existingShoppingList = mealPlan ? await getShoppingListForMealPlan(mealPlan.id) : null;

  const itemsBySlot = new Map<string, MealPlanItemWithRecipe[]>();
  for (const item of mealPlan?.items ?? []) {
    const key = `${item.dayOfWeek}-${item.mealType}`;
    const existing = itemsBySlot.get(key);
    if (existing) existing.push(item);
    else itemsBySlot.set(key, [item]);
  }

  const totalSlots = 7 * MEAL_TYPE_ORDER.length;
  const plannedSlots = itemsBySlot.size;
  const progressPercent = Math.round((plannedSlots / totalSlots) * 100);

  const prevWeekParam = toDateParam(addWeeks(weekStartDate, -1));
  const nextWeekParam = toDateParam(addWeeks(weekStartDate, 1));
  const thisWeekParam = toDateParam(new Date());

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-10 sm:py-11">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold">Planeador semanal</h1>
          <p className="mt-1 text-sm text-ink-soft">{formatWeekRangeLabel(weekStartDate)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-1.5 text-sm font-bold">
            <Link
              href={`/plan?week=${prevWeekParam}`}
              className="rounded-full px-3 py-1.5 text-ink-soft hover:bg-surface"
            >
              ← Anterior
            </Link>
            <Link
              href={`/plan?week=${thisWeekParam}`}
              className="rounded-full px-3 py-1.5 text-ink-soft hover:bg-surface"
            >
              Esta semana
            </Link>
            <Link
              href={`/plan?week=${nextWeekParam}`}
              className="rounded-full px-3 py-1.5 text-ink-soft hover:bg-surface"
            >
              Siguiente →
            </Link>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-[120px] overflow-hidden rounded-full bg-border">
              <div className="h-full bg-lime" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[13px] font-bold text-lime-dark">
              {plannedSlots}/{totalSlots}
            </span>
          </div>
          {mealPlan &&
            plannedSlots > 0 &&
            (existingShoppingList ? (
              <Link href={`/listas/${existingShoppingList.id}`}>
                <Button variant="secondary">Ver lista de súper</Button>
              </Link>
            ) : (
              <form action={generateOrRegenerateShoppingList.bind(null, mealPlan.id)}>
                <Button type="submit">Generar lista de súper</Button>
              </form>
            ))}
        </div>
      </div>

      {recipes.length === 0 && (
        <div className="mb-6 mt-6 rounded-2xl bg-sun-tint px-4 py-3 text-sm">
          Todavía no tienes recetas.{" "}
          <Link href="/recetas/nueva" className="font-bold underline">
            Agrega la primera
          </Link>{" "}
          para poder planear la semana.
        </div>
      )}

      <div className="mt-7 overflow-x-auto">
        <div
          className="grid min-w-[850px] gap-2.5"
          style={{ gridTemplateColumns: "96px repeat(7, minmax(128px, 1fr))" }}
        >
          <div />
          {WEEKDAY_LABELS.map((label, dayIndex) => (
            <div key={label} className="px-1 text-center">
              <div className="text-[13px] font-bold">
                {label.slice(0, 3)} {addDays(weekStartDate, dayIndex).getUTCDate()}
              </div>
            </div>
          ))}

          {MEAL_TYPE_ORDER.map((mealType) => (
            <div key={mealType} className="contents">
              <div
                className={`flex items-center text-xs font-bold ${MEAL_TYPE_TEXT_COLORS[mealType]}`}
              >
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
