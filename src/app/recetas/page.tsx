import Link from "next/link";
import { Icon } from "@/components/icon-sprite";
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

function tagFilterHref(activeTags: MealType[], query: string, type: MealType) {
  const nextTags = activeTags.includes(type)
    ? activeTags.filter((t) => t !== type)
    : [...activeTags, type];
  const params = new URLSearchParams();
  nextTags.forEach((t) => params.append("tag", t));
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/recetas?${qs}` : "/recetas";
}

export default async function RecetasPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string | string[]; q?: string }>;
}) {
  const params = await searchParams;
  const activeTags = toTagArray(params.tag);
  const query = (params.q ?? "").trim();
  const recipes = await listRecipes(activeTags, query || undefined);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight sm:text-3xl">
            Biblioteca de recetas
          </h1>
          <p className="mt-1.5 text-sm text-ink-soft">
            {recipes.length} {recipes.length === 1 ? "receta guardada" : "recetas guardadas"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/recetas/importar">
            <Button variant="secondary">
              <Icon name="sparkles" size={16} />
              Importar con IA
            </Button>
          </Link>
          <Link href="/recetas/nueva">
            <Button>
              <Icon name="plus" size={16} />
              Nueva receta
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <form action="/recetas" className="flex max-w-md flex-1 items-center gap-2.5 rounded-full border border-border bg-surface px-5 py-2.5">
          <Icon name="search" size={17} className="text-ink-faint" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Buscar recetas…"
            className="w-full border-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-placeholder"
          />
          {activeTags.map((t) => (
            <input key={t} type="hidden" name="tag" value={t} />
          ))}
        </form>
        <div className="flex flex-wrap gap-2">
          {MEAL_TYPE_ORDER.map((type) => {
            const active = activeTags.includes(type);
            return (
              <Link
                key={type}
                href={tagFilterHref(activeTags, query, type)}
                className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition-colors ${
                  active
                    ? "border-transparent bg-coral-tint text-coral-dark"
                    : "border-border bg-surface text-[#4A4844] hover:border-coral/50"
                }`}
              >
                {MEAL_TYPE_LABELS[type]}
              </Link>
            );
          })}
        </div>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[28px] bg-surface py-20 text-center shadow-[0_10px_24px_rgba(43,42,40,.06)]">
          <span className="relative flex h-[104px] w-[104px] items-center justify-center rounded-full bg-coral-tint text-coral-dark">
            <Icon name="book" size={46} />
            <Icon name="sparkle-sm" size={16} className="absolute right-0.5 top-1.5 text-sun" />
          </span>
          <h3 className="font-display text-xl font-semibold">
            {activeTags.length > 0 || query
              ? "No hay recetas que coincidan"
              : "Aún no tienes recetas"}
          </h3>
          <p className="max-w-xs text-[14.5px] leading-[22px] text-ink-soft">
            {activeTags.length > 0 || query
              ? "Prueba con otro filtro o busca algo distinto."
              : "Agrega tu primera receta saludable y empieza a construir tu biblioteca personal."}
          </p>
          <Link href="/recetas/nueva" className="mt-1.5">
            <Button>
              <Icon name="plus" size={16} />
              Agregar receta
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              id={recipe.id}
              name={recipe.name}
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
