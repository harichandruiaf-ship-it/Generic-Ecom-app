import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { getCartFromCookie } from "@/lib/cart";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { getBannersByPlacement } from "@/lib/banners";
import { ProductImage } from "@/app/components/ProductImage";
import { BannerStrip } from "@/app/components/BannerStrip";
import { CartItemActions } from "./CartItemActions";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCartFromCookie();
  const prisma = getPrisma();
  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);

  let cartEnabled = true;
  let checkoutEnabled = true;
  let minimumOrderCents = 0;
  if (prisma && typeof prisma.storeSettings !== "undefined") {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    cartEnabled = settings?.cartEnabled ?? true;
    checkoutEnabled = settings?.checkoutEnabled ?? true;
    minimumOrderCents = settings?.minimumOrderCents ?? 0;
  }

  if (!cartEnabled) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[var(--pink-600)]">Cart</h1>
        <p className="mt-4 text-[var(--foreground)]/70">Cart is currently disabled.</p>
        <Link href="/products" className="mt-6 inline-block text-[var(--pink-500)] hover:underline">
          Continue shopping
        </Link>
      </div>
    );
  }

  const subtotalCents = cart.items.reduce((sum, i) => {
    const itemCents = convertPriceCents(i.priceCents, i.currency ?? "USD", storeCurrency, rates);
    return sum + itemCents * i.quantity;
  }, 0);
  const meetsMinimum = minimumOrderCents <= 0 || subtotalCents >= minimumOrderCents;
  const cartPromoBanners = await getBannersByPlacement("CART_PROMO");
  const subtotalFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: storeCurrency,
  }).format(subtotalCents / 100);
  const minimumFormatted =
    minimumOrderCents > 0
      ? new Intl.NumberFormat("en-US", { style: "currency", currency: storeCurrency }).format(minimumOrderCents / 100)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition duration-200 hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">Cart</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
        Your cart
      </h1>

      {cartPromoBanners.length > 0 && (
        <div className="mt-6">
          <BannerStrip banners={cartPromoBanners} />
        </div>
      )}

      {cart.items.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-12 text-center">
          <p className="text-[var(--foreground)]/70">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--pink-500)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-[var(--pink-50)]">
                  {item.image ? (
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--pink-400)]">
                      No image
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-semibold text-[var(--pink-600)] hover:underline"
                  >
                    {item.title}
                  </Link>
                  <p className="mt-0.5 text-sm font-medium text-[var(--pink-500)]">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: storeCurrency,
                    }).format(convertPriceCents(item.priceCents, item.currency ?? "USD", storeCurrency, rates) / 100)}{" "}
                    × {item.quantity}
                  </p>
                  <CartItemActions productId={item.productId} quantity={item.quantity} />
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--foreground)]">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: storeCurrency,
                    }).format((convertPriceCents(item.priceCents, item.currency ?? "USD", storeCurrency, rates) * item.quantity) / 100)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:w-80">
            <div className="sticky top-24 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
              <h2 className="text-lg font-semibold text-[var(--pink-600)]">Summary</h2>
              <div className="mt-4 flex justify-between text-sm">
                <span className="text-[var(--foreground)]/70">Subtotal</span>
                <span className="font-medium">{subtotalFormatted}</span>
              </div>
              <p className="mt-2 text-xs text-[var(--foreground)]/60">
                Tax and shipping calculated at checkout.
              </p>
              {minimumFormatted && !meetsMinimum && (
                <p className="mt-2 text-sm text-amber-700">
                  Minimum order is {minimumFormatted}. Add more items to checkout.
                </p>
              )}
              {checkoutEnabled ? (
                meetsMinimum ? (
                  <Link
                    href="/checkout"
                    className="mt-6 block w-full rounded-lg bg-[var(--pink-500)] py-3 text-center text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
                  >
                    Proceed to checkout
                  </Link>
                ) : (
                  <span className="mt-6 block w-full rounded-lg bg-[var(--pink-200)] py-3 text-center text-sm font-semibold text-[var(--pink-700)] cursor-not-allowed">
                    Proceed to checkout
                  </span>
                )
              ) : (
                <p className="mt-4 text-sm text-[var(--foreground)]/60">
                  Checkout is temporarily disabled.
                </p>
              )}
              <Link
                href="/products"
                className="mt-4 block text-center text-sm font-medium text-[var(--pink-500)] hover:text-[var(--pink-600)]"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
