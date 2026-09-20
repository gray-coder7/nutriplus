import { notFound } from "next/navigation";
import { updateRecipe } from "@/app/recetas/actions";
import { RecipeForm } from "@/components/recipe-form";
import { getRecipeById } from "@/lib/recipes";

export default async function EditarRecetaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipeById(id);
  if (!recipe) notFound();

  const boundUpdateRecipe = updateRecipe.bind(null, recipe.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Editar receta</h1>
      <RecipeForm
        action={boundUpdateRecipe}
        submitLabel="Guardar cambios"
        initialValues={{
          name: recipe.name,
          description: recipe.description,
          mealTypes: recipe.mealTypes,
          baseServings: recipe.baseServings,
          caloriesPerServing: recipe.caloriesPerServing,
          proteinGPerServing: recipe.proteinGPerServing,
          carbsGPerServing: recipe.carbsGPerServing,
          fatGPerServing: recipe.fatGPerServing,
          instructions: recipe.instructions,
          ingredients: recipe.ingredients.map((ingredient) => ({
            name: ingredient.name,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            category: ingredient.category,
          })),
        }}
      />
    </div>
  );
}
