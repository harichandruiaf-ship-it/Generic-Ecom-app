import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/customer-auth";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) return null;

  const { id } = await params;
  const prisma = getPrisma();
  if (!prisma || typeof prisma.order === "undefined") notFound();

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: true, shippingMethod: true },
  });

  if (!order) notFound();

  // For delivered orders: which products has this user already reviewed?
  let reviewedProductIds: Set<string> = new Set();
  if (order.status === "DELIVERED" && order.items.length > 0 && typeof prisma.productReview !== "undefined") {
    const productIds = [...new Set(order.items.map((i) => i.productId).filter(Boolean))] as string[];
    if (productIds.length > 0) {
      const reviews = await prisma.productReview.findMany({
        where: { userId: user.id, productId: { in: productIds } },
        select: { productId: true },
      });
      reviews.forEach((r) => reviewedProductIds.add(r.productId));
    }
  }

  // Unique products in this order (by productId) for "Review your items"
  const uniqueOrderProducts =
    order.status === "DELIVERED"
      ? Array.from(
          order.items
            .filter((i) => i.productId)
            .reduce(
              (acc, i) => {
                if (i.productId && !acc.has(i.productId)) acc.set(i.productId, { productId: i.productId, title: i.title, slug: i.slug });
                return acc;
              },
              new Map<string, { productId: string; title: string; slug: string }>()
            )
            .values()
        )
      : [];

  return (
    <div className="space-y-6">
      <nav className="text-sm text-[var(--foreground)]/70">
        <Link href="/account/orders" className="hover:text-[var(--pink-500)]">
          ← My orders
        </Link>
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">
            Order #{order.id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-1 text-sm text-[var(--foreground)]/70">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="rounded-full bg-[var(--pink-200)] px-3 py-1.5 text-sm font-semibold text-[var(--pink-700)]">
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      {/* Track */}
      {(order.status === "SHIPPED" || order.status === "DELIVERED") && order.trackingCode && (
        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Tracking</h2>
          <p className="mt-2 font-mono text-sm text-[var(--pink-600)]">{order.trackingCode}</p>
          <p className="mt-1 text-xs text-[var(--foreground)]/60">
            Use this code on the carrier&apos;s website to track your shipment.
          </p>
        </section>
      )}

      {/* Review your items — only for delivered orders */}
      {order.status === "DELIVERED" && uniqueOrderProducts.length > 0 && (
        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Review your items</h2>
          <p className="mt-1 text-sm text-[var(--foreground)]/60">
            Share your experience with products from this order.
          </p>
          <ul className="mt-4 space-y-3">
            {uniqueOrderProducts.map((p) => (
              <li
                key={p.productId}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--pink-100)] p-3"
              >
                <span className="font-medium text-[var(--foreground)]">{p.title}</span>
                {reviewedProductIds.has(p.productId) ? (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="text-[var(--foreground)]/60">
                      You already reviewed this. Your reviews are valuable to us — want to share more?
                    </span>
                    <Link
                      href={`/products/${p.slug}#reviews`}
                      className="rounded-lg border border-[var(--pink-300)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]"
                    >
                      Review again
                    </Link>
                  </div>
                ) : (
                  <Link
                    href={`/products/${p.slug}#reviews`}
                    className="rounded-lg bg-[var(--pink-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--pink-600)]"
                  >
                    Write a review
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/60">
            Shipping address
          </h2>
          <p className="mt-3 text-sm text-[var(--foreground)]">
            {order.shippingName}
            <br />
            {order.shippingLine1}
            {order.shippingLine2 && <>, {order.shippingLine2}</>}
            <br />
            {order.shippingCity}
            {order.shippingState && `, ${order.shippingState}`}
            {order.shippingPostalCode && ` ${order.shippingPostalCode}`}
            <br />
            {order.shippingCountry}
          </p>
        </section>

        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--foreground)]/60">
            Items
          </h2>
          <ul className="mt-3 divide-y divide-[var(--pink-100)]">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between py-2 text-sm">
                <span className="text-[var(--foreground)]">
                  {item.title} × {item.quantity}
                </span>
                <span className="font-medium text-[var(--foreground)]">
                  {(item.totalCents / 100).toFixed(2)} {order.currency}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 border-t border-[var(--pink-200)] pt-3 space-y-1 text-sm">
            <div className="flex justify-between text-[var(--foreground)]/70">
              <span>Subtotal</span>
              <span>{(order.subtotalCents / 100).toFixed(2)} {order.currency}</span>
            </div>
            {order.shippingCents > 0 && (
              <div className="flex justify-between text-[var(--foreground)]/70">
                <span>Shipping</span>
                <span>{(order.shippingCents / 100).toFixed(2)} {order.currency}</span>
              </div>
            )}
            {order.taxCents > 0 && (
              <div className="flex justify-between text-[var(--foreground)]/70">
                <span>Tax</span>
                <span>{(order.taxCents / 100).toFixed(2)} {order.currency}</span>
              </div>
            )}
            {(order.discountCents ?? 0) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
                <span>-{((order.discountCents ?? 0) / 100).toFixed(2)} {order.currency}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-[var(--foreground)]">
              <span>Total</span>
              <span>{(order.totalCents / 100).toFixed(2)} {order.currency}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
