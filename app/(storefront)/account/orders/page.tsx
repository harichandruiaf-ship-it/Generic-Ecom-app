import Link from "next/link";
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

export default async function MyOrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const prisma = getPrisma();
  if (!prisma || typeof prisma.order === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">My orders</h1>
        <p className="mt-2 text-[var(--foreground)]/70">Orders are not available.</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">My orders</h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        View and track your orders. Click an order for details and tracking.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-12 text-center">
          <p className="text-[var(--foreground)]/70">You have no orders yet.</p>
          <Link
            href="/products"
            className="mt-4 inline-block rounded-lg bg-[var(--pink-500)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--pink-600)]"
          >
            Start shopping
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => (
            <li key={order.id}>
              <Link
                href={`/account/orders/${order.id}`}
                className="block rounded-2xl border-2 border-[var(--pink-200)] bg-white p-5 transition hover:border-[var(--pink-300)] hover:shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="font-mono text-sm font-medium text-[var(--pink-600)]">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="ml-2 rounded-full bg-[var(--pink-100)] px-2 py-0.5 text-xs font-medium text-[var(--pink-700)]">
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-[var(--foreground)]">
                      {(order.totalCents / 100).toFixed(2)} {order.currency}
                    </p>
                    <p className="text-[var(--foreground)]/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[var(--foreground)]/70">
                  {order.items.length} item(s) · {order.shippingName}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
