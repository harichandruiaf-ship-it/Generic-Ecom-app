"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

export async function createShippingMethodAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.shippingMethod === "undefined") redirect("/admin/shipping");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };
  const description = (formData.get("description") as string)?.trim() || null;
  const priceCents = parseInt((formData.get("priceCents") as string) ?? "0", 10) || 0;
  const isDefault = formData.get("isDefault") === "on";
  const sortOrder = parseInt((formData.get("sortOrder") as string) ?? "0", 10) || 0;

  if (isDefault) {
    await prisma.shippingMethod.updateMany({
      data: { isDefault: false },
    });
  }

  await prisma.shippingMethod.create({
    data: { name, description, priceCents, isDefault, sortOrder },
  });

  revalidatePath("/admin/shipping");
  redirect("/admin/shipping");
}

export async function updateShippingMethodAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const id = formData.get("id") as string;
  if (!id || typeof prisma.shippingMethod === "undefined") redirect("/admin/shipping");

  const name = (formData.get("name") as string)?.trim();
  if (!name) return { error: "Name is required." };
  const description = (formData.get("description") as string)?.trim() || null;
  const priceCents = parseInt((formData.get("priceCents") as string) ?? "0", 10) || 0;
  const isDefault = formData.get("isDefault") === "on";
  const sortOrder = parseInt((formData.get("sortOrder") as string) ?? "0", 10) || 0;

  if (isDefault) {
    await prisma.shippingMethod.updateMany({
      where: { id: { not: id } },
      data: { isDefault: false },
    });
  }

  await prisma.shippingMethod.update({
    where: { id },
    data: { name, description, priceCents, isDefault, sortOrder },
  });

  revalidatePath("/admin/shipping");
  redirect("/admin/shipping");
}

export async function deleteShippingMethodAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const id = formData.get("id") as string;
  if (!id || typeof prisma.shippingMethod === "undefined") redirect("/admin/shipping");
  await prisma.shippingMethod.delete({ where: { id } });
  revalidatePath("/admin/shipping");
  redirect("/admin/shipping");
}
