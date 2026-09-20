"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { buildConsolidatedItems, getShoppingListForMealPlan } from "@/lib/shopping-list";
import { IngredientCategory } from "@/generated/prisma/enums";

export async function generateOrRegenerateShoppingList(
  mealPlanId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData,
): Promise<void> {
  const consolidated = await buildConsolidatedItems(mealPlanId);

  let list = await getShoppingListForMealPlan(mealPlanId);
  if (!list) {
    list = await prisma.shoppingList.create({ data: { mealPlanId } });
  } else {
    // Solo se borran los items que vienen de recetas; los agregados a mano
    // se conservan al regenerar.
    await prisma.shoppingListItem.deleteMany({
      where: { shoppingListId: list.id, NOT: { sourceRecipeIds: { isEmpty: true } } },
    });
  }

  if (consolidated.length > 0) {
    await prisma.shoppingListItem.createMany({
      data: consolidated.map((item, index) => ({
        shoppingListId: list.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        category: item.category,
        sourceRecipeIds: item.sourceRecipeIds,
        sortOrder: index,
      })),
    });
  }

  redirect(`/listas/${list.id}`);
}

export async function toggleShoppingListItem(itemId: string, checked: boolean): Promise<void> {
  await prisma.shoppingListItem.update({
    where: { id: itemId },
    data: { isChecked: checked },
  });
  revalidatePath("/listas");
}

export async function addManualItem(shoppingListId: string, formData: FormData): Promise<void> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const quantityRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(quantityRaw) && quantityRaw > 0 ? quantityRaw : null;
  const unit = String(formData.get("unit") ?? "").trim() || null;
  const categoryRaw = String(formData.get("category") ?? "OTHER");
  const category = (Object.values(IngredientCategory) as string[]).includes(categoryRaw)
    ? (categoryRaw as IngredientCategory)
    : IngredientCategory.OTHER;

  const lastItem = await prisma.shoppingListItem.findFirst({
    where: { shoppingListId },
    orderBy: { sortOrder: "desc" },
  });

  await prisma.shoppingListItem.create({
    data: {
      shoppingListId,
      name,
      quantity,
      unit,
      category,
      sortOrder: (lastItem?.sortOrder ?? -1) + 1,
    },
  });

  redirect(`/listas/${shoppingListId}`);
}

export async function removeShoppingListItem(
  itemId: string,
  shoppingListId: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  formData: FormData,
): Promise<void> {
  await prisma.shoppingListItem.delete({ where: { id: itemId } });
  redirect(`/listas/${shoppingListId}`);
}
