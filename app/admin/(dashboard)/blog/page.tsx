import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const prisma = requirePrisma();
  if (!prisma || typeof prisma.blogPost === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Blog</h1>
        <p className="mt-2 text-zinc-500">Blog is not available.</p>
      </div>
    );
  }

  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Blog</h1>
          <p className="mt-1 text-sm text-zinc-500">Manage blog posts. Publish to show on the storefront.</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
        >
          New post
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50 text-left text-zinc-600">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Published</th>
              <th className="px-4 py-3 font-medium">Created</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No posts yet. Create one to get started.
                </td>
              </tr>
            ) : (
              posts.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100">
                  <td className="px-4 py-3 font-medium text-zinc-900">{p.title}</td>
                  <td className="px-4 py-3">
                    <span className={p.status === "PUBLISHED" ? "text-green-600" : "text-amber-600"}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">
                    {p.publishedAt ? new Date(p.publishedAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${p.id}/edit`}
                      className="text-[var(--pink-600)] hover:underline"
                    >
                      Edit
                    </Link>
                    {" · "}
                    <Link
                      href={`/blog/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
