import Link from "next/link";
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { getBannersByPlacement } from "@/lib/banners";
import { ProductCard } from "@/app/components/ProductCard";
import { BannerCarousel } from "@/app/components/BannerCarousel";
import { BannerGrid } from "@/app/components/BannerGrid";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
  description: "Discover curated products. Shop by category and tag, simple checkout.",
};

export default async function HomePage() {
  const prisma = getPrisma();
  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);

  const [categories, tags, featuredProducts, homeHeroBanners, homePromoBanners] = prisma
    ? await Promise.all([
        prisma.category.findMany({
          orderBy: { name: "asc" },
          take: 12,
          where: { parentId: null },
        }),
        prisma.tag.findMany({ orderBy: { name: "asc" }, take: 16 }),
        prisma.product.findMany({
          where: { status: "ACTIVE" },
          orderBy: { updatedAt: "desc" },
          take: 8,
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            priceCents: true,
            currency: true,
            images: true,
          },
        }),
        getBannersByPlacement("HOME_HERO"),
        getBannersByPlacement("HOME_PROMO_GRID"),
      ])
    : [[], [], [], [], []];

  return (
    <div className="min-h-screen">
      {/* Hero – ZAKSHOP-style bold block */}
      <section className="relative overflow-hidden bg-[var(--pink-500)]">
        <div
          className="blob-shape absolute -right-20 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[var(--accent)]/30 opacity-80 blur-2xl"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-[var(--accent)]/20 blur-3xl" aria-hidden />

        <div className="relative grid w-full gap-8 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center text-white">
            <p className="hero-stagger-1 text-sm font-medium uppercase tracking-[0.2em] text-white/90">
              New collection
            </p>
            <h1 className="hero-stagger-2 mt-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Curated products,{" "}
              <span className="text-[var(--accent)]">simple shopping</span>
            </h1>
            <p className="hero-stagger-3 mt-6 max-w-lg text-lg leading-relaxed text-white/90">
              Explore by category or tag. Find what you need without the clutter—elegant, fast, and made for you.
            </p>
            <div className="hero-stagger-4 mt-10 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-lg border-2 border-white bg-transparent px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition duration-300 hover:scale-105 hover:bg-white hover:text-[var(--pink-500)]"
              >
                Shop now
                <span aria-hidden>→</span>
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white backdrop-blur transition duration-300 hover:scale-105 hover:bg-white/20"
              >
                Browse categories
              </Link>
            </div>
          </div>
          <div className="hero-circle relative hidden items-center justify-center lg:flex">
            <div className="relative h-80 w-80 overflow-hidden rounded-full border-4 border-white/20 bg-[var(--pink-400)]/50">
              <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-90">✨</div>
            </div>
          </div>
        </div>
      </section>

      {homeHeroBanners.length > 0 && (
        <AnimateOnScroll animation="fade-in">
          <BannerCarousel banners={homeHeroBanners} />
        </AnimateOnScroll>
      )}

      {homePromoBanners.length > 0 && (
        <AnimateOnScroll animation="slide-up">
          <BannerGrid banners={homePromoBanners} />
        </AnimateOnScroll>
      )}

      {categories.length > 0 && (
        <AnimateOnScroll animation="slide-up">
          <section className="w-full px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">
                Shop by category
              </h2>
              <Link
                href="/categories"
                className="text-sm font-medium text-[var(--pink-500)] transition duration-200 hover:text-[var(--pink-600)]"
              >
                View all →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat, i) => (
                <AnimateOnScroll key={cat.id} animation="scale-in" delay={i * 50}>
                  <Link
                    href={`/categories/${cat.slug}`}
                    className="group relative block overflow-hidden rounded-2xl border-2 border-[var(--pink-200)] shadow-md transition duration-300 hover:border-[var(--pink-400)] hover:shadow-lg hover:-translate-y-0.5"
                  >
                    <div className="aspect-[4/3] w-full bg-[var(--pink-100)]">
                      {cat.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={cat.image}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl text-[var(--pink-300)]" aria-hidden>
                          🛍
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 transition duration-300 group-hover:bg-black/50">
                      <span className="font-semibold text-white drop-shadow-md">
                        {cat.name}
                      </span>
                      <span className="mt-1 text-sm text-white/90">
                        Shop now
                      </span>
                    </div>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </section>
        </AnimateOnScroll>
      )}

      {tags.length > 0 && (
        <AnimateOnScroll animation="slide-up">
          <section className="border-y border-[var(--pink-200)] bg-white py-12">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <h2 className="text-center text-xl font-bold tracking-tight text-[var(--pink-600)]">
                Shop by tag
              </h2>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                {tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full border-2 border-[var(--pink-200)] bg-[var(--pink-50)] px-4 py-2 text-sm font-medium text-[var(--pink-600)] transition duration-200 hover:scale-105 hover:border-[var(--pink-400)] hover:bg-[var(--pink-100)]"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-center">
                <Link
                  href="/tags"
                  className="text-sm font-medium text-[var(--pink-500)] transition duration-200 hover:text-[var(--pink-600)]"
                >
                  View all tags →
                </Link>
              </p>
            </div>
          </section>
        </AnimateOnScroll>
      )}

      <AnimateOnScroll animation="slide-up">
        <section className="w-full px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">
              {prisma ? "Featured products" : "Store"}
            </h2>
            {prisma && featuredProducts.length > 0 && (
              <Link
                href="/products"
                className="text-sm font-medium text-[var(--pink-500)] transition duration-200 hover:text-[var(--pink-600)]"
              >
                View all →
              </Link>
            )}
          </div>

          {!prisma ? (
            <div className="mt-8 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 text-center text-[var(--foreground)]/70">
            <p>
              Database is not configured. Set <code className="rounded bg-[var(--pink-100)] px-1">DATABASE_URL</code> in{" "}
              <code className="rounded bg-[var(--pink-100)] px-1">.env</code>, then run{" "}
              <code className="rounded bg-[var(--pink-100)] px-1">npm run db:migrate</code> and{" "}
              <code className="rounded bg-[var(--pink-100)] px-1">npm run db:seed</code>.
            </p>
            <Link
              href="/products"
              className="mt-4 inline-block text-sm font-medium text-[var(--pink-500)] underline"
            >
              Go to products
            </Link>
          </div>
        ) : featuredProducts.length === 0 ? (
          <p className="mt-8 text-center text-[var(--foreground)]/60">
            No products yet. Add some in the admin.
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {featuredProducts.map((p) => (
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
            ))}
          </div>
          )}
        </section>
      </AnimateOnScroll>
    </div>
  );
}
