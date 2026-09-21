import sharp from "sharp";
import { prisma } from "@/lib/prisma";

const MAX_DIMENSION = 1024;
const WEBP_QUALITY = 80;

/**
 * Backfill + auto-recuperación: cualquier RecipeImage cuyo mimeType no sea
 * "image/webp" todavía no pasó por el pipeline de compresión (imágenes
 * generadas antes de este cambio, o casos donde sharp falló al momento de
 * generar y se guardaron los bytes crudos como respaldo). Se llama desde
 * src/instrumentation.ts con un setInterval, no hay job runner externo.
 */
export async function compressUncompressedImages(limit = 20): Promise<void> {
  const pending = await prisma.recipeImage.findMany({
    where: { mimeType: { not: "image/webp" } },
    select: { id: true, data: true },
    take: limit,
  });

  for (const image of pending) {
    try {
      const compressed = await sharp(image.data)
        .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
        .webp({ quality: WEBP_QUALITY })
        .toBuffer();

      await prisma.recipeImage.update({
        where: { id: image.id },
        data: { data: new Uint8Array(compressed), mimeType: "image/webp" },
      });
    } catch (err) {
      // Se reintenta en el próximo barrido; una imagen problemática no debe
      // detener el resto del lote.
      console.error(`No se pudo comprimir RecipeImage ${image.id}:`, err);
    }
  }

  if (pending.length > 0) {
    console.log(`Barrido de compresión: ${pending.length} imagen(es) procesada(s).`);
  }
}
