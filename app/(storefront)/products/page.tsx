import Link from "next/link";
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { getBannersByPlacement } from "@/lib/banners";
import { ProductCard } from "@/app/components/ProductCard";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { BannerSingle } from "@/app/components/BannerSingle";
import { ProductListSortPaginate, getOrderBy, PAGE_SIZE } from "@/app/components/ProductListSortPaginate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Products",
  description: "Browse all products. Filter by category and tag, sort by price or name.",
};

type Props = {
  searchParams: Promise<{ category?: string; tag?: string; sort?: string; page?: string }>;
};

export default async function ProductsPage({ searchParams }: Props) {
  const prisma = getPrisma();
  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);
  const { category: categorySlug, tag: tagSlug, sort, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  if (!prisma) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 text-center text-[var(--foreground)]/70">
          Database is not configured. Set <code className="rounded bg-[var(--pink-100)] px-1">DATABASE_URL</code> and run migrations.
        </div>
        <p className="mt-4 text-center">
          <Link href="/" className="text-[var(--pink-500)] hover:text-[var(--pink-600)]">Back to home</Link>
        </p>
      </div>
    );
  }

  const where: { status: "ACTIVE"; categories?: { some: { category: { slug: string } } }; tags?: { some: { tag: { slug: string } } } } = {
    status: "ACTIVE",
  };
  if (categorySlug) {
    where.categories = { some: { category: { slug: categorySlug } } };
  }
  if (tagSlug) {
    where.tags = { some: { tag: { slug: tagSlug } } };
  }

  const [totalCount, products, categories, tags, categoryTopBanners, categorySidebarBanners] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: getOrderBy(sort),
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        priceCents: true,
        currency: true,
        images: true,
      },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    getBannersByPlacement("CATEGORY_TOP"),
    getBannersByPlacement("CATEGORY_SIDEBAR"),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const activeCategory = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
  const activeTag = tagSlug ? tags.find((t) => t.slug === tagSlug) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {categoryTopBanners.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-4">
          {categoryTopBanners.map((b) => (
            <BannerSingle key={b.id} banner={b} />
          ))}
        </div>
      )}
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition duration-200 hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">Products</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          {categorySidebarBanners.length > 0 && (
            <div className="mb-6 flex flex-col gap-3">
              {categorySidebarBanners.map((b) => (
                <BannerSingle key={b.id} banner={b} />
              ))}
            </div>
          )}
          <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pink-500)]">
              Category
            </h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href="/products"
                  className={`block rounded-lg px-3 py-2 text-sm ${!categorySlug ? "bg-[var(--pink-100)] font-medium text-[var(--pink-600)]" : "text-[var(--foreground)]/80 hover:bg-[var(--pink-50)]"}`}
                >
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={categorySlug === c.slug ? "/products" : `/products?category=${c.slug}`}
                    className={`block rounded-lg px-3 py-2 text-sm ${categorySlug === c.slug ? "bg-[var(--pink-100)] font-medium text-[var(--pink-600)]" : "text-[var(--foreground)]/80 hover:bg-[var(--pink-50)]"}`}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
            <h2 className="mt-6 text-sm font-semibold uppercase tracking-wider text-[var(--pink-500)]">
              Tag
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              <Link
                href={categorySlug ? `/products?category=${categorySlug}` : "/products"}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${!tagSlug ? "bg-[var(--pink-500)] text-white" : "bg-[var(--pink-100)] text-[var(--pink-600)] hover:bg-[var(--pink-200)]"}`}
              >
                All
              </Link>
              {tags.map((t) => (
                <Link
                  key={t.id}
                  href={`/products?${categorySlug ? `category=${categorySlug}&` : ""}tag=${t.slug}`}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${tagSlug === t.slug ? "bg-[var(--pink-500)] text-white" : "bg-[var(--pink-100)] text-[var(--pink-600)] hover:bg-[var(--pink-200)]"}`}
                >
                  {t.name}
                </Link>
              ))}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <AnimateOnScroll animation="slide-up-small">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">
              {activeCategory || activeTag
                ? [activeCategory?.name, activeTag?.name].filter(Boolean).join(" · ")
                : "All products"}
            </h1>
            <span className="text-[var(--foreground)]/60">({totalCount})</span>
          </div>

          <ProductListSortPaginate
            basePath="/products"
            params={{ category: categorySlug, tag: tagSlug, sort, page }}
            totalCount={totalCount}
            totalPages={totalPages}
          />

          {products.length === 0 ? (
            <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-12 text-center text-[var(--foreground)]/70">
              No products match. Try another category or tag.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {products.map((p, i) => (
                <AnimateOnScroll key={p.id} animation="scale-in" delay={i * 40}>
                <ProductCard
                  key={p.id}
                  id={p.id}
                  title={p.title}
                  slug={p.slug}
                  description={p.description}
                  priceCents={convertPriceCents(p.priceCents, p.currency, storeCurrency, rates)}
                  currency={storeCurrency}
                  displayCurrency={storeCurrency}
                  images={p.images}
                />
                </AnimateOnScroll>
              ))}
            </div>
          )}
          </AnimateOnScroll>
        </div>
      </div>
    </div>
  );
}
