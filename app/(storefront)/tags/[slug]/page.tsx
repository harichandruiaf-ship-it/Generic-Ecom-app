import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { ProductCard } from "@/app/components/ProductCard";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { ProductListSortPaginate, getOrderBy, PAGE_SIZE } from "@/app/components/ProductListSortPaginate";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const prisma = getPrisma();
  if (!prisma) return { title: "Tag" };
  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });
  if (!tag) return { title: "Tag" };
  return {
    title: tag.name,
    description: `Products tagged ${tag.name} – ${tag._count.products} product${tag._count.products !== 1 ? "s" : ""} at Ecom Store.`,
  };
}

export default async function TagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { sort, page } = await searchParams;
  const prisma = getPrisma();
  if (!prisma) notFound();
  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });
  if (!tag) notFound();

  const where = {
    status: "ACTIVE" as const,
    tags: { some: { tagId: tag.id } },
  };
  const currentPage = Math.max(1, parseInt(page ?? "1", 10) || 1);

  const [totalCount, products] = await Promise.all([
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
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition duration-200 hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/tags" className="transition duration-200 hover:text-[var(--pink-500)]">Tags</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">{tag.name}</span>
      </nav>

      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
          {tag.name}
        </h1>
        <p className="mt-2 text-[var(--foreground)]/70">
          {totalCount} product{totalCount !== 1 ? "s" : ""}
        </p>
      </div>

      <ProductListSortPaginate
        basePath={`/tags/${slug}`}
        params={{ sort, page }}
        totalCount={totalCount}
        totalPages={totalPages}
      />

      {products.length === 0 ? (
        <p className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-12 text-center text-[var(--foreground)]/70">
          No products with this tag yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p, i) => (
            <AnimateOnScroll key={p.id} animation="scale-in" delay={i * 50}>
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
    </div>
  );
}
