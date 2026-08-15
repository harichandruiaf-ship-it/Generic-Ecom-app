import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { getBannersByPlacement } from "@/lib/banners";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { BannerSingle } from "@/app/components/BannerSingle";

export const dynamic = "force-dynamic";

export default async function TagsPage() {
  const prisma = getPrisma();
  const categoryTopBanners = await getBannersByPlacement("CATEGORY_TOP");

  if (!prisma) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 text-center text-[var(--foreground)]/70">
          Database not configured.
        </div>
      </div>
    );
  }

  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {categoryTopBanners.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-4">
          {categoryTopBanners.map((b) => (
            <BannerSingle key={b.id} banner={b} />
          ))}
        </div>
      )}
      <AnimateOnScroll animation="slide-up-small">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
            Tags
          </h1>
          <p className="mt-2 text-[var(--foreground)]/70">
            Browse products by tag.
          </p>
        </div>
      </AnimateOnScroll>

      <div className="flex flex-wrap gap-3">
        {tags.map((tag, i) => (
          <AnimateOnScroll key={tag.id} animation="slide-up-small" delay={i * 30}>
          <Link
            href={`/tags/${tag.slug}`}
            className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--pink-200)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--pink-600)] shadow-sm transition duration-200 hover:scale-105 hover:border-[var(--pink-400)] hover:bg-[var(--pink-50)]"
          >
            {tag.name}
            <span className="rounded-full bg-[var(--pink-100)] px-2 py-0.5 text-xs text-[var(--pink-500)]">
              {tag._count.products}
            </span>
          </Link>
          </AnimateOnScroll>
        ))}
      </div>

      {tags.length === 0 && (
        <p className="text-center text-[var(--foreground)]/60">No tags yet.</p>
      )}
    </div>
  );
}
