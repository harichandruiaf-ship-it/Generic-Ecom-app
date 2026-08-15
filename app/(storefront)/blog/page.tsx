import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { getSiteProfile } from "@/lib/site-profile";

export const dynamic = "force-dynamic";

export default async function BlogListPage() {
  const profile = await getSiteProfile();
  const prisma = getPrisma();

  const posts =
    prisma && typeof prisma.blogPost !== "undefined"
      ? await prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          orderBy: { publishedAt: "desc" },
          select: { slug: true, title: true, excerpt: true, publishedAt: true, imageUrl: true },
        })
      : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">Blog</h1>
      <p className="mt-2 text-[var(--foreground)]/70">Latest from {profile.siteName}</p>

      {posts.length === 0 ? (
        <p className="mt-8 text-[var(--foreground)]/60">No posts yet. Check back soon.</p>
      ) : (
        <ul className="mt-8 space-y-8">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="block rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6 transition hover:border-[var(--pink-300)] hover:shadow-md"
              >
                <h2 className="text-xl font-semibold text-[var(--pink-600)]">{p.title}</h2>
                {p.publishedAt && (
                  <p className="mt-1 text-sm text-[var(--foreground)]/50">
                    {new Date(p.publishedAt).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
                {p.excerpt && (
                  <p className="mt-2 text-[var(--foreground)]/80 line-clamp-2">{p.excerpt}</p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12">
        <Link href="/" className="text-sm font-medium text-[var(--pink-500)] hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
