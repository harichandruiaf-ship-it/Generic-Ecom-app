import Link from "next/link";
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { ProductCard } from "@/app/components/ProductCard";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { SearchForm } from "./SearchForm";
import { PAGE_SIZE } from "@/app/components/ProductListSortPaginate";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Search",
  description: "Search products by name, filter by category and price.",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; minPrice?: string; maxPrice?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const prisma = getPrisma();
  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);
  const { q, category: categorySlug, minPrice, maxPrice, page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  if (!prisma) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 text-center text-[var(--foreground)]/70">
          Database is not configured.
        </div>
        <Link href="/" className="mt-4 inline-block text-[var(--pink-500)] hover:underline">Back to home</Link>
      </div>
    );
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  type Where = {
    status: "ACTIVE";
    title?: { contains: string; mode: "insensitive" };
    categories?: { some: { category: { slug: string } } };
    priceCents?: { gte?: number; lte?: number };
  };

  const where: Where = { status: "ACTIVE" };

  const query = (q ?? "").trim();
  if (query.length > 0) {
    where.title = { contains: query, mode: "insensitive" };
  }
  if (categorySlug) {
    where.categories = { some: { category: { slug: categorySlug } } };
  }
  // minPrice/maxPrice from URL are in dollars (e.g. "25" = $25)
  const minPriceCents = minPrice ? parseInt(minPrice, 10) * 100 : NaN;
  const maxPriceCents = maxPrice ? parseInt(maxPrice, 10) * 100 : NaN;
  if (!Number.isNaN(minPriceCents) || !Number.isNaN(maxPriceCents)) {
    where.priceCents = {};
    if (!Number.isNaN(minPriceCents) && minPriceCents >= 0) where.priceCents.gte = minPriceCents;
    if (!Number.isNaN(maxPriceCents) && maxPriceCents >= 0) where.priceCents.lte = maxPriceCents;
  }

  const [totalCount, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
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
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition duration-200 hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">Search</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">Search products</h1>
        <SearchForm
          initialQuery={query}
          initialCategory={categorySlug ?? ""}
          initialMinPrice={minPrice ?? ""}
          initialMaxPrice={maxPrice ?? ""}
          categories={categories}
        />
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 lg:shrink-0">
          <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pink-500)]">Filter by category</h2>
            <ul className="mt-3 space-y-1">
              <li>
                <Link
                  href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
                  className={`block rounded-lg px-3 py-2 text-sm ${!categorySlug ? "bg-[var(--pink-100)] font-medium text-[var(--pink-600)]" : "text-[var(--foreground)]/80 hover:bg-[var(--pink-50)]"}`}
                >
                  All
                </Link>
              </li>
              {categories.map((c) => {
                const href = `/search?${query ? `q=${encodeURIComponent(query)}&` : ""}category=${c.slug}`;
                return (
                  <li key={c.id}>
                    <Link
                      href={href}
                      className={`block rounded-lg px-3 py-2 text-sm ${categorySlug === c.slug ? "bg-[var(--pink-100)] font-medium text-[var(--pink-600)]" : "text-[var(--foreground)]/80 hover:bg-[var(--pink-50)]"}`}
                    >
                      {c.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[var(--foreground)]/60">
              {totalCount} result{totalCount !== 1 ? "s" : ""}
              {query && (
                <> for &ldquo;{query}&rdquo;</>
              )}
            </span>
            {totalPages > 1 && (
              <nav className="flex items-center gap-2" aria-label="Pagination">
                {currentPage > 1 ? (
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...(query && { q: query }),
                      ...(categorySlug && { category: categorySlug }),
                      ...(minPrice && { minPrice }),
                      ...(maxPrice && { maxPrice }),
                      page: String(currentPage - 1),
                    }).toString()}`}
                    className="rounded-lg border-2 border-[var(--pink-200)] px-3 py-1.5 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="rounded-lg border-2 border-[var(--pink-100)] px-3 py-1.5 text-sm text-[var(--foreground)]/40 cursor-not-allowed">Previous</span>
                )}
                <span className="text-sm text-[var(--foreground)]/70">Page {currentPage} of {totalPages}</span>
                {currentPage < totalPages ? (
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...(query && { q: query }),
                      ...(categorySlug && { category: categorySlug }),
                      ...(minPrice && { minPrice }),
                      ...(maxPrice && { maxPrice }),
                      page: String(currentPage + 1),
                    }).toString()}`}
                    className="rounded-lg border-2 border-[var(--pink-200)] px-3 py-1.5 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="rounded-lg border-2 border-[var(--pink-100)] px-3 py-1.5 text-sm text-[var(--foreground)]/40 cursor-not-allowed">Next</span>
                )}
              </nav>
            )}
          </div>

          {products.length === 0 ? (
            <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-12 text-center text-[var(--foreground)]/70">
              No products match. Try different keywords or filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {products.map((p, i) => (
                <AnimateOnScroll key={p.id} animation="scale-in" delay={i * 40}>
                  <ProductCard
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
        </div>
      </div>
    </div>
  );
}
