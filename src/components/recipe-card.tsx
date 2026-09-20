import Link from "next/link";
import { MEAL_TYPE_COLORS, MEAL_TYPE_LABELS } from "@/lib/constants";
import type { MealType } from "@/generated/prisma/enums";

export function RecipeCard({
  id,
  name,
  description,
  mealTypes,
  caloriesPerServing,
  imageUrl,
}: {
  id: string;
  name: string;
  description: string;
  mealTypes: MealType[];
  caloriesPerServing: number;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/recetas/${id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex h-40 items-center justify-center bg-gradient-to-br from-sun/30 via-coral/20 to-turquoise/20">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-4xl">🥗</span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-semibold text-foreground group-hover:text-coral-dark">
          {name}
        </h3>
        <p className="line-clamp-2 text-sm text-foreground/60">{description}</p>
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          {mealTypes.map((type) => (
            <span
              key={type}
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MEAL_TYPE_COLORS[type]}`}
            >
              {MEAL_TYPE_LABELS[type]}
            </span>
          ))}
          <span className="ml-auto text-xs font-medium text-foreground/50">
            {caloriesPerServing} kcal
          </span>
        </div>
      </div>
    </Link>
  );
}
