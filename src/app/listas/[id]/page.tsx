import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addManualItem,
  generateOrRegenerateShoppingList,
  setShoppingListCompleted,
} from "@/app/listas/actions";
import { DeleteShoppingListButton } from "@/components/delete-shopping-list-button";
import { Icon } from "@/components/icon-sprite";
import { ShoppingListChecklist } from "@/components/shopping-list-checklist";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { INGREDIENT_CATEGORY_LABELS, INGREDIENT_CATEGORY_ORDER } from "@/lib/constants";
import { getShoppingListById } from "@/lib/shopping-list";
import { formatWeekRangeLabel } from "@/lib/week";

export default async function ShoppingListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const list = await getShoppingListById(id);
  if (!list) notFound();

  const total = list.items.length;
  const checked = list.items.filter((item) => item.isChecked).length;
  const isCompleted = !!list.completedAt;

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 sm:px-10 sm:py-11">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-[28px] font-semibold">Lista de súper</h1>
          {isCompleted && (
            <span className="w-fit rounded-full bg-lime-tint px-3 py-1 text-xs font-bold text-lime-dark">
              Completada
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {list.mealPlanId && (
            <form action={generateOrRegenerateShoppingList.bind(null, list.mealPlanId)}>
              <Button type="submit" variant="secondary">
                <Icon name="sparkles" size={16} />
                Regenerar desde el plan
              </Button>
            </form>
          )}
          <form action={setShoppingListCompleted.bind(null, list.id, !isCompleted)}>
            <Button type="submit" variant="secondary">
              {!isCompleted && <Icon name="check" size={16} />}
              {isCompleted ? "Reabrir" : "Marcar como completada"}
            </Button>
          </form>
          <DeleteShoppingListButton id={list.id} />
        </div>
      </div>

      <p className="mb-8 text-sm text-ink-soft">
        {list.mealPlan && <>Semana del {formatWeekRangeLabel(list.mealPlan.weekStartDate)} · </>}
        {total} ingredientes · {checked} ya en tu carrito
      </p>

      <form
        action={addManualItem.bind(null, list.id)}
        className="mb-8 flex flex-col gap-2.5 sm:flex-row"
      >
        <div className="flex flex-1 flex-wrap items-center gap-2.5 rounded-2xl border border-border bg-surface p-2 sm:flex-nowrap">
          <Icon name="plus" size={16} className="ml-2 shrink-0 text-ink-faint" />
          <input
            name="name"
            placeholder="Agregar ítem manual…"
            required
            className="min-w-[140px] flex-1 border-none bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-ink-placeholder"
          />
          <input
            name="quantity"
            type="number"
            min={0}
            step="any"
            placeholder="Cant."
            className="w-16 rounded-xl border border-border px-2 py-1.5 text-sm outline-none focus:border-coral"
          />
          <input
            name="unit"
            placeholder="Unidad"
            className="w-20 rounded-xl border border-border px-2 py-1.5 text-sm outline-none focus:border-coral"
          />
          <Select name="category" defaultValue="OTHER" className="w-auto py-1.5 text-sm">
            {INGREDIENT_CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {INGREDIENT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">Agregar</Button>
      </form>

      <ShoppingListChecklist items={list.items} shoppingListId={list.id} />

      <div className="mt-10">
        <Link href="/listas" className="text-sm font-bold text-ink-soft hover:text-ink">
          ← Todas las listas
        </Link>
      </div>
    </div>
  );
}
