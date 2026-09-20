import Link from "next/link";
import { Icon } from "@/components/icon-sprite";
import { MEAL_TYPE_COLORS, MEAL_TYPE_LABELS, recipeFallbackGradient } from "@/lib/constants";
import type { MealType } from "@/generated/prisma/enums";

export function RecipeCard({
  id,
  name,
  mealTypes,
  caloriesPerServing,
  proteinGPerServing,
  carbsGPerServing,
  fatGPerServing,
  imageUrl,
}: {
  id: string;
  name: string;
  mealTypes: MealType[];
  caloriesPerServing: number;
  proteinGPerServing: number;
  carbsGPerServing: number;
  fatGPerServing: number;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/recetas/${id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-surface shadow-[0_10px_24px_rgba(43,42,40,.07)] transition-transform hover:-translate-y-0.5"
    >
      <div
        className={`flex h-[170px] items-center justify-center bg-gradient-to-br ${recipeFallbackGradient(id)}`}
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <Icon name="food" size={40} className="text-white/55" />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap gap-1.5">
          {mealTypes.map((type) => (
            <span
              key={type}
              className={`w-fit rounded-full px-3 py-1 text-[11px] font-bold ${MEAL_TYPE_COLORS[type]}`}
            >
              {MEAL_TYPE_LABELS[type]}
            </span>
          ))}
        </div>
        <h3 className="font-display text-base font-semibold text-ink group-hover:text-coral-dark">
          {name}
        </h3>
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-ink-soft">
          <span className="flex items-center gap-1.5">
            <Icon name="flame" size={13} />
            {caloriesPerServing} kcal
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-berry" />P {proteinGPerServing}g
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-aqua" />C {carbsGPerServing}g
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sun" />G {fatGPerServing}g
          </span>
        </div>
      </div>
    </Link>
  );
}
