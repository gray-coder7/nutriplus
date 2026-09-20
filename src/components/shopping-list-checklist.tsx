"use client";

import { useOptimistic, useTransition } from "react";
import { removeShoppingListItem, toggleShoppingListItem } from "@/app/listas/actions";
import { Icon } from "@/components/icon-sprite";
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
      <p className="rounded-2xl bg-surface py-10 text-center text-ink-soft shadow-[0_8px_20px_rgba(43,42,40,.05)]">
        Esta lista está vacía.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      {grouped.map(({ category, items: categoryItems }) => {
        const checkedCount = categoryItems.filter((item) => item.isChecked).length;
        return (
          <section
            key={category}
            className="rounded-[22px] bg-surface px-6 py-5 shadow-[0_8px_20px_rgba(43,42,40,.05)]"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-base font-semibold">{INGREDIENT_CATEGORY_LABELS[category]}</h2>
              <span className="text-xs font-bold text-ink-faint">
                {checkedCount}/{categoryItems.length}
              </span>
            </div>
            {categoryItems.map((item) => (
              <div key={item.id} className="group flex items-center gap-3.5 py-[9px]">
                <label className="flex flex-1 cursor-pointer items-center gap-3.5">
                  <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={item.isChecked}
                      onChange={(e) => handleToggle(item.id, e.target.checked)}
                      className="peer sr-only"
                      aria-label={item.name}
                    />
                    <span className="absolute inset-0 rounded-[7px] border-2 border-ink-placeholder peer-checked:hidden" />
                    <span className="hidden h-full w-full items-center justify-center rounded-[7px] bg-lime text-white peer-checked:flex">
                      <Icon name="check" size={14} />
                    </span>
                  </span>
                  <span
                    className={`text-[14.5px] font-semibold ${
                      item.isChecked ? "text-ink-faint line-through opacity-55" : "text-ink"
                    }`}
                  >
                    {item.name}
                    {(item.quantity || item.unit) && (
                      <span className="font-medium text-ink-soft">
                        {" "}
                        · {item.quantity ? formatQuantity(item.quantity) : ""} {item.unit ?? ""}
                      </span>
                    )}
                  </span>
                </label>
                <form action={removeShoppingListItem.bind(null, item.id, shoppingListId)}>
                  <button
                    type="submit"
                    className="shrink-0 leading-none text-ink-placeholder opacity-0 group-hover:opacity-100 hover:text-error"
                    aria-label={`Quitar ${item.name}`}
                  >
                    ×
                  </button>
                </form>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
