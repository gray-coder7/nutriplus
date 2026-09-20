import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { GenerateImageButton } from "@/components/generate-image-button";
import { Button } from "@/components/ui/button";
import {
  INGREDIENT_CATEGORY_LABELS,
  MEAL_TYPE_COLORS,
  MEAL_TYPE_LABELS,
} from "@/lib/constants";
import { getRecipeById } from "@/lib/recipes";

const MACROS = [
  { key: "caloriesPerServing", label: "Calorías", unit: "kcal", accent: "bg-sun/20" },
  { key: "proteinGPerServing", label: "Proteína", unit: "g", accent: "bg-coral/15" },
  { key: "carbsGPerServing", label: "Carbohidratos", unit: "g", accent: "bg-turquoise/15" },
  { key: "fatGPerServing", label: "Grasa", unit: "g", accent: "bg-berry/15" },
] as const;

export default async function RecetaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="relative mb-6 flex h-56 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-sun/30 via-coral/20 to-turquoise/20">
        {recipe.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={recipe.image?.updatedAt.getTime()}
              src={
                recipe.image
                  ? `${recipe.imageUrl}?v=${recipe.image.updatedAt.getTime()}`
                  : recipe.imageUrl
              }
              alt={recipe.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-3 right-3">
              <GenerateImageButton recipeId={recipe.id} hasImage />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <span className="text-6xl">🥗</span>
            <GenerateImageButton recipeId={recipe.id} hasImage={false} />
          </div>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-1.5">
        {recipe.mealTypes.map((type) => (
          <span
            key={type}
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${MEAL_TYPE_COLORS[type]}`}
          >
            {MEAL_TYPE_LABELS[type]}
          </span>
        ))}
      </div>

      <h1 className="mb-2 text-3xl font-bold tracking-tight">{recipe.name}</h1>
      <p className="mb-6 text-foreground/70">{recipe.description}</p>

      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MACROS.map((macro) => (
          <div key={macro.key} className={`rounded-xl ${macro.accent} p-3 text-center`}>
            <div className="text-xl font-bold">{recipe[macro.key]}</div>
            <div className="text-xs font-medium text-foreground/60">
              {macro.label} ({macro.unit})
            </div>
          </div>
        ))}
      </div>

      <p className="mb-8 text-sm text-foreground/60">
        Rinde <strong>{recipe.baseServings}</strong>{" "}
        {recipe.baseServings === 1 ? "porción" : "porciones"}. Los macros de
        arriba son por porción.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Ingredientes</h2>
        <ul className="flex flex-col gap-1.5">
          {recipe.ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2 text-sm"
            >
              <span>{ingredient.name}</span>
              <span className="flex items-center gap-2 text-foreground/60">
                <span>
                  {ingredient.quantity} {ingredient.unit}
                </span>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">
                  {INGREDIENT_CATEGORY_LABELS[ingredient.category]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-bold">Preparación</h2>
        <ol className="flex flex-col gap-3">
          {recipe.instructions.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral/10 text-sm font-semibold text-coral-dark">
                {index + 1}
              </span>
              <p className="pt-0.5 text-sm text-foreground/80">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex items-center gap-3">
        <Link href={`/recetas/${recipe.id}/editar`}>
          <Button variant="secondary">Editar receta</Button>
        </Link>
        <DeleteRecipeButton id={recipe.id} />
      </div>
    </div>
  );
}
