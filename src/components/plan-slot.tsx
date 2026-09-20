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
}: {
  items: MealPlanItemWithRecipe[];
  recipes: RecipeOption[];
  dayOfWeek: number;
  mealType: MealType;
  weekParam: string;
}) {
  const matching = recipes.filter((r) => r.mealTypes.includes(mealType));
  const rest = recipes.filter((r) => !r.mealTypes.includes(mealType));
  const boundAssign = assignMealPlanItem.bind(null, weekParam, dayOfWeek, mealType);

  return (
    <div className="flex min-h-[98px] flex-col gap-1.5">
      {items.map((item) => (
        <div key={item.id} className="rounded-[14px] border border-border bg-surface p-1.5">
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
            <span className="shrink-0 text-[9px] font-bold text-ink-faint">×{item.servings}</span>
          </Link>
        </div>
      ))}

      {recipes.length === 0 ? (
        <Link
          href="/recetas/nueva"
          className="flex min-h-[98px] items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-disabled text-center text-xs font-bold text-coral-dark"
        >
          + Recetas
        </Link>
      ) : (
        <form
          action={boundAssign}
          className="flex flex-1 flex-col justify-center gap-1 rounded-[14px] border-[1.5px] border-dashed border-disabled bg-[#FFFDFB] p-1.5"
        >
          <Select name="recipeId" defaultValue="" className="px-1.5 py-1 text-[11px]" required>
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
          <div className="flex items-center gap-1">
            <input
              type="number"
              name="servings"
              defaultValue={1}
              min={1}
              aria-label="Porciones"
              className="w-10 rounded-lg border-[1.5px] border-border px-1 py-1 text-center text-[11px] focus:border-coral focus:outline-none"
            />
            <button
              type="submit"
              className="flex-1 rounded-lg bg-coral-tint py-1 text-[11px] font-bold text-coral-dark hover:bg-coral/20"
            >
              Agregar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
