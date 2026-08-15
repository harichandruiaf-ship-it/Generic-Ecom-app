import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";

function formatOrderDate(date: Date) {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString();
}

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-zinc-100 text-zinc-600",
};

export default async function AdminOrdersPage() {
  const prisma = requirePrisma();
  if (typeof prisma.order === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Orders</h1>
        <p className="mt-2 text-zinc-500">Run migrations to enable orders.</p>
      </div>
    );
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Orders
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          View and manage customer orders. Click an order to see details and update status.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {orders.map((o) => (
              <tr key={o.id}>
                <td className="px-6 py-4 text-sm text-zinc-600">
                  {formatOrderDate(o.createdAt)}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-900">{o.email}</td>
                <td className="px-6 py-4 text-sm font-medium text-zinc-900">
                  {(o.totalCents / 100).toFixed(2)} {o.currency}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_COLORS[o.status] ?? "bg-zinc-100 text-zinc-700"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="text-sm font-medium text-[var(--pink-600)] hover:text-[var(--pink-700)]"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-zinc-500">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
