"use client";

import { useOptimistic, useTransition } from "react";
import { removeShoppingListItem, toggleShoppingListItem } from "@/app/listas/actions";
import { INGREDIENT_CATEGORY_LABELS, INGREDIENT_CATEGORY_ORDER } from "@/lib/constants";
import { formatQuantity } from "@/lib/format";
import type { IngredientCategory } from "@/generated/prisma/enums";

export type ShoppingItem = {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: IngredientCategory;
  isChecked: boolean;
};

export function ShoppingListChecklist({
  items,
  shoppingListId,
}: {
  items: ShoppingItem[];
  shoppingListId: string;
}) {
  const [optimisticItems, setOptimisticChecked] = useOptimistic(
    items,
    (state, update: { id: string; checked: boolean }) =>
      state.map((item) => (item.id === update.id ? { ...item, isChecked: update.checked } : item)),
  );
  const [, startTransition] = useTransition();

  function handleToggle(id: string, checked: boolean) {
    startTransition(async () => {
      setOptimisticChecked({ id, checked });
      await toggleShoppingListItem(id, checked);
    });
  }

  const grouped = INGREDIENT_CATEGORY_ORDER.map((category) => ({
    category,
    items: optimisticItems.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  if (grouped.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-foreground/15 py-10 text-center text-foreground/50">
        Esta lista está vacía.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {grouped.map(({ category, items: categoryItems }) => (
        <section key={category}>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-foreground/50">
            {INGREDIENT_CATEGORY_LABELS[category]}
          </h2>
          <ul className="flex flex-col gap-1.5">
            {categoryItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-3 rounded-lg border border-foreground/10 bg-white px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={(e) => handleToggle(item.id, e.target.checked)}
                  className="h-5 w-5 shrink-0 accent-coral"
                  aria-label={item.name}
                />
                <span
                  className={`flex-1 text-sm ${
                    item.isChecked ? "text-foreground/40 line-through" : "text-foreground"
                  }`}
                >
                  {item.name}
                </span>
                {(item.quantity || item.unit) && (
                  <span
                    className={`shrink-0 text-sm tabular-nums ${
                      item.isChecked ? "text-foreground/30" : "text-foreground/60"
                    }`}
                  >
                    {item.quantity ? formatQuantity(item.quantity) : ""} {item.unit ?? ""}
                  </span>
                )}
                <form action={removeShoppingListItem.bind(null, item.id, shoppingListId)}>
                  <button
                    type="submit"
                    className="shrink-0 leading-none text-foreground/30 hover:text-red-600"
                    aria-label={`Quitar ${item.name}`}
                  >
                    ×
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
