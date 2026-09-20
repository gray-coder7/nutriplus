import { createRecipe } from "@/app/recetas/actions";
import { RecipeForm } from "@/components/recipe-form";

export default function NuevaRecetaPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-12">
      <h1 className="mb-8 text-[28px] font-semibold sm:text-3xl">Nueva receta</h1>
      <RecipeForm action={createRecipe} submitLabel="Crear receta" />
    </div>
  );
}
