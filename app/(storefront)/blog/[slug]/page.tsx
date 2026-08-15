import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getSiteProfile } from "@/lib/site-profile";

export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prisma = getPrisma();
  if (!prisma || typeof prisma.blogPost === "undefined") notFound();

  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
  });

  if (!post) notFound();

  const profile = await getSiteProfile();

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
        {post.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/50" suppressHydrationWarning>
        {post.publishedAt
          ? new Date(post.publishedAt).toLocaleDateString("en-US", {
              timeZone: "UTC",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </p>
      {post.imageUrl && (
        <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-[var(--pink-100)]">
          <Image
            src={post.imageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            unoptimized
          />
        </div>
      )}
      <div
        className="prose prose-pink mt-8 max-w-none text-[var(--foreground)]/90 prose-headings:text-[var(--pink-600)] prose-a:text-[var(--pink-500)]"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      <nav className="mt-12 flex justify-between border-t border-[var(--pink-200)] pt-8">
        <Link href="/blog" className="text-sm font-medium text-[var(--pink-500)] hover:underline">
          ← All posts
        </Link>
        <Link href="/" className="text-sm font-medium text-[var(--pink-500)] hover:underline">
          {profile.siteName} home
        </Link>
      </nav>
    </article>
  );
}
