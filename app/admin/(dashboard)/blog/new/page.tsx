import Link from "next/link";
import { BlogPostForm } from "../BlogPostForm";

export const dynamic = "force-dynamic";

export default function AdminNewBlogPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900">
          ← Blog
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">New blog post</h1>
      <BlogPostForm />
    </div>
  );
}
