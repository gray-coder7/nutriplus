import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic } from "@/lib/anthropic";
import { transcribeVideoFromUrl } from "@/lib/video-transcription";
import { IngredientCategory, MealType } from "@/generated/prisma/enums";
import type { RecipeFormInitialValues } from "@/components/recipe-form";

const MIN_CONTEXT_LENGTH = 40;
const MAX_CONTEXT_LENGTH = 12000;
const FETCH_TIMEOUT_MS = 10000;
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const extractedRecipeSchema = z.object({
  name: z.string().describe("Nombre corto y apetitoso de la receta, en español"),
  description: z
    .string()
    .describe("Descripción general de 1-2 frases de la receta, en español"),
  mealTypes: z
    .array(z.enum(MealType))
    .min(1)
    .describe(
      "Una o más etiquetas de comida que apliquen: BREAKFAST (desayuno), LUNCH (comida/almuerzo fuerte del día), DINNER (cena), BRUNCH (almuerzo ligero de media mañana), SNACK (snack)",
    ),
  baseServings: z
    .number()
    .int()
    .positive()
    .describe("Número de porciones que rinde la receta según el texto, o tu mejor estimado"),
  caloriesPerServing: z
    .number()
    .int()
    .nonnegative()
    .describe("Calorías por porción. Si no se especifican, estímalas a partir de los ingredientes"),
  proteinGPerServing: z.number().nonnegative().describe("Gramos de proteína por porción, estimado si hace falta"),
  carbsGPerServing: z.number().nonnegative().describe("Gramos de carbohidratos por porción, estimado si hace falta"),
  fatGPerServing: z.number().nonnegative().describe("Gramos de grasa por porción, estimado si hace falta"),
  ingredients: z
    .array(
      z.object({
        name: z.string().describe("Nombre del ingrediente, en español"),
        quantity: z.number().positive(),
        unit: z.string().describe("Unidad breve: g, ml, taza, cucharada, pieza, etc."),
        category: z
          .enum(IngredientCategory)
          .describe(
            "PRODUCE (fruta/verdura), PROTEIN, DAIRY (lácteos), PANTRY (despensa/abarrotes), SPICES (especias), FROZEN (congelados), BEVERAGES (bebidas), OTHER",
          ),
      }),
    )
    .min(1),
  instructions: z
    .array(z.string())
    .min(1)
    .describe("Pasos de preparación en orden, en español, cada uno una frase clara y accionable"),
});

const EXTRACTION_SYSTEM_PROMPT = `Eres un asistente que convierte texto libre sobre una receta de cocina \
(puede venir de una nota pegada a mano, el texto de una página web, o el caption/descripción de un video \
de Instagram o TikTok) en una receta estructurada.

Reglas:
- Todos los campos de texto (nombre, descripción, ingredientes, instrucciones) van en español, sin importar \
el idioma del texto original.
- Si el texto no especifica macronutrientes, estímalos de forma razonable a partir de los ingredientes y \
las porciones; nunca los dejes en blanco.
- Si el texto es una descripción/caption de red social y no detalla bien los pasos de preparación (porque \
se explican hablado en el video), infiere pasos de preparación razonables a partir de los ingredientes \
mencionados, dejándolos genéricos donde falte detalle. No inventes ingredientes que no estén sugeridos por \
el texto.
- Elige entre 1 y 2 etiquetas de comida (mealTypes) que mejor apliquen.`;

export async function extractRecipeFromText(
  rawText: string,
): Promise<RecipeFormInitialValues> {
  const response = await anthropic.messages.parse({
    model: "claude-opus-5",
    max_tokens: 4096,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Estructura la siguiente receta:\n\n${rawText.slice(0, MAX_CONTEXT_LENGTH)}`,
      },
    ],
    output_config: {
      format: zodOutputFormat(extractedRecipeSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("No se pudo estructurar la receta a partir del texto proporcionado");
  }

  return response.parsed_output;
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function findRecipeJsonLd(html: string): string | null {
  const scriptMatches = html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );

  for (const match of scriptMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      const candidates = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed["@graph"])
          ? parsed["@graph"]
          : [parsed];

      for (const candidate of candidates) {
        const type = candidate?.["@type"];
        const isRecipe = Array.isArray(type)
          ? type.includes("Recipe")
          : type === "Recipe";
        if (isRecipe) return JSON.stringify(candidate);
      }
    } catch {
      // JSON-LD mal formado o no relacionado con la receta, seguimos buscando
    }
  }

  return null;
}

async function fetchTikTokCaption(url: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; author_name?: string };
    if (!data.title) return null;
    return `Video de TikTok de ${data.author_name ?? "un creador"}. Descripción: ${data.title}`;
  } catch {
    return null;
  }
}

export type UrlFetchResult = {
  contextText: string;
  warning?: string;
};

export async function fetchUrlContent(url: string): Promise<UrlFetchResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error("Ese link no es una URL válida");
  }

  const hostname = parsedUrl.hostname.replace(/^www\./, "");
  const isTikTok = /tiktok\.com$/.test(hostname);
  const isInstagram = /instagram\.com$/.test(hostname);

  if (isTikTok || isInstagram) {
    try {
      const { transcript, title, description } = await transcribeVideoFromUrl(url);
      const parts = [
        title ? `Título: ${title}` : "",
        description ? `Descripción: ${description}` : "",
        `Transcripción del audio del video:\n${transcript}`,
      ].filter(Boolean);
      const contextText = parts.join("\n\n");
      if (contextText.length >= MIN_CONTEXT_LENGTH) {
        return {
          contextText,
          warning:
            "Generado a partir de la transcripción del audio del video. Revisa bien las cantidades y los pasos.",
        };
      }
    } catch (err) {
      console.error("No se pudo transcribir el video, usando el respaldo de solo texto:", err);
    }
  }

  if (isTikTok) {
    const caption = await fetchTikTokCaption(url);
    if (caption && caption.length >= MIN_CONTEXT_LENGTH) {
      return {
        contextText: caption,
        warning:
          "Solo pudimos leer la descripción del video de TikTok, no el audio. Revisa bien los pasos e ingredientes.",
      };
    }
  }

  let html: string;
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { "User-Agent": BROWSER_USER_AGENT, Accept: "text/html" },
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    html = await res.text();
  } catch {
    throw new Error(
      "No pudimos abrir ese link automáticamente. Pega el texto de la receta directamente en su lugar.",
    );
  }

  const recipeJsonLd = findRecipeJsonLd(html);
  if (recipeJsonLd) {
    return { contextText: `Datos estructurados (JSON-LD) de la página:\n${recipeJsonLd}` };
  }

  const ogDescriptionMatch = html.match(
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i,
  );
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const bodyText = stripHtmlTags(html).slice(0, MAX_CONTEXT_LENGTH);

  const parts = [
    titleMatch ? `Título: ${titleMatch[1]}` : "",
    ogDescriptionMatch ? `Descripción: ${ogDescriptionMatch[1]}` : "",
    bodyText,
  ].filter(Boolean);

  const contextText = parts.join("\n\n");

  if (contextText.length < MIN_CONTEXT_LENGTH) {
    throw new Error(
      "No pudimos leer suficiente contenido de ese link (común en Instagram, que bloquea el acceso sin sesión). Pega el texto o la descripción de la receta directamente.",
    );
  }

  return {
    contextText,
    warning: isInstagram
      ? "Instagram suele bloquear la lectura automática de posts. Si el resultado se ve incompleto, pega el texto/caption directamente."
      : undefined,
  };
}
