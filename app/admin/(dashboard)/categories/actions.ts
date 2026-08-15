"use server";

import { revalidatePath } from "next/cache";
import { requirePrisma } from "@/lib/prisma";

function slugify(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategoryAction(formData: FormData) {
  const prisma = requirePrisma();
  const name = (formData.get("name") as string)?.trim();
  const slug = slugify((formData.get("slug") as string) || name || "category");
  const parentId = (formData.get("parentId") as string) || null;
  const image = (formData.get("image") as string)?.trim() || null;
  if (!name) return;
  await prisma.category.create({
    data: { name, slug, parentId: parentId || undefined, image: image || undefined },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function updateCategoryAction(formData: FormData) {
  const prisma = requirePrisma();
  const id = formData.get("categoryId") as string;
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  const parentId = (formData.get("parentId") as string) || null;
  const image = (formData.get("image") as string)?.trim() || null;
  if (!id || !name || !slug) return;
  await prisma.category.update({
    where: { id },
    data: { name, slug, parentId: parentId || undefined, image: image || undefined },
  });
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
}

export async function deleteCategoryAction(formData: FormData) {
  const id = formData.get("categoryId") as string;
  if (!id) return;
  const prisma = requirePrisma();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  revalidatePath("/");
}
