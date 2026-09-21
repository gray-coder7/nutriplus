import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const image = await prisma.recipeImage.findUnique({
    where: { recipeId: id },
    select: { data: true, mimeType: true },
  });

  if (!image) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(image.data, {
    headers: {
      "Content-Type": image.mimeType,
      // Seguro como "immutable": toda referencia a esta ruta incluye un
      // ?v=<updatedAt> como cache-buster (ver recipe-card.tsx y el hero de
      // /recetas/[id]), así que una imagen regenerada simplemente cambia de
      // URL en vez de invalidar esta.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
