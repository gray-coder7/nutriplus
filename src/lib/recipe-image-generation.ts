import sharp from "sharp";
import { prisma } from "@/lib/prisma";
import { generateImage } from "@/lib/kie";
import { craftImagePrompt } from "@/lib/recipe-image-prompt";

const MAX_DIMENSION = 1024;
const WEBP_QUALITY = 80;

/**
 * Redimensiona y comprime a WebP los bytes crudos que devuelve Kie. Si
 * sharp falla por cualquier razón, se guardan los bytes originales tal
 * cual — el barrido periódico (src/lib/image-compression-sweep.ts) los
 * vuelve a intentar más tarde en vez de tirar toda la generación.
 */
async function compressImage(
  data: Uint8Array<ArrayBuffer>,
  mimeType: string,
): Promise<{ data: Uint8Array<ArrayBuffer>; mimeType: string }> {
  try {
    const compressed = await sharp(data)
      .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
      .webp({ quality: WEBP_QUALITY })
      .toBuffer();
    // sharp/Buffer tipan su ArrayBuffer subyacente como ArrayBufferLike (por
    // si acaso fuera un SharedArrayBuffer), pero toBuffer() nunca devuelve
    // eso en la práctica — el cast es seguro.
    return { data: new Uint8Array(compressed) as Uint8Array<ArrayBuffer>, mimeType: "image/webp" };
  } catch (err) {
    console.error("No se pudo comprimir la imagen, se guarda sin comprimir:", err);
    return { data, mimeType };
  }
}

/**
 * Genera (o regenera) la imagen de una receta y la guarda en Postgres.
 * No hace redirect() ni nada ligado a una request — se llama desde dentro
 * de after() tanto para el botón manual como para el auto-trigger tras
 * importar una receta, así que asume que quien la llama ya marcó
 * imageStatus: "GENERATING" antes de invocarla.
 */
export async function generateAndStoreRecipeImage(recipeId: string): Promise<void> {
  try {
    const recipe = await prisma.recipe.findUniqueOrThrow({
      where: { id: recipeId },
      select: { name: true, description: true },
    });

    const prompt = await craftImagePrompt(recipe.name, recipe.description);
    const raw = await generateImage(prompt);
    const { data, mimeType } = await compressImage(raw.data, raw.mimeType);

    await prisma.$transaction([
      prisma.recipeImage.upsert({
        where: { recipeId },
        create: { recipeId, data, mimeType },
        update: { data, mimeType },
      }),
      prisma.recipe.update({
        where: { id: recipeId },
        data: {
          imageUrl: `/api/recipe-images/${recipeId}`,
          imagePrompt: prompt,
          imageStatus: "READY",
          imageError: null,
        },
      }),
    ]);
  } catch (err) {
    await prisma.recipe.update({
      where: { id: recipeId },
      data: {
        imageStatus: "FAILED",
        imageError: err instanceof Error ? err.message : "No se pudo generar la imagen",
      },
    });
  }
}
