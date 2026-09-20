"use client";

import { useState } from "react";
import { Icon } from "@/components/icon-sprite";
import { MacroRings } from "@/components/macro-rings";
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
  caloriesPerServing,
  proteinG,
  carbsG,
  fatG,
}: {
  baseServings: number;
  ingredients: IngredientItem[];
  caloriesPerServing: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}) {
  const [servings, setServings] = useState(baseServings);
  const factor = servings / baseServings;

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-bold">Porciones</span>
          {servings !== baseServings && (
            <button
              type="button"
              onClick={() => setServings(baseServings)}
              className="text-[11px] font-bold text-coral-dark underline underline-offset-2"
            >
              Restablecer
            </button>
          )}
        </div>
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => setServings((s) => Math.max(1, s - 1))}
            disabled={servings <= 1}
            aria-label="Quitar porción"
            className="flex h-9 w-9 items-center justify-center rounded-full border-[1.5px] border-border bg-surface text-[#4A4844] disabled:opacity-40"
          >
            <Icon name="minus" size={15} />
          </button>
          <span className="font-display min-w-5 text-center text-xl font-semibold tabular-nums">
            {servings}
          </span>
          <button
            type="button"
            onClick={() => setServings((s) => s + 1)}
            aria-label="Agregar porción"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-coral text-white"
          >
            <Icon name="plus" size={15} />
          </button>
        </div>
      </div>

      <MacroRings
        caloriesPerServing={caloriesPerServing}
        proteinG={proteinG}
        carbsG={carbsG}
        fatG={fatG}
      />

      <div className="h-px bg-border" />

      <div>
        <h2 className="mb-2.5 text-[15px] font-bold">Ingredientes</h2>
        <ul>
          {ingredients.map((ingredient, i) => (
            <li
              key={ingredient.id}
              className={`flex justify-between py-2.5 text-sm ${i < ingredients.length - 1 ? "border-b border-border-light" : ""}`}
            >
              <span>{ingredient.name}</span>
              <span className="font-semibold text-ink-soft tabular-nums">
                {formatQuantity(ingredient.quantity * factor)} {ingredient.unit}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
