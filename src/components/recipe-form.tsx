"use client";

import Link from "next/link";
import { useActionState, useId, useState } from "react";
import type { RecipeActionState } from "@/app/recetas/actions";
import { Icon } from "@/components/icon-sprite";
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

function iconButtonClasses(extra = "") {
  return `flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl border-[1.5px] border-border bg-surface text-ink-faint hover:text-error ${extra}`;
}

export function RecipeForm({
  action,
  initialValues,
  submitLabel,
}: {
  action: (
    prevState: RecipeActionState,
    formData: FormData,
  ) => Promise<RecipeActionState>;
  initialValues?: RecipeFormInitialValues;
  submitLabel: string;
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
    <form action={formAction} className="flex flex-col gap-9">
      <section className="flex flex-col gap-5">
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
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={3}
            defaultValue={initialValues?.description}
            placeholder="Un platillo rápido y balanceado, ideal para..."
            className="resize-none"
          />
        </div>

        <div>
          <Label>Etiquetas (selección múltiple)</Label>
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
                <span className="inline-block rounded-full border-[1.5px] border-border px-4 py-2 text-[13px] font-bold text-[#4A4844] transition-colors peer-checked:border-transparent peer-checked:bg-coral-tint peer-checked:text-coral-dark peer-focus-visible:ring-2 peer-focus-visible:ring-coral/40">
                  {MEAL_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="baseServings">Porciones base</Label>
          <Input
            id="baseServings"
            name="baseServings"
            type="number"
            min={1}
            step={1}
            required
            className="w-28"
            defaultValue={initialValues?.baseServings ?? 2}
          />
        </div>

        <div>
          <Label>Macronutrientes por porción</Label>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
                Calorías (kcal)
              </span>
              <Input
                name="caloriesPerServing"
                type="number"
                min={0}
                step={1}
                required
                defaultValue={initialValues?.caloriesPerServing ?? 0}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
                Proteína (g)
              </span>
              <Input
                name="proteinGPerServing"
                type="number"
                min={0}
                step="any"
                required
                defaultValue={initialValues?.proteinGPerServing ?? 0}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
                Carbohidratos (g)
              </span>
              <Input
                name="carbsGPerServing"
                type="number"
                min={0}
                step="any"
                required
                defaultValue={initialValues?.carbsGPerServing ?? 0}
              />
            </div>
            <div>
              <span className="mb-1.5 block text-xs font-semibold text-ink-soft">
                Grasa (g)
              </span>
              <Input
                name="fatGPerServing"
                type="number"
                min={0}
                step="any"
                required
                defaultValue={initialValues?.fatGPerServing ?? 0}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="mb-0">Ingredientes</Label>
          <button
            type="button"
            onClick={addIngredientRow}
            className="flex items-center gap-1.5 text-[14px] font-bold text-coral-dark"
          >
            <Icon name="plus" size={16} />
            Agregar ingrediente
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {ingredientRows.map((row) => (
            <div key={row.key} className="flex flex-wrap items-center gap-2.5">
              <Input
                name="ingredientQuantity"
                type="number"
                min={0}
                step="any"
                defaultValue={row.quantity}
                placeholder="Cant."
                className="w-20"
              />
              <Input
                name="ingredientUnit"
                defaultValue={row.unit}
                placeholder="unidad"
                className="w-28"
              />
              <Input
                name="ingredientName"
                defaultValue={row.name}
                placeholder="Ingrediente"
                className="min-w-[160px] flex-1"
              />
              <Select
                name="ingredientCategory"
                defaultValue={row.category ?? "OTHER"}
                className="w-40"
              >
                {INGREDIENT_CATEGORY_ORDER.map((category) => (
                  <option key={category} value={category}>
                    {INGREDIENT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </Select>
              <button
                type="button"
                onClick={() => removeIngredientRow(row.key)}
                aria-label="Quitar ingrediente"
                className={iconButtonClasses()}
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Label className="mb-0">Instrucciones</Label>
          <button
            type="button"
            onClick={addInstructionRow}
            className="flex items-center gap-1.5 text-[14px] font-bold text-coral-dark"
          >
            <Icon name="plus" size={16} />
            Agregar paso
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {instructionRows.map((row, index) => (
            <div key={row.key} className="flex items-start gap-2.5">
              <div className="mt-1.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-coral-tint text-[13px] font-bold text-coral-dark">
                {index + 1}
              </div>
              <Textarea
                name="instructionStep"
                rows={2}
                value={row.value}
                onChange={(e) => updateInstructionValue(row.key, e.target.value)}
                placeholder={`Paso ${index + 1}`}
                className="flex-1 resize-none"
              />
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => moveInstructionRow(index, -1)}
                  disabled={index === 0}
                  aria-label="Subir paso"
                  className={iconButtonClasses("h-[18px] hover:text-coral-dark disabled:opacity-30")}
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveInstructionRow(index, 1)}
                  disabled={index === instructionRows.length - 1}
                  aria-label="Bajar paso"
                  className={iconButtonClasses("h-[18px] hover:text-coral-dark disabled:opacity-30")}
                >
                  ↓
                </button>
              </div>
              <button
                type="button"
                onClick={() => removeInstructionRow(row.key)}
                aria-label="Quitar paso"
                className={iconButtonClasses()}
              >
                <Icon name="trash" size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {state?.error && (
        <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-medium text-error">
          {state.error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando…" : submitLabel}
        </Button>
        <Link href="/recetas" className="text-sm font-bold text-ink-soft hover:text-ink">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
