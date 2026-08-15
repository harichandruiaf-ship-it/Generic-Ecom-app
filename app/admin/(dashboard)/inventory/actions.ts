"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

/** Set product stock to a specific quantity. Use null to disable tracking (unlimited). */
export async function updateStockAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const productId = formData.get("productId") as string;
  const raw = (formData.get("stockQuantity") as string)?.trim();
  if (!productId) return;

  const stockQuantity = raw === "" || raw === undefined ? null : Math.max(0, parseInt(raw, 10) || 0);

  await prisma.product.update({
    where: { id: productId },
    data: { stockQuantity },
  });

  revalidatePath("/admin/inventory");
  revalidatePath("/admin/products");
  revalidatePath("/admin");
}
