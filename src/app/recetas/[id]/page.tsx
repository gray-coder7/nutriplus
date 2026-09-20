import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteRecipeButton } from "@/components/delete-recipe-button";
import { GenerateImageButton } from "@/components/generate-image-button";
import { Icon } from "@/components/icon-sprite";
import { RecipeServings } from "@/components/recipe-servings";
import { Button } from "@/components/ui/button";
import { MEAL_TYPE_LABELS, recipeFallbackGradient } from "@/lib/constants";
import { getRecipeById } from "@/lib/recipes";

export default async function RecetaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  return (
    <div>
      <div
        className={`relative flex h-[280px] items-center justify-center overflow-hidden bg-gradient-to-br sm:h-[340px] ${recipeFallbackGradient(recipe.id)}`}
      >
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
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
        ) : (
          <Icon name="food" size={72} className="text-white/45" />
        )}

        <Link
          href="/recetas"
          aria-label="Volver a la biblioteca"
          className="absolute left-5 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-ink sm:left-10"
        >
          <Icon name="arrow-left" />
        </Link>
        <div className="absolute right-5 top-6 sm:right-10">
          <GenerateImageButton recipeId={recipe.id} hasImage={!!recipe.imageUrl} compact />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#141e1c]/75 to-transparent" />
        <div className="absolute inset-x-5 bottom-7 flex flex-col gap-2.5 sm:inset-x-10">
          <div className="flex flex-wrap gap-2">
            {recipe.mealTypes.map((type) => (
              <span
                key={type}
                className="w-fit rounded-full bg-white px-3.5 py-1 text-xs font-bold text-aqua-dark"
              >
                {MEAL_TYPE_LABELS[type]}
              </span>
            ))}
          </div>
          <h1 className="max-w-xl text-[28px] font-semibold text-white sm:text-[38px]">
            {recipe.name}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-8 px-5 py-8 sm:flex-row sm:gap-11 sm:px-10 sm:py-11">
        {/* Left: sticky card */}
        <div className="flex w-full shrink-0 flex-col gap-6 rounded-3xl bg-surface p-6 shadow-[0_10px_24px_rgba(43,42,40,.07)] sm:w-[400px] sm:self-start">
          <RecipeServings
            baseServings={recipe.baseServings}
            ingredients={recipe.ingredients}
            caloriesPerServing={recipe.caloriesPerServing}
            proteinG={recipe.proteinGPerServing}
            carbsG={recipe.carbsGPerServing}
            fatG={recipe.fatGPerServing}
          />

          <div className="flex flex-col gap-3">
            <Link href={`/recetas/${recipe.id}/editar`}>
              <Button variant="secondary" className="w-full">
                <Icon name="pencil" size={16} />
                Editar receta
              </Button>
            </Link>
            <Link href="/plan">
              <Button className="w-full">Agregar al plan de la semana</Button>
            </Link>
            <DeleteRecipeButton id={recipe.id} />
          </div>
        </div>

        {/* Right: description + instructions */}
        <div className="flex flex-1 flex-col gap-7">
          <p className="max-w-2xl text-base leading-[26px] text-[#4A4844]">
            {recipe.description}
          </p>
          <div className="flex gap-5 text-sm font-semibold text-ink-soft">
            <span className="flex items-center gap-1.5">
              <Icon name="flame" size={16} />
              {recipe.caloriesPerServing} kcal por porción
            </span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex flex-col gap-4">
            <h2 className="text-[22px] font-semibold">Preparación</h2>
            <ol className="flex flex-col gap-4">
              {recipe.instructions.map((step, index) => (
                <li key={index} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-coral-tint text-sm font-bold text-coral-dark">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-[15px] leading-6">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
