"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import type { RecipeActionState } from "@/app/recetas/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  INGREDIENT_CATEGORY_LABELS,
  INGREDIENT_CATEGORY_ORDER,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ORDER,
} from "@/lib/constants";
import type { IngredientCategory, MealType } from "@/generated/prisma/enums";

type IngredientRow = {
  key: string;
  name?: string;
  quantity?: number;
  unit?: string;
  category?: IngredientCategory;
};

type InstructionRow = {
  key: string;
  value: string;
};

export type RecipeFormInitialValues = {
  name: string;
  description: string;
  mealTypes: MealType[];
  baseServings: number;
  caloriesPerServing: number;
  proteinGPerServing: number;
  carbsGPerServing: number;
  fatGPerServing: number;
  instructions: string[];
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
    category: IngredientCategory;
  }>;
};

export function RecipeForm({
  action,
  initialValues,
  submitLabel,
  sourceMeta,
  banner,
}: {
  action: (
    prevState: RecipeActionState,
    formData: FormData,
  ) => Promise<RecipeActionState>;
  initialValues?: RecipeFormInitialValues;
  submitLabel: string;
  sourceMeta?: { sourceType: string; sourceUrl?: string; sourceRawText?: string };
  banner?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const idPrefix = useId();

  const [ingredientRows, setIngredientRows] = useState<IngredientRow[]>(() =>
    initialValues?.ingredients.length
      ? initialValues.ingredients.map((ingredient, i) => ({
          key: `${idPrefix}-ing-${i}`,
          ...ingredient,
        }))
      : [{ key: `${idPrefix}-ing-0` }],
  );

  const [instructionRows, setInstructionRows] = useState<InstructionRow[]>(() =>
    initialValues?.instructions.length
      ? initialValues.instructions.map((value, i) => ({
          key: `${idPrefix}-step-${i}`,
          value,
        }))
      : [{ key: `${idPrefix}-step-0`, value: "" }],
  );

  function addIngredientRow() {
    setIngredientRows((rows) => [...rows, { key: `${idPrefix}-ing-${rows.length}-${Date.now()}` }]);
  }

  function removeIngredientRow(key: string) {
    setIngredientRows((rows) => rows.filter((row) => row.key !== key));
  }

  function addInstructionRow() {
    setInstructionRows((rows) => [
      ...rows,
      { key: `${idPrefix}-step-${rows.length}-${Date.now()}`, value: "" },
    ]);
  }

  function removeInstructionRow(key: string) {
    setInstructionRows((rows) => rows.filter((row) => row.key !== key));
  }

  function updateInstructionValue(key: string, value: string) {
    setInstructionRows((rows) =>
      rows.map((row) => (row.key === key ? { ...row, value } : row)),
    );
  }

  function moveInstructionRow(index: number, direction: -1 | 1) {
    setInstructionRows((rows) => {
      const target = index + direction;
      if (target < 0 || target >= rows.length) return rows;
      const next = [...rows];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {sourceMeta && (
        <>
          <input type="hidden" name="sourceType" value={sourceMeta.sourceType} />
          {sourceMeta.sourceUrl && (
            <input type="hidden" name="sourceUrl" value={sourceMeta.sourceUrl} />
          )}
          {sourceMeta.sourceRawText && (
            <input type="hidden" name="sourceRawText" value={sourceMeta.sourceRawText} />
          )}
        </>
      )}
      {banner}
      <section className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Nombre de la receta</Label>
          <Input
            id="name"
            name="name"
            required
            defaultValue={initialValues?.name}
            placeholder="Ej. Bowl de pollo teriyaki"
          />
        </div>

        <div>
          <Label htmlFor="description">Descripción general</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={3}
            defaultValue={initialValues?.description}
            placeholder="Un platillo rápido y balanceado, ideal para..."
          />
        </div>

        <div>
          <Label>Etiquetas de comida</Label>
          <div className="flex flex-wrap gap-2">
            {MEAL_TYPE_ORDER.map((type) => (
              <label key={type} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="mealTypes"
                  value={type}
                  defaultChecked={initialValues?.mealTypes.includes(type)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-foreground/15 px-4 py-1.5 text-sm font-medium text-foreground/70 transition-colors peer-checked:border-coral peer-checked:bg-coral peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-coral/40">
                  {MEAL_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div>
          <Label htmlFor="baseServings">Porciones base</Label>
          <Input
            id="baseServings"
            name="baseServings"
            type="number"
            min={1}
            step={1}
            required
            defaultValue={initialValues?.baseServings ?? 2}
          />
        </div>
        <div>
          <Label htmlFor="caloriesPerServing">Cal / porción</Label>
          <Input
            id="caloriesPerServing"
            name="caloriesPerServing"
            type="number"
            min={0}
            step={1}
            required
            defaultValue={initialValues?.caloriesPerServing ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="proteinGPerServing">Proteína (g)</Label>
          <Input
            id="proteinGPerServing"
            name="proteinGPerServing"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={initialValues?.proteinGPerServing ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="carbsGPerServing">Carbos (g)</Label>
          <Input
            id="carbsGPerServing"
            name="carbsGPerServing"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={initialValues?.carbsGPerServing ?? 0}
          />
        </div>
        <div>
          <Label htmlFor="fatGPerServing">Grasa (g)</Label>
          <Input
            id="fatGPerServing"
            name="fatGPerServing"
            type="number"
            min={0}
            step="any"
            required
            defaultValue={initialValues?.fatGPerServing ?? 0}
          />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="mb-0">Ingredientes</Label>
          <Button type="button" variant="secondary" onClick={addIngredientRow}>
            + Agregar ingrediente
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {ingredientRows.map((row) => (
            <div
              key={row.key}
              className="grid grid-cols-[1fr_5rem_6rem_9rem_auto] items-center gap-2 rounded-lg border border-foreground/10 p-2"
            >
              <Input
                name="ingredientName"
                defaultValue={row.name}
                placeholder="Ingrediente"
              />
              <Input
                name="ingredientQuantity"
                type="number"
                min={0}
                step="any"
                defaultValue={row.quantity}
                placeholder="Cant."
              />
              <Input
                name="ingredientUnit"
                defaultValue={row.unit}
                placeholder="g, taza..."
              />
              <Select name="ingredientCategory" defaultValue={row.category ?? "OTHER"}>
                {INGREDIENT_CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {INGREDIENT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                variant="danger"
                onClick={() => removeIngredientRow(row.key)}
                aria-label="Quitar ingrediente"
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="mb-0">Instrucciones de preparación</Label>
          <Button type="button" variant="secondary" onClick={addInstructionRow}>
            + Agregar paso
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {instructionRows.map((row, index) => (
            <div key={row.key} className="flex items-start gap-2">
              <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral/10 text-sm font-semibold text-coral-dark">
                {index + 1}
              </span>
              <Textarea
                name="instructionStep"
                rows={2}
                value={row.value}
                onChange={(e) => updateInstructionValue(row.key, e.target.value)}
                placeholder={`Paso ${index + 1}`}
                className="flex-1"
              />
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => moveInstructionRow(index, -1)}
                  disabled={index === 0}
                  aria-label="Subir paso"
                  className="px-2 py-1"
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => moveInstructionRow(index, 1)}
                  disabled={index === instructionRows.length - 1}
                  aria-label="Bajar paso"
                  className="px-2 py-1"
                >
                  ↓
                </Button>
              </div>
              <Button
                type="button"
                variant="danger"
                onClick={() => removeInstructionRow(row.key)}
                aria-label="Quitar paso"
              >
                Quitar
              </Button>
            </div>
          ))}
        </div>
      </section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : submitLabel}
        </Button>
        <Link
          href="/recetas"
          className="text-sm font-medium text-foreground/60 hover:text-foreground"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
