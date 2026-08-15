"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { ProductStatus } from "@/generated/prisma/client";
import { requirePrisma } from "@/lib/prisma";
import { isAllowedStoreCurrency } from "@/lib/currencies";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function deleteProductAction(formData: FormData) {
  const id = formData.get("productId") as string;
  if (!id) return;
  const prisma = requirePrisma();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  redirect("/admin/products");
}

export async function createProductAction(formData: FormData) {
  const prisma = requirePrisma();
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priceCents = Number(formData.get("priceCents"));
  const currencyRaw = (formData.get("currency") as string)?.trim() || "USD";
  const currency = isAllowedStoreCurrency(currencyRaw) ? currencyRaw : "USD";
  const status = (formData.get("status") as ProductStatus) || "DRAFT";
  const slug = slugify((formData.get("slug") as string) || title || "product");
  const imagesRaw = (formData.get("images") as string)?.trim();
  const images = imagesRaw
    ? (imagesRaw.split("\n").map((u) => u.trim()).filter(Boolean) as string[])
    : null;
  const attributesRaw = (formData.get("attributes") as string)?.trim();
  let attributes: Record<string, unknown> | null = null;
  if (attributesRaw) {
    try {
      attributes = JSON.parse(attributesRaw) as Record<string, unknown>;
    } catch {
      attributes = null;
    }
  }
  const categoryIds = (formData.getAll("categoryIds") as string[])?.filter(Boolean) ?? [];
  const tagIds = (formData.getAll("tagIds") as string[])?.filter(Boolean) ?? [];
  const stockRaw = (formData.get("stockQuantity") as string)?.trim();
  const stockQuantity = stockRaw === "" ? null : Math.max(0, parseInt(stockRaw, 10) || 0);

  await prisma.product.create({
    data: {
      title: title || "Untitled",
      slug,
      description,
      priceCents: Number.isFinite(priceCents) ? priceCents : 0,
      currency,
      status,
      images: (images ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      attributes: (attributes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      stockQuantity,
      categories: categoryIds.length
        ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
        : undefined,
      tags: tagIds.length ? { create: tagIds.map((tagId) => ({ tagId })) } : undefined,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
}

export async function updateProductAction(formData: FormData) {
  const prisma = requirePrisma();
  const id = formData.get("productId") as string;
  if (!id) return;
  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const priceCents = Number(formData.get("priceCents"));
  const currencyRaw = (formData.get("currency") as string)?.trim() || "USD";
  const currency = isAllowedStoreCurrency(currencyRaw) ? currencyRaw : "USD";
  const status = (formData.get("status") as ProductStatus) || "DRAFT";
  const slug = (formData.get("slug") as string)?.trim();
  const imagesRaw = (formData.get("images") as string)?.trim();
  const images = imagesRaw
    ? (imagesRaw.split("\n").map((u) => u.trim()).filter(Boolean) as string[])
    : null;
  const attributesRaw = (formData.get("attributes") as string)?.trim();
  let attributes: Record<string, unknown> | null = null;
  if (attributesRaw) {
    try {
      attributes = JSON.parse(attributesRaw) as Record<string, unknown>;
    } catch {
      attributes = null;
    }
  }
  const categoryIds = (formData.getAll("categoryIds") as string[])?.filter(Boolean) ?? [];
  const tagIds = (formData.getAll("tagIds") as string[])?.filter(Boolean) ?? [];
  const stockRaw = (formData.get("stockQuantity") as string)?.trim();
  const stockQuantity = stockRaw === "" ? null : Math.max(0, parseInt(stockRaw, 10) || 0);

  await prisma.productCategory.deleteMany({ where: { productId: id } });
  await prisma.productTag.deleteMany({ where: { productId: id } });
  await prisma.product.update({
    where: { id },
    data: {
      ...(title && { title }),
      ...(slug && { slug }),
      description,
      priceCents: Number.isFinite(priceCents) ? priceCents : undefined,
      currency,
      status,
      images: (images ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      attributes: (attributes ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      stockQuantity,
      categories: { create: categoryIds.map((categoryId) => ({ categoryId })) },
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath(`/products/${slug}`);
}
