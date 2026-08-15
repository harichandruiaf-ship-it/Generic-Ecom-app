import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { getBannersByPlacement } from "@/lib/banners";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { BannerSingle } from "@/app/components/BannerSingle";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const prisma = getPrisma();
  const categoryTopBanners = await getBannersByPlacement("CATEGORY_TOP");

  if (!prisma) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 text-center text-[var(--foreground)]/70">
          Database not configured. Set DATABASE_URL and run migrations.
        </div>
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: true,
      _count: { select: { products: true } },
    },
  });

  const rootCategories = categories.filter((c) => !c.parentId);
  const childCategories = categories.filter((c) => c.parentId);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {categoryTopBanners.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-4">
          {categoryTopBanners.map((b) => (
            <BannerSingle key={b.id} banner={b} />
          ))}
        </div>
      )}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
          Categories
        </h1>
        <p className="mt-2 text-[var(--foreground)]/70">
          Browse products by category.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {rootCategories.map((cat, i) => {
          const children = childCategories.filter((c) => c.parentId === cat.id);
          return (
            <AnimateOnScroll key={cat.id} animation="scale-in" delay={i * 60}>
              <div className="overflow-hidden rounded-2xl border-2 border-[var(--pink-200)] bg-white shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[var(--pink-300)] hover:shadow-lg">
                <Link
                  href={`/categories/${cat.slug}`}
                  className="block p-6 transition duration-200 hover:bg-[var(--pink-50)]"
                >
                  <h2 className="text-lg font-semibold text-[var(--pink-600)]">
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--foreground)]/60">
                    {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}
                  </p>
                </Link>
                {children.length > 0 && (
                  <div className="border-t border-[var(--pink-100)] px-6 py-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-[var(--pink-400)]">
                      Subcategories
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/categories/${child.slug}`}
                            className="text-sm text-[var(--pink-500)] hover:text-[var(--pink-600)]"
                          >
                            {child.name}
                          </Link>
                          {children.indexOf(child) < children.length - 1 && (
                            <span className="text-[var(--pink-300)]"> · </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          );
        })}
      </div>

      {childCategories.length > 0 && rootCategories.length === 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {childCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6 font-semibold text-[var(--pink-600)] transition hover:border-[var(--pink-400)] hover:bg-[var(--pink-50)]"
            >
              {cat.name}
              <span className="ml-2 text-sm font-normal text-[var(--foreground)]/60">
                ({cat._count.products})
              </span>
            </Link>
          ))}
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-center text-[var(--foreground)]/60">No categories yet.</p>
      )}
    </div>
  );
}
