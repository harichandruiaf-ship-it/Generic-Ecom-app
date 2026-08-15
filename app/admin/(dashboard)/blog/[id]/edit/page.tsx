import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { BlogPostEditForm } from "../../BlogPostEditForm";

export const dynamic = "force-dynamic";

export default async function AdminEditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = requirePrisma();
  if (!prisma || typeof prisma.blogPost === "undefined") notFound();

  const post = await prisma.blogPost.findUnique({ where: { id } });
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          ← Blog
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit: {post.title}</h1>
      <BlogPostEditForm post={post} />
    </div>
  );
}
