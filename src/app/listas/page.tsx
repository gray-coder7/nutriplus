import Link from "next/link";
import { listShoppingLists } from "@/lib/shopping-list";
import { formatWeekRangeLabel } from "@/lib/week";

export default async function ShoppingListsIndexPage() {
  const lists = await listShoppingLists();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Listas de súper</h1>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-foreground/15 py-20 text-center">
          <span className="text-4xl">🛒</span>
          <p className="text-foreground/60">
            Todavía no generas ninguna lista. Arma tu{" "}
            <Link href="/plan" className="font-semibold underline">
              plan semanal
            </Link>{" "}
            y genera una desde ahí.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lists.map((list) => (
            <li key={list.id}>
              <Link
                href={`/listas/${list.id}`}
                className="flex items-center justify-between rounded-xl border border-foreground/10 bg-white px-4 py-3 hover:border-coral/50"
              >
                <span className="font-medium">
                  {list.mealPlan
                    ? `Semana del ${formatWeekRangeLabel(list.mealPlan.weekStartDate)}`
                    : "Lista de súper"}
                </span>
                <span className="text-sm text-foreground/50">{list._count.items} artículos</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
