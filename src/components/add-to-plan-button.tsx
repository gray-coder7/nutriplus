"use client";

import { useRef, useState } from "react";
import { addRecipeToPlan } from "@/app/plan/actions";
import { Icon } from "@/components/icon-sprite";
import { Button } from "@/components/ui/button";
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from "@/lib/constants";
import { WEEKDAY_LABELS, mondayOf, toDateParam, weekdayIndex } from "@/lib/week";
import type { MealType } from "@/generated/prisma/enums";

export function AddToPlanButton({
  recipeId,
  defaultServings,
  recipeMealTypes,
}: {
  recipeId: string;
  defaultServings: number;
  recipeMealTypes: MealType[];
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const today = new Date();
  const [dayOfWeek, setDayOfWeek] = useState(() => weekdayIndex(today));
  const [mealType, setMealType] = useState<MealType>(() => recipeMealTypes[0] ?? MEAL_TYPE_ORDER[0]);
  const weekStartDate = toDateParam(mondayOf(today));

  return (
    <>
      <Button type="button" className="w-full" onClick={() => dialogRef.current?.showModal()}>
        Agregar al plan de la semana
      </Button>

      <dialog
        ref={dialogRef}
        className="w-[min(420px,calc(100vw-2.5rem))] rounded-3xl border-none p-0 shadow-[0_20px_50px_rgba(43,42,40,.25)] backdrop:bg-ink/40"
      >
        <form
          action={addRecipeToPlan}
          onSubmit={() => dialogRef.current?.close()}
          className="flex flex-col gap-5 p-6"
        >
          <input type="hidden" name="recipeId" value={recipeId} />
          <input type="hidden" name="weekStartDate" value={weekStartDate} />
          <input type="hidden" name="dayOfWeek" value={dayOfWeek} />
          <input type="hidden" name="mealType" value={mealType} />

          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Agregar al plan</h2>
            <button
              type="button"
              aria-label="Cerrar"
              onClick={() => dialogRef.current?.close()}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-ink-faint hover:text-error"
            >
              ×
            </button>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold text-ink-soft">Día</p>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAY_LABELS.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDayOfWeek(i)}
                  className={`rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-bold transition-colors ${
                    dayOfWeek === i
                      ? "border-transparent bg-coral-tint text-coral-dark"
                      : "border-border text-[#4A4844]"
                  }`}
                >
                  {label.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[13px] font-bold text-ink-soft">Comida</p>
            <div className="flex flex-wrap gap-1.5">
              {MEAL_TYPE_ORDER.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMealType(type)}
                  className={`rounded-full border-[1.5px] px-3 py-1.5 text-[13px] font-bold transition-colors ${
                    mealType === type
                      ? "border-transparent bg-coral-tint text-coral-dark"
                      : "border-border text-[#4A4844]"
                  }`}
                >
                  {MEAL_TYPE_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="add-to-plan-servings" className="mb-2 block text-[13px] font-bold text-ink-soft">
              Porciones
            </label>
            <input
              id="add-to-plan-servings"
              type="number"
              name="servings"
              defaultValue={defaultServings}
              min={1}
              className="w-24 rounded-xl border-[1.5px] border-border px-3 py-2 text-sm focus:border-coral focus:outline-none"
            />
          </div>

          <Button type="submit" className="w-full">
            <Icon name="plus" size={16} />
            Agregar al plan
          </Button>
        </form>
      </dialog>
    </>
  );
}
