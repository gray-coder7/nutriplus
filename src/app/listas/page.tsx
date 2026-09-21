import Link from "next/link";
import { DeleteShoppingListButton } from "@/components/delete-shopping-list-button";
import { Icon } from "@/components/icon-sprite";
import { Button } from "@/components/ui/button";
import { listShoppingLists } from "@/lib/shopping-list";
import { formatWeekRangeLabel } from "@/lib/week";

export default async function ShoppingListsIndexPage() {
  const lists = await listShoppingLists();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-12">
      <h1 className="mb-8 text-[28px] font-semibold sm:text-3xl">Listas de súper</h1>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-[28px] bg-surface py-20 text-center shadow-[0_10px_24px_rgba(43,42,40,.06)]">
          <span className="relative flex h-[104px] w-[104px] items-center justify-center rounded-full bg-aqua-tint text-aqua-dark">
            <Icon name="cart" size={46} />
            <Icon name="sparkle-sm" size={16} className="absolute right-0.5 top-1.5 text-sun" />
          </span>
          <h3 className="font-display text-xl font-semibold">
            Todavía no tienes lista de súper
          </h3>
          <p className="max-w-xs text-[14.5px] leading-[22px] text-ink-soft">
            En cuanto completes tu plan semanal, generamos la lista por ti, agrupada por
            categoría.
          </p>
          <Link href="/plan" className="mt-1.5">
            <Button>Ir al planeador</Button>
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {lists.map((list) => (
            <li
              key={list.id}
              className="flex items-center gap-2 rounded-2xl bg-surface px-2 py-2 shadow-[0_6px_16px_rgba(43,42,40,.05)] hover:shadow-[0_10px_24px_rgba(43,42,40,.08)]"
            >
              <Link
                href={`/listas/${list.id}`}
                className="flex flex-1 items-center justify-between gap-3 px-3 py-2"
              >
                <span className="flex items-center gap-2 font-bold">
                  {list.mealPlan
                    ? `Semana del ${formatWeekRangeLabel(list.mealPlan.weekStartDate)}`
                    : "Lista de súper"}
                  {list.completedAt && (
                    <span className="w-fit rounded-full bg-lime-tint px-2.5 py-0.5 text-[11px] font-bold text-lime-dark">
                      Completada
                    </span>
                  )}
                </span>
                <span className="text-sm font-semibold text-ink-soft">
                  {list._count.items} artículos
                </span>
              </Link>
              <DeleteShoppingListButton id={list.id} iconOnly />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
