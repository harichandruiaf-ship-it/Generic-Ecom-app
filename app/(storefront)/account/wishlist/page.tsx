import Link from "next/link";
import { getCurrentUser } from "@/lib/customer-auth";
import { getPrisma } from "@/lib/prisma";
import { ProductImage } from "@/app/components/ProductImage";
import { RemoveFromWishlistButton } from "./RemoveFromWishlistButton";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userWishlist === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-bold text-[var(--pink-600)]">Wishlist</h1>
        <p className="mt-2 text-[var(--foreground)]/70">Wishlist is not available.</p>
      </div>
    );
  }

  const wishlist = await prisma.userWishlist.findMany({
    where: { userId: user.id },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          priceCents: true,
          currency: true,
          images: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const activeItems = wishlist.filter((w) => w.product.status === "ACTIVE");

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">Wishlist</h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        Products you saved for later. Remove any you no longer need.
      </p>

      {activeItems.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-12 text-center">
          <p className="text-[var(--foreground)]/70">Your wishlist is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--pink-500)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--pink-600)]"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeItems.map((w) => {
            const p = w.product;
            const images = Array.isArray(p.images) ? (p.images as string[]) : [];
            const price = new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: p.currency,
            }).format(p.priceCents / 100);
            return (
              <li
                key={w.productId}
                className="flex gap-4 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-4"
              >
                <Link href={`/products/${p.slug}`} className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--pink-50)]">
                  {images[0] ? (
                    <ProductImage
                      src={images[0]}
                      alt={p.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--pink-400)]">
                      —
                    </div>
                  )}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${p.slug}`}
                    className="font-semibold text-[var(--pink-600)] hover:underline line-clamp-2"
                  >
                    {p.title}
                  </Link>
                  <p className="mt-0.5 text-sm font-medium text-[var(--pink-500)]">{price}</p>
                  <RemoveFromWishlistButton productId={p.id} className="mt-2 text-sm text-[var(--foreground)]/70 hover:text-red-600" />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
