"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { INGREDIENT_CATEGORY_LABELS } from "@/lib/constants";
import { formatQuantity } from "@/lib/format";
import type { IngredientCategory } from "@/generated/prisma/enums";

type IngredientItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: IngredientCategory;
};

export function RecipeServings({
  baseServings,
  ingredients,
}: {
  baseServings: number;
  ingredients: IngredientItem[];
}) {
  const [servings, setServings] = useState(baseServings);
  const factor = servings / baseServings;

  return (
    <>
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-foreground/70">Porciones</span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-9 rounded-full p-0 text-lg leading-none"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            disabled={servings <= 1}
            aria-label="Menos porciones"
          >
            −
          </Button>
          <span className="w-8 text-center text-lg font-bold tabular-nums">{servings}</span>
          <Button
            type="button"
            variant="secondary"
            className="h-9 w-9 rounded-full p-0 text-lg leading-none"
            onClick={() => setServings((s) => s + 1)}
            aria-label="Más porciones"
          >
            +
          </Button>
        </div>
        {servings !== baseServings && (
          <button
            type="button"
            onClick={() => setServings(baseServings)}
            className="text-xs font-medium text-coral-dark underline underline-offset-2"
          >
            Restablecer a {baseServings}
          </button>
        )}
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Ingredientes</h2>
        <ul className="flex flex-col gap-1.5">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center justify-between rounded-lg border border-foreground/10 px-3 py-2 text-sm"
            >
              <span>{ingredient.name}</span>
              <span className="flex items-center gap-2 text-foreground/60">
                <span className="tabular-nums">
                  {formatQuantity(ingredient.quantity * factor)} {ingredient.unit}
                </span>
                <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-xs">
                  {INGREDIENT_CATEGORY_LABELS[ingredient.category]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
