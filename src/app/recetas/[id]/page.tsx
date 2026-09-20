import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { GenerateImageButton } from "@/components/generate-image-button";
import { RecipeServings } from "@/components/recipe-servings";
import { Button } from "@/components/ui/button";
import { MEAL_TYPE_COLORS, MEAL_TYPE_LABELS } from "@/lib/constants";
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

      <p className="mb-4 text-xs text-foreground/50">
        Los macros de arriba son por porción y no cambian al ajustar las
        porciones — lo que se recalcula son las cantidades de ingredientes.
      </p>

      <RecipeServings baseServings={recipe.baseServings} ingredients={recipe.ingredients} />

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
