import Link from "next/link";
import { generateOrRegenerateShoppingList } from "@/app/listas/actions";
import { Icon } from "@/components/icon-sprite";
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
  mondayOf,
  parseWeekParam,
  toDateParam,
  weekdayIndex,
} from "@/lib/week";

export default async function PlanPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; day?: string }>;
}) {
  const params = await searchParams;
  const weekStartDate = parseWeekParam(params.week);
  const weekParam = toDateParam(weekStartDate);
  const isThisWeek = weekParam === toDateParam(mondayOf(new Date()));

  const dayParamNum = Number(params.day);
  const defaultDay = isThisWeek ? weekdayIndex(new Date()) : 0;
  const selectedDay =
    Number.isInteger(dayParamNum) && dayParamNum >= 0 && dayParamNum <= 6
      ? dayParamNum
      : defaultDay;

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

  // Día anterior/siguiente cruzando el límite de semana, para poder ir
  // "recorriendo" los días sin quedar atorado al llegar a lunes/domingo.
  const prevDayHref =
    selectedDay === 0
      ? `/plan?week=${prevWeekParam}&day=6`
      : `/plan?week=${weekParam}&day=${selectedDay - 1}`;
  const nextDayHref =
    selectedDay === 6
      ? `/plan?week=${nextWeekParam}&day=0`
      : `/plan?week=${weekParam}&day=${selectedDay + 1}`;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-10 sm:py-11">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold">Planeador semanal</h1>
          <p className="mt-1 text-sm text-ink-soft">{formatWeekRangeLabel(weekStartDate)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-1.5 text-sm font-bold sm:flex">
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
            <div className="h-2 w-[90px] overflow-hidden rounded-full bg-border sm:w-[120px]">
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

      {/* Desktop: grid completo de la semana */}
      <div className="mt-7 hidden overflow-x-auto sm:block">
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

      {/* Mobile: un día a la vez, recorrible como tarjetas */}
      <div className="mt-6 sm:hidden">
        <div className="mb-3 flex items-center justify-between text-xs font-bold text-ink-soft">
          <Link href={`/plan?week=${prevWeekParam}`} className="rounded-full px-2.5 py-1.5">
            « Semana
          </Link>
          <Link
            href={`/plan?week=${thisWeekParam}`}
            className="rounded-full bg-surface px-3 py-1.5 text-coral-dark"
          >
            Hoy
          </Link>
          <Link href={`/plan?week=${nextWeekParam}`} className="rounded-full px-2.5 py-1.5">
            Semana »
          </Link>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Link
            href={prevDayHref}
            aria-label="Día anterior"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border bg-surface text-ink-soft"
          >
            <Icon name="chevron-right" size={16} className="rotate-180" />
          </Link>
          <div className="grid flex-1 grid-cols-7 gap-1.5">
            {WEEKDAY_LABELS.map((label, dayIndex) => {
              const active = dayIndex === selectedDay;
              const hasItems = MEAL_TYPE_ORDER.some((mt) =>
                itemsBySlot.has(`${dayIndex}-${mt}`),
              );
              return (
                <Link
                  key={label}
                  href={`/plan?week=${weekParam}&day=${dayIndex}`}
                  className={`flex flex-col items-center gap-0.5 rounded-xl py-1.5 text-center ${
                    active ? "bg-coral text-white" : "bg-surface text-ink"
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase opacity-80">
                    {label.slice(0, 1)}
                  </span>
                  <span className="text-[13px] font-bold">
                    {addDays(weekStartDate, dayIndex).getUTCDate()}
                  </span>
                  <span
                    className={`h-1 w-1 rounded-full ${
                      hasItems ? (active ? "bg-white" : "bg-lime") : "bg-transparent"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
          <Link
            href={nextDayHref}
            aria-label="Día siguiente"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-[1.5px] border-border bg-surface text-ink-soft"
          >
            <Icon name="chevron-right" size={16} />
          </Link>
        </div>

        <h2 className="mb-3 text-lg font-semibold">
          {WEEKDAY_LABELS[selectedDay]} {addDays(weekStartDate, selectedDay).getUTCDate()}
        </h2>

        <div className="flex flex-col gap-5">
          {MEAL_TYPE_ORDER.map((mealType) => (
            <div key={mealType}>
              <h3 className={`mb-2 text-xs font-bold ${MEAL_TYPE_TEXT_COLORS[mealType]}`}>
                {MEAL_TYPE_LABELS[mealType]}
              </h3>
              <PlanSlot
                items={itemsBySlot.get(`${selectedDay}-${mealType}`) ?? []}
                recipes={recipes}
                dayOfWeek={selectedDay}
                mealType={mealType}
                weekParam={weekParam}
                compact={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
