import Link from "next/link";
import { notFound } from "next/navigation";
import { addManualItem, generateOrRegenerateShoppingList } from "@/app/listas/actions";
import { ShoppingListChecklist } from "@/components/shopping-list-checklist";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
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

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Lista de súper</h1>
        {list.mealPlanId && (
          <form action={generateOrRegenerateShoppingList.bind(null, list.mealPlanId)}>
            <Button type="submit" variant="secondary">
              🔄 Regenerar desde el plan
            </Button>
          </form>
        )}
      </div>

      {list.mealPlan && (
        <p className="mb-1 text-foreground/70">
          Semana del {formatWeekRangeLabel(list.mealPlan.weekStartDate)}
        </p>
      )}
      <p className="mb-8 text-sm text-foreground/50">
        {checked} de {total} comprados
      </p>

      <div className="mb-8">
        <ShoppingListChecklist items={list.items} shoppingListId={list.id} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-bold">Agregar algo más</h2>
        <form
          action={addManualItem.bind(null, list.id)}
          className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_1.5fr_auto]"
        >
          <Input name="name" placeholder="Ej. Papel de baño" required className="col-span-2 sm:col-span-1" />
          <Input name="quantity" type="number" min={0} step="any" placeholder="Cant." />
          <Input name="unit" placeholder="Unidad" />
          <Select name="category" defaultValue="OTHER">
            {INGREDIENT_CATEGORY_ORDER.map((category) => (
              <option key={category} value={category}>
                {INGREDIENT_CATEGORY_LABELS[category]}
              </option>
            ))}
          </Select>
          <Button type="submit" className="col-span-2 sm:col-span-1">
            + Agregar
          </Button>
        </form>
      </section>

      <div className="mt-10">
        <Link href="/listas" className="text-sm font-medium text-foreground/60 hover:text-foreground">
          ← Todas las listas
        </Link>
      </div>
    </div>
  );
}
