import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { getBannersByPlacement } from "@/lib/banners";
import { getCartFromCookie } from "@/lib/cart";
import { getCurrentUser } from "@/lib/customer-auth";
import { ProductImage } from "@/app/components/ProductImage";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { AddToCartForm } from "@/app/components/AddToCartForm";
import { WishlistButton, WishlistButtonGuest } from "@/app/components/WishlistButton";
import { ProductReviews } from "@/app/components/ProductReviews";
import { BannerSingle } from "@/app/components/BannerSingle";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const prisma = getPrisma();
  if (!prisma) return { title: "Product" };

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { title: true, description: true, images: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") return { title: "Product" };

  const description =
    (product.description && product.description.slice(0, 160)) ||
    `${product.title} – shop at Ecom Store`;
  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const firstImage = images[0];
  const ogImage =
    firstImage && siteUrl
      ? (firstImage.startsWith("http") ? firstImage : `${siteUrl}${firstImage.startsWith("/") ? "" : "/"}${firstImage}`)
      : undefined;

  return {
    title: product.title,
    description,
    openGraph: {
      title: product.title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const prisma = getPrisma();

  if (!prisma) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 text-[var(--foreground)]/70">
          Database not configured.
        </div>
      </div>
    );
  }

  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      priceCents: true,
      currency: true,
      images: true,
      attributes: true,
      status: true,
      stockQuantity: true,
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        select: { id: true, authorName: true, rating: true, comment: true, createdAt: true },
      },
    },
  });

  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);
  let cartEnabled = true;
  if (typeof prisma.storeSettings !== "undefined") {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    cartEnabled = settings?.cartEnabled ?? true;
  }

  if (!product || product.status !== "ACTIVE") notFound();

  const cart = await getCartFromCookie();
  const cartQuantityForProduct = cart.items.find((i) => i.productId === product.id)?.quantity ?? 0;

  const user = await getCurrentUser();
  let inWishlist = false;
  if (user && prisma && typeof prisma.userWishlist !== "undefined") {
    const entry = await prisma.userWishlist.findUnique({
      where: { userId_productId: { userId: user.id, productId: product.id } },
    });
    inWishlist = !!entry;
  }

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const first = images[0] ?? null;
  const displayCents = convertPriceCents(product.priceCents, product.currency, storeCurrency, rates);
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: storeCurrency,
  }).format(displayCents / 100);
  const attributes =
    product.attributes && typeof product.attributes === "object"
      ? (product.attributes as Record<string, unknown>)
      : null;

  const approvedReviews = product.reviews ?? [];
  const averageRating =
    approvedReviews.length > 0
      ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length
      : null;

  const productPageBanners = await getBannersByPlacement("PRODUCT_PAGE");

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition duration-200 hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="transition duration-200 hover:text-[var(--pink-500)]">Products</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)] line-clamp-1">{product.title}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <AnimateOnScroll animation="scale-in">
        <div className="overflow-hidden rounded-2xl border-2 border-[var(--pink-200)] bg-white shadow-lg">
          <div className="relative aspect-[4/3] w-full bg-[var(--pink-50)]">
            {first ? (
              <ProductImage
                src={first}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[var(--pink-400)]">
                No image
              </div>
            )}
          </div>
        </div>
        </AnimateOnScroll>

        <AnimateOnScroll animation="slide-up" delay={100}>
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
            {product.title}
          </h1>
          <p className="mt-3 text-2xl font-bold text-[var(--pink-500)]">{price}</p>

          <AddToCartForm
            productId={product.id}
            cartEnabled={cartEnabled}
            maxQuantity={product.stockQuantity ?? undefined}
            initialCartQuantity={cartQuantityForProduct}
          />

          {user ? (
            <WishlistButton productId={product.id} inWishlist={inWishlist} />
          ) : (
            <WishlistButtonGuest />
          )}

          {(product.categories.length > 0 || product.tags.length > 0) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.categories.map(({ category }) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="rounded-full bg-[var(--pink-100)] px-3 py-1 text-xs font-medium text-[var(--pink-600)] hover:bg-[var(--pink-200)]"
                >
                  {category.name}
                </Link>
              ))}
              {product.tags.map(({ tag }) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.slug}`}
                  className="rounded-full bg-[var(--pink-100)] px-3 py-1 text-xs font-medium text-[var(--pink-600)] hover:bg-[var(--pink-200)]"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {product.description && (
            <p className="mt-6 leading-7 text-[var(--foreground)]/80">
              {product.description}
            </p>
          )}

          {attributes && Object.keys(attributes).length > 0 && (
            <div className="mt-8 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pink-500)]">
                Details
              </h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {Object.entries(attributes).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)]/50">
                      {key}
                    </dt>
                    <dd className="mt-1 font-medium text-[var(--foreground)]">
                      {typeof value === "string" || typeof value === "number"
                        ? String(value)
                        : JSON.stringify(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="mt-8">
            {typeof prisma.productReview !== "undefined" && (
              <ProductReviews
                productId={product.id}
                productSlug={product.slug}
                reviews={approvedReviews}
                averageRating={averageRating}
                isLoggedIn={!!user}
                userDisplayName={user?.name ?? null}
                userEmail={user?.email ?? null}
              />
            )}
          </div>

          {productPageBanners.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {productPageBanners.map((b) => (
                <BannerSingle key={b.id} banner={b} />
              ))}
            </div>
          )}

          <div className="mt-auto pt-8">
            <Link
              href="/products"
              className="inline-flex items-center text-sm font-medium text-[var(--pink-500)] hover:text-[var(--pink-600)]"
            >
              ← Back to products
            </Link>
          </div>
        </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
