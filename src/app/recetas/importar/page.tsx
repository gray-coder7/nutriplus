"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createRecipe, extractRecipe } from "@/app/recetas/actions";
import { Icon } from "@/components/icon-sprite";
import { RecipeForm } from "@/components/recipe-form";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

type Mode = "text" | "url";

export default function ImportarRecetaPage() {
  const [state, formAction, pending] = useActionState(extractRecipe, undefined);
  const [mode, setMode] = useState<Mode>("text");

  if (state?.status === "success") {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:py-12">
        <h1 className="mb-8 text-[28px] font-semibold sm:text-3xl">Revisa la receta</h1>
        <RecipeForm
          action={createRecipe}
          submitLabel="Guardar receta"
          initialValues={state.values}
          sourceMeta={{
            sourceType: state.sourceType,
            sourceUrl: state.sourceUrl,
            sourceRawText: state.sourceRawText,
          }}
          banner={
            <div className="flex items-start gap-2.5 rounded-2xl bg-lime-tint px-4 py-3 text-sm text-lime-dark">
              <Icon name="sparkles" size={17} className="mt-0.5 shrink-0" />
              <p>
                Generado con IA a partir de{" "}
                {state.sourceType === "URL_IMPORT" ? "el link que pegaste" : "el texto que pegaste"}.
                Revisa nombre, macros, ingredientes y pasos antes de guardar — la IA puede
                equivocarse.
                {state.warning && <span className="mt-1 block font-bold">{state.warning}</span>}
              </p>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10 sm:py-12">
      <h1 className="mb-2 text-[28px] font-semibold sm:text-3xl">Importar receta con IA</h1>
      <p className="mb-8 text-ink-soft">
        Pega el texto de una receta o el link de un sitio, un reel de Instagram o un video
        de TikTok. La IA arma la receta y la puedes ajustar antes de guardarla.
      </p>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition-colors ${
            mode === "text"
              ? "border-transparent bg-coral-tint text-coral-dark"
              : "border-border text-[#4A4844]"
          }`}
        >
          Pegar texto
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-full border-[1.5px] px-4 py-2 text-[13px] font-bold transition-colors ${
            mode === "url"
              ? "border-transparent bg-coral-tint text-coral-dark"
              : "border-border text-[#4A4844]"
          }`}
        >
          Pegar link
        </button>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="mode" value={mode} />

        {mode === "text" ? (
          <div>
            <Label htmlFor="rawText">Texto de la receta</Label>
            <Textarea
              id="rawText"
              name="rawText"
              rows={10}
              className="resize-none"
              placeholder="Pega aquí la receta tal cual la tengas: ingredientes, pasos, lo que sea..."
            />
          </div>
        ) : (
          <div>
            <Label htmlFor="url">Link de la receta</Label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://..."
            />
          </div>
        )}

        {state?.status === "error" && (
          <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-medium text-error">
            {state.error}
          </p>
        )}

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={pending}>
            <Icon name="sparkles" size={16} />
            {pending ? "Analizando…" : "Analizar con IA"}
          </Button>
          <Link href="/recetas" className="text-sm font-bold text-ink-soft hover:text-ink">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
