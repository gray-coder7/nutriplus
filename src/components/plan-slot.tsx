import Link from "next/link";
import { assignMealPlanItem, removeMealPlanItem } from "@/app/plan/actions";
import { Select } from "@/components/ui/field";
import { MEAL_TYPE_LABELS, recipeFallbackGradient } from "@/lib/constants";
import type { MealPlanItemWithRecipe } from "@/lib/meal-plans";
import type { MealType } from "@/generated/prisma/enums";

type RecipeOption = { id: string; name: string; mealTypes: MealType[] };

export function PlanSlot({
  items,
  recipes,
  dayOfWeek,
  mealType,
  weekParam,
  compact = true,
}: {
  items: MealPlanItemWithRecipe[];
  recipes: RecipeOption[];
  dayOfWeek: number;
  mealType: MealType;
  weekParam: string;
  /** false = tarjetas grandes para la vista de un día en mobile. */
  compact?: boolean;
}) {
  const matching = recipes.filter((r) => r.mealTypes.includes(mealType));
  const rest = recipes.filter((r) => !r.mealTypes.includes(mealType));
  const boundAssign = assignMealPlanItem.bind(null, weekParam, dayOfWeek, mealType);

  return (
    <div className={`flex flex-col gap-1.5 ${compact ? "min-h-[98px]" : ""}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-[14px] border border-border bg-surface ${compact ? "p-1.5" : "flex items-center gap-3 p-2"}`}
        >
          {compact ? (
            <>
              <div className="relative">
                <Link href={`/recetas/${item.recipe.id}`} className="block">
                  <div
                    className={`h-8 w-full rounded-lg bg-gradient-to-br ${recipeFallbackGradient(item.recipe.id)}`}
                  />
                </Link>
                <form
                  action={removeMealPlanItem.bind(null, item.id, weekParam)}
                  className="absolute right-0.5 top-0.5"
                >
                  <button
                    type="submit"
                    className="flex h-4 w-4 items-center justify-center rounded-full bg-white/90 text-[10px] leading-none text-ink-soft hover:text-error"
                    aria-label={`Quitar ${item.recipe.name}`}
                  >
                    ×
                  </button>
                </form>
              </div>
              <Link href={`/recetas/${item.recipe.id}`} className="mt-1 flex items-baseline gap-1">
                <span className="truncate text-[10.5px] font-bold leading-[13px]">
                  {item.recipe.name}
                </span>
                <span className="shrink-0 text-[9px] font-bold text-ink-faint">
                  ×{item.servings}
                </span>
              </Link>
            </>
          ) : (
            <>
              <Link href={`/recetas/${item.recipe.id}`} className="shrink-0">
                <div
                  className={`h-14 w-14 rounded-xl bg-gradient-to-br ${recipeFallbackGradient(item.recipe.id)}`}
                />
              </Link>
              <Link href={`/recetas/${item.recipe.id}`} className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-bold">{item.recipe.name}</div>
                <div className="text-xs font-semibold text-ink-faint">×{item.servings} porciones</div>
              </Link>
              <form action={removeMealPlanItem.bind(null, item.id, weekParam)}>
                <button
                  type="submit"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-ink-faint hover:text-error"
                  aria-label={`Quitar ${item.recipe.name}`}
                >
                  ×
                </button>
              </form>
            </>
          )}
        </div>
      ))}

      {recipes.length === 0 ? (
        <Link
          href="/recetas/nueva"
          className={`flex items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-disabled text-center font-bold text-coral-dark ${
            compact ? "min-h-[98px] text-xs" : "py-3.5 text-sm"
          }`}
        >
          + Recetas
        </Link>
      ) : (
        <form
          action={boundAssign}
          className={`flex flex-col justify-center gap-1 rounded-[14px] border-[1.5px] border-dashed border-disabled bg-[#FFFDFB] ${
            compact ? "flex-1 p-1.5" : "gap-2 p-2.5"
          }`}
        >
          <Select
            name="recipeId"
            defaultValue=""
            className={compact ? "px-1.5 py-1 text-[11px]" : "text-sm"}
            required
          >
            <option value="" disabled>
              + Agregar…
            </option>
            {matching.length > 0 && (
              <optgroup label={MEAL_TYPE_LABELS[mealType]}>
                {matching.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
            )}
            {rest.length > 0 && (
              <optgroup label="Otras recetas">
                {rest.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              name="servings"
              defaultValue={1}
              min={1}
              aria-label="Porciones"
              className={`rounded-lg border-[1.5px] border-border text-center focus:border-coral focus:outline-none ${
                compact ? "w-10 px-1 py-1 text-[11px]" : "w-14 py-2 text-sm"
              }`}
            />
            <button
              type="submit"
              className={`flex-1 rounded-lg bg-coral-tint font-bold text-coral-dark hover:bg-coral/20 ${
                compact ? "py-1 text-[11px]" : "py-2 text-sm"
              }`}
            >
              Agregar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
