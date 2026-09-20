import Link from "next/link";
import { Icon } from "@/components/icon-sprite";
import { RecipeCard } from "@/components/recipe-card";
import { MEAL_TYPE_ORDER } from "@/lib/constants";
import { getMealPlanForWeek } from "@/lib/meal-plans";
import { listRecipes } from "@/lib/recipes";
import { getLatestShoppingListSummary } from "@/lib/shopping-list";
import { WEEKDAY_LABELS, mondayOf } from "@/lib/week";

function todayLabel(): string {
  const label = new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const QUICK_ACTIONS = [
  { href: "/recetas/nueva", label: "Agregar receta", icon: "plus", bg: "bg-coral-tint", fg: "text-coral-dark" },
  { href: "/recetas", label: "Ver biblioteca", icon: "book", bg: "bg-aqua-tint", fg: "text-aqua-dark" },
  { href: "/plan", label: "Planear semana", icon: "calendar", bg: "bg-lime-tint", fg: "text-lime-dark" },
] as const;

export default async function DashboardPage() {
  const weekStartDate = mondayOf(new Date());
  const [mealPlan, recentRecipes, listSummary] = await Promise.all([
    getMealPlanForWeek(weekStartDate),
    listRecipes().then((r) => r.slice(0, 4)),
    getLatestShoppingListSummary(),
  ]);

  const slotsByDay = new Map<number, number>();
  for (const item of mealPlan?.items ?? []) {
    slotsByDay.set(item.dayOfWeek, (slotsByDay.get(item.dayOfWeek) ?? 0) + 1);
  }
  const totalSlots = 7 * MEAL_TYPE_ORDER.length;
  const plannedSlots = mealPlan?.items.length ?? 0;
  const progressPercent = Math.round((plannedSlots / totalSlots) * 100);
  // "Planeado" = el día tiene al menos una comida asignada (no las 5) —
  // se siente más justo que exigir el día completo para el check verde.
  const daysMissing = WEEKDAY_LABELS.filter((_, i) => (slotsByDay.get(i) ?? 0) === 0).length;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-10 sm:py-12">
      <div className="mb-7">
        <p className="text-[13px] font-semibold text-ink-soft sm:hidden">{todayLabel()}</p>
        <h1 className="text-2xl font-semibold sm:text-[30px]">Hola, Cuchos</h1>
        <p className="mt-1.5 hidden text-base text-ink-soft sm:block">
          {todayLabel()} · aquí tienes el resumen de tu semana.
        </p>
      </div>

      {/* Week summary */}
      <div className="mb-7 flex flex-col gap-4 rounded-3xl bg-surface p-5 shadow-[0_10px_24px_rgba(43,42,40,.06)] sm:p-7">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-semibold sm:text-xl">Tu semana</h3>
          <div className="flex items-center gap-2.5">
            <div className="hidden h-2 w-[120px] overflow-hidden rounded-full bg-border sm:block">
              <div className="h-full bg-lime" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-[13px] font-bold text-lime-dark">
              {plannedSlots}/{totalSlots}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 sm:gap-3.5">
          {WEEKDAY_LABELS.map((label, i) => {
            const complete = (slotsByDay.get(i) ?? 0) > 0;
            return (
              <div key={label} className="flex flex-col items-center gap-1.5 sm:gap-2">
                <div
                  className={`text-[10px] font-bold uppercase sm:text-xs ${complete ? "text-ink-faint" : "text-coral-dark"}`}
                >
                  {label.slice(0, 1)}
                </div>
                {complete ? (
                  <div className="flex h-[34px] w-full items-center justify-center rounded-[10px] bg-lime-tint text-lime-dark sm:h-16 sm:rounded-2xl">
                    <Icon name="check" size={16} />
                  </div>
                ) : (
                  <Link
                    href="/plan"
                    className="flex h-[34px] w-full items-center justify-center rounded-[10px] border-2 border-dashed border-[#FF8F66] bg-coral-tint text-coral-dark sm:h-16 sm:rounded-2xl"
                  >
                    <Icon name="plus" size={16} />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
        {daysMissing > 0 ? (
          <p className="text-[13px] text-ink-soft">
            Te faltan <strong className="text-ink">{daysMissing}</strong>{" "}
            {daysMissing === 1 ? "día" : "días"} por planear esta semana.
          </p>
        ) : (
          <p className="text-[13px] text-ink-soft">¡Tu semana ya está completa! 🎉</p>
        )}
        <Link
          href="/plan"
          className="flex items-center justify-center gap-1.5 rounded-full bg-coral py-3 text-sm font-bold text-white sm:hidden"
        >
          Planear los días que faltan
        </Link>
      </div>

      {/* Quick actions */}
      <div className="mb-9 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-5">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="flex flex-col gap-6 rounded-[18px] bg-surface p-4 shadow-[0_8px_20px_rgba(43,42,40,.06)] sm:gap-9 sm:rounded-[20px] sm:p-[22px]"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-[14px] sm:h-12 sm:w-12 ${action.bg} ${action.fg}`}>
              <Icon name={action.icon} size={20} />
            </span>
            <span className="flex items-center justify-between">
              <span className="text-sm font-bold sm:text-base">{action.label}</span>
              <Icon name="chevron-right" size={18} className="hidden text-ink-faint sm:block" />
            </span>
          </Link>
        ))}
        <Link
          href={listSummary ? `/listas/${listSummary.id}` : "/listas"}
          className="flex flex-col gap-6 rounded-[18px] bg-surface p-4 shadow-[0_8px_20px_rgba(43,42,40,.06)] sm:gap-9 sm:rounded-[20px] sm:p-[22px]"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-sun-tint text-sun-dark sm:h-12 sm:w-12">
            <Icon name="cart" size={20} />
          </span>
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-bold sm:text-base">
              {listSummary ? "Lista de súper activa" : "Lista de súper"}
            </span>
            {listSummary && (
              <span className="text-xs text-ink-soft">{listSummary.pending} ítems pendientes</span>
            )}
          </span>
        </Link>
      </div>

      {/* Recent recipes */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-semibold sm:text-xl">Recetas recientes</h3>
          <Link href="/recetas" className="text-[13px] font-bold text-coral-dark sm:text-sm">
            Ver todas
          </Link>
        </div>
        {recentRecipes.length === 0 ? (
          <p className="rounded-2xl bg-surface py-10 text-center text-ink-soft shadow-[0_8px_20px_rgba(43,42,40,.05)]">
            Aún no tienes recetas —{" "}
            <Link href="/recetas/nueva" className="font-bold text-coral-dark underline">
              agrega la primera
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {recentRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                id={recipe.id}
                name={recipe.name}
                mealTypes={recipe.mealTypes}
                caloriesPerServing={recipe.caloriesPerServing}
                proteinGPerServing={recipe.proteinGPerServing}
                carbsGPerServing={recipe.carbsGPerServing}
                fatGPerServing={recipe.fatGPerServing}
                imageUrl={recipe.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
