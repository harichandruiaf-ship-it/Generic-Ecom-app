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

export async function createTagAction(formData: FormData) {
  const prisma = requirePrisma();
  const name = (formData.get("name") as string)?.trim();
  const slug = slugify((formData.get("slug") as string) || name || "tag");
  if (!name) return;
  await prisma.tag.create({ data: { name, slug } });
  revalidatePath("/admin");
  revalidatePath("/admin/tags");
  revalidatePath("/products");
}

export async function updateTagAction(formData: FormData) {
  const prisma = requirePrisma();
  const id = formData.get("tagId") as string;
  const name = (formData.get("name") as string)?.trim();
  const slug = (formData.get("slug") as string)?.trim();
  if (!id || !name || !slug) return;
  await prisma.tag.update({ where: { id }, data: { name, slug } });
  revalidatePath("/admin");
  revalidatePath("/admin/tags");
  revalidatePath("/products");
}

export async function deleteTagAction(formData: FormData) {
  const id = formData.get("tagId") as string;
  if (!id) return;
  const prisma = requirePrisma();
  await prisma.tag.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/admin/tags");
  revalidatePath("/products");
}
