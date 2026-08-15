"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import type { OrderStatus } from "@/generated/prisma/client";

export async function updateOrderStatusAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const orderId = formData.get("orderId") as string;
  const status = formData.get("status") as OrderStatus;
  if (!orderId || !status) return;

  const valid: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
  if (!valid.includes(status)) return;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { status: true, items: { select: { productId: true, quantity: true } } },
  });
  if (!order) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { status },
  });

  // When cancelling an order, restore stock for each item
  if (status === "CANCELLED" && order.status !== "CANCELLED" && order.items.length > 0) {
    for (const item of order.items) {
      if (!item.productId) continue;
      await prisma.product.updateMany({
        where: { id: item.productId, stockQuantity: { not: null } },
        data: { stockQuantity: { increment: item.quantity } },
      });
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
}

export async function updateOrderInternalNoteAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const orderId = formData.get("orderId") as string;
  const internalNote = (formData.get("internalNote") as string)?.trim() || null;
  if (!orderId) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { internalNote },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}

export async function updateOrderTrackingAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const orderId = formData.get("orderId") as string;
  const trackingCode = (formData.get("trackingCode") as string)?.trim() || null;
  if (!orderId) return;

  await prisma.order.update({
    where: { id: orderId },
    data: { trackingCode },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
}
