"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { createRecipe, extractRecipe } from "@/app/recetas/actions";
import { RecipeForm } from "@/components/recipe-form";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";

type Mode = "text" | "url";

export default function ImportarRecetaPage() {
  const [state, formAction, pending] = useActionState(extractRecipe, undefined);
  const [mode, setMode] = useState<Mode>("text");

  if (state?.status === "success") {
    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-12">
        <h1 className="mb-8 text-3xl font-bold tracking-tight">Revisa la receta</h1>
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
            <div className="rounded-lg bg-lime/10 px-4 py-3 text-sm text-lime-900">
              Generado con IA a partir de{" "}
              {state.sourceType === "URL_IMPORT" ? "el link que pegaste" : "el texto que pegaste"}.
              Revisa nombre, macros, ingredientes y pasos antes de guardar — la IA puede
              equivocarse.
              {state.warning && <p className="mt-1 font-medium">{state.warning}</p>}
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Importar receta con IA</h1>
      <p className="mb-8 text-foreground/60">
        Pega el texto de una receta o el link de un sitio, un reel de Instagram o un video
        de TikTok. La IA arma la receta y la puedes ajustar antes de guardarla.
      </p>

      <div className="mb-6 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "text"
              ? "border-coral bg-coral text-white"
              : "border-foreground/15 text-foreground/70"
          }`}
        >
          Pegar texto
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "url"
              ? "border-coral bg-coral text-white"
              : "border-foreground/15 text-foreground/70"
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
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p>
        )}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Analizando..." : "Analizar con IA"}
          </Button>
          <Link
            href="/recetas"
            className="text-sm font-medium text-foreground/60 hover:text-foreground"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
