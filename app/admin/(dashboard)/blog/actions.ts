"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createBlogPostAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.blogPost === "undefined") redirect("/admin");

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const status = formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  if (!title) redirect("/admin/blog/new");

  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = "post";
  let slug = baseSlug;
  let n = 0;
  while (await prisma.blogPost.findUnique({ where: { slug } })) {
    n++;
    slug = `${baseSlug}-${n}`;
  }

  const publishedAt = status === "PUBLISHED" ? new Date() : null;
  await prisma.blogPost.create({
    data: {
      title,
      slug,
      excerpt,
      content,
      imageUrl,
      status,
      publishedAt,
    },
  });

  revalidatePath("/admin/blog");
  revalidatePath("/blog", "layout");
  redirect("/admin/blog");
}

export async function updateBlogPostAction(id: string, formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.blogPost === "undefined") redirect("/admin");

  const title = (formData.get("title") as string)?.trim();
  const content = (formData.get("content") as string)?.trim() ?? "";
  const excerpt = (formData.get("excerpt") as string)?.trim() || null;
  const imageUrl = (formData.get("imageUrl") as string)?.trim() || null;
  const status = formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  if (!title) redirect(`/admin/blog/${id}/edit`);

  const existing = await prisma.blogPost.findUnique({ where: { id } });
  if (!existing) redirect("/admin/blog");

  let slug = existing.slug;
  const newBaseSlug = slugify(title);
  if (newBaseSlug && newBaseSlug !== existing.slug) {
    slug = newBaseSlug;
    let n = 0;
    while (await prisma.blogPost.findFirst({ where: { slug, id: { not: id } } })) {
      n++;
      slug = `${newBaseSlug}-${n}`;
    }
  }

  const publishedAt =
    status === "PUBLISHED"
      ? existing.publishedAt ?? new Date()
      : null;

  await prisma.blogPost.update({
    where: { id },
    data: { title, slug, excerpt, content, imageUrl, status, publishedAt },
  });

  revalidatePath("/admin/blog");
  revalidatePath(`/admin/blog/${id}/edit`);
  revalidatePath("/blog", "layout");
  revalidatePath(`/blog/${existing.slug}`, "layout");
  revalidatePath(`/blog/${slug}`, "layout");
  redirect("/admin/blog");
}

export async function deleteBlogPostAction(id: string) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.blogPost === "undefined") redirect("/admin");

  await prisma.blogPost.delete({ where: { id } });

  revalidatePath("/admin/blog");
  revalidatePath("/blog", "layout");
  redirect("/admin/blog");
}
