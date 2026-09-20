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
      "Cache-Control": "private, max-age=60",
    },
  });
}
