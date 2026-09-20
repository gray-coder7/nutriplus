import Link from "next/link";
import { assignMealPlanItem, removeMealPlanItem } from "@/app/plan/actions";
import { Select } from "@/components/ui/field";
import { MEAL_TYPE_LABELS } from "@/lib/constants";
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
    <div className="flex min-h-[92px] flex-col gap-1 rounded-lg border border-foreground/10 bg-white p-1.5">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-1 rounded-md bg-lime/15 px-2 py-1 text-xs"
        >
          <Link
            href={`/recetas/${item.recipe.id}`}
            className="truncate font-medium text-foreground hover:underline"
            title={item.recipe.name}
          >
            {item.recipe.name}
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <span className="text-foreground/50">×{item.servings}</span>
            <form action={removeMealPlanItem.bind(null, item.id, weekParam)}>
              <button
                type="submit"
                className="leading-none text-foreground/40 hover:text-red-600"
                aria-label={`Quitar ${item.recipe.name}`}
              >
                ×
              </button>
            </form>
          </div>
        </div>
      ))}

      {recipes.length === 0 ? (
        <Link
          href="/recetas/nueva"
          className="text-center text-xs font-medium text-coral-dark hover:underline"
        >
          + Agrega recetas
        </Link>
      ) : (
        <form action={boundAssign} className="flex items-center gap-1">
          <Select name="recipeId" defaultValue="" className="px-1.5 py-1 text-xs" required>
            <option value="" disabled>
              + Agregar...
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
          <input
            type="number"
            name="servings"
            defaultValue={1}
            min={1}
            className="w-10 rounded-lg border border-foreground/15 px-1 py-1 text-center text-xs focus:border-coral focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-coral/10 px-1.5 py-1 text-xs font-semibold text-coral-dark hover:bg-coral/20"
          >
            +
          </button>
        </form>
      )}
    </div>
  );
}
