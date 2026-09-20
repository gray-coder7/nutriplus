import Link from "next/link";
import { RecipeCard } from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/lib/constants";
import { listRecipes } from "@/lib/recipes";
import { MealType } from "@/generated/prisma/enums";

function toTagArray(value: string | string[] | undefined): MealType[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.filter((v): v is MealType =>
    (MEAL_TYPE_ORDER as string[]).includes(v),
  );
}

function tagFilterHref(activeTags: MealType[], type: MealType) {
  const nextTags = activeTags.includes(type)
    ? activeTags.filter((t) => t !== type)
    : [...activeTags, type];
  const params = new URLSearchParams();
  nextTags.forEach((t) => params.append("tag", t));
  const qs = params.toString();
  return qs ? `/recetas?${qs}` : "/recetas";
}

export default async function RecetasPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[] }>;
}) {
  const params = await searchParams;
  const activeTags = toTagArray(params.tag);
  const recipes = await listRecipes(activeTags);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Recetas</h1>
        <div className="flex gap-2">
          <Link href="/recetas/importar">
            <Button variant="secondary">✨ Importar con IA</Button>
          </Link>
          <Link href="/recetas/nueva">
            <Button>+ Nueva receta</Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {MEAL_TYPE_ORDER.map((type) => {
          const active = activeTags.includes(type);
          return (
            <Link
              key={type}
              href={tagFilterHref(activeTags, type)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "border-coral bg-coral text-white"
                  : "border-foreground/15 text-foreground/70 hover:border-coral/50"
              }`}
            >
              {MEAL_TYPE_LABELS[type]}
            </Link>
          );
        })}
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-foreground/15 py-20 text-center">
          <span className="text-4xl">🍽️</span>
          <p className="text-foreground/60">
            {activeTags.length > 0
              ? "No hay recetas con esas etiquetas todavía."
              : "Todavía no agregas ninguna receta."}
          </p>
          <Link href="/recetas/nueva">
            <Button>Agregar la primera receta</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
              description={recipe.description}
              mealTypes={recipe.mealTypes}
              caloriesPerServing={recipe.caloriesPerServing}
              imageUrl={recipe.imageUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
