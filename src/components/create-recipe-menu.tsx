import Link from "next/link";
import { Icon } from "@/components/icon-sprite";

/**
 * <details>/<summary> nativo — igual de "sin JS necesario" que el resto de
 * la app (nada de estado de React) — para ofrecer manual vs. importar con
 * IA en vez de ir directo al formulario manual.
 */
export function CreateRecipeMenu() {
  return (
    <details className="group relative rounded-[18px] bg-surface shadow-[0_8px_20px_rgba(43,42,40,.06)] [&_summary::-webkit-details-marker]:hidden sm:rounded-[20px]">
      <summary className="flex cursor-pointer list-none flex-col gap-6 p-4 sm:gap-9 sm:p-[22px]">
        <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-coral-tint text-coral-dark sm:h-12 sm:w-12">
          <Icon name="plus" size={20} />
        </span>
        <span className="flex items-center justify-between">
          <span className="text-sm font-bold sm:text-base">Agregar receta</span>
          <Icon name="chevron-right" size={18} className="hidden text-ink-faint group-open:rotate-90 sm:block" />
        </span>
      </summary>

      <div className="absolute inset-x-0 top-full z-10 mt-2 flex flex-col gap-1 rounded-2xl bg-surface p-2 shadow-[0_12px_28px_rgba(43,42,40,.14)]">
        <Link
          href="/recetas/nueva"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-coral-tint hover:text-coral-dark"
        >
          <Icon name="pencil" size={15} />
          Crear manualmente
        </Link>
        <Link
          href="/recetas/importar"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-bold hover:bg-coral-tint hover:text-coral-dark"
        >
          <Icon name="sparkles" size={15} />
          Importar con IA
        </Link>
      </div>
    </details>
  );
}
