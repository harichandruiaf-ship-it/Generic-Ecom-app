import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getLowStockThreshold } from "@/lib/inventory";
import { DashboardCharts } from "./DashboardCharts";

export const dynamic = "force-dynamic";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function startOfWeek(d: Date) {
  const x = new Date(d);
  const day = x.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  x.setUTCDate(x.getUTCDate() - diff);
  x.setUTCHours(0, 0, 0, 0);
  return x;
}

function dateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminDashboardPage() {
  const prisma = requirePrisma();
  const storeCurrency = await getStoreCurrency();

  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = startOfWeek(now);

  const hasOrders = typeof prisma.order !== "undefined";

  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  fourteenDaysAgo.setUTCHours(0, 0, 0, 0);

  const lowStockThreshold = await getLowStockThreshold();

  const [
    productCount,
    categoryCount,
    tagCount,
    outOfStockCount,
    lowStockCount,
    recentProducts,
    ordersToday,
    ordersThisWeek,
    revenueToday,
    revenueThisWeek,
    recentOrders,
    ordersLast14Days,
    ordersByStatusRows,
    orderItemsForTop,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.tag.count(),
    prisma.product.count({ where: { stockQuantity: 0 } }),
    prisma.product.count({
      where: {
        stockQuantity: { not: null, gt: 0, lte: lowStockThreshold },
      },
    }),
    prisma.product.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    }),
    hasOrders
      ? prisma.order.count({ where: { createdAt: { gte: todayStart } } })
      : 0,
    hasOrders
      ? prisma.order.count({ where: { createdAt: { gte: weekStart } } })
      : 0,
    hasOrders
      ? prisma.order.aggregate({
          where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } },
          _sum: { totalCents: true },
        })
      : { _sum: { totalCents: null } },
    hasOrders
      ? prisma.order.aggregate({
          where: { createdAt: { gte: weekStart }, status: { not: "CANCELLED" } },
          _sum: { totalCents: true },
        })
      : { _sum: { totalCents: null } },
    hasOrders
      ? prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            email: true,
            totalCents: true,
            currency: true,
            status: true,
            createdAt: true,
          },
        })
      : [],
    hasOrders && typeof prisma.order !== "undefined"
      ? prisma.order.findMany({
          where: { createdAt: { gte: fourteenDaysAgo }, status: { not: "CANCELLED" } },
          select: { createdAt: true, totalCents: true },
        })
      : [],
    hasOrders && typeof prisma.order !== "undefined"
      ? prisma.order.groupBy({
          by: ["status"],
          _count: { id: true },
        })
      : [],
    hasOrders && typeof prisma.orderItem !== "undefined"
      ? prisma.orderItem.findMany({
          where: { order: { status: { not: "CANCELLED" } } },
          select: { title: true, quantity: true },
        })
      : [],
  ]);

  const revenueByDay: { date: string; revenue: number; orders: number }[] = [];
  if (ordersLast14Days && ordersLast14Days.length > 0) {
    const byDay = new Map<string, { revenue: number; orders: number }>();
    for (let i = 0; i < 14; i++) {
      const d = new Date(fourteenDaysAgo);
      d.setDate(d.getDate() + i);
      byDay.set(dateKey(d), { revenue: 0, orders: 0 });
    }
    for (const o of ordersLast14Days) {
      const key = dateKey(new Date(o.createdAt));
      const cur = byDay.get(key) ?? { revenue: 0, orders: 0 };
      cur.revenue += o.totalCents;
      cur.orders += 1;
      byDay.set(key, cur);
    }
    byDay.forEach((v, date) => revenueByDay.push({ date, revenue: v.revenue, orders: v.orders }));
    revenueByDay.sort((a, b) => a.date.localeCompare(b.date));
  }

  const ordersByStatus = (ordersByStatusRows ?? []).map((r) => ({
    status: r.status,
    count: r._count.id,
  }));

  const productQuantity = new Map<string, number>();
  for (const item of orderItemsForTop ?? []) {
    const name = item.title.length > 25 ? item.title.slice(0, 22) + "…" : item.title;
    productQuantity.set(name, (productQuantity.get(name) ?? 0) + item.quantity);
  }
  const topProducts = Array.from(productQuantity.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const revToday = revenueToday._sum?.totalCents ?? 0;
  const revWeek = revenueThisWeek._sum?.totalCents ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Overview of your store content and orders.
        </p>
      </div>

      {hasOrders && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/admin/orders"
            className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-zinc-500">Orders today</p>
            <p className="mt-2 truncate text-2xl font-semibold text-zinc-900 sm:text-3xl">
              {ordersToday}
            </p>
            <p className="mt-1 text-sm text-zinc-600">View orders →</p>
          </Link>
          <Link
            href="/admin/orders"
            className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <p className="text-sm font-medium text-zinc-500">Orders this week</p>
            <p className="mt-2 truncate text-2xl font-semibold text-zinc-900 sm:text-3xl">
              {ordersThisWeek}
            </p>
            <p className="mt-1 text-sm text-zinc-600">View orders →</p>
          </Link>
          <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Revenue today</p>
            <p className="mt-2 break-words text-xl font-semibold text-zinc-900 sm:text-2xl lg:text-3xl">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: storeCurrency }).format(revToday / 100)}
            </p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-zinc-500">Revenue this week</p>
            <p className="mt-2 break-words text-xl font-semibold text-zinc-900 sm:text-2xl lg:text-3xl">
              {new Intl.NumberFormat("en-US", { style: "currency", currency: storeCurrency }).format(revWeek / 100)}
            </p>
          </div>
        </div>
      )}

      {hasOrders && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">Business insights</h2>
          <DashboardCharts
            revenueByDay={revenueByDay}
            ordersByStatus={ordersByStatus}
            topProducts={topProducts}
            storeCurrency={storeCurrency}
          />
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/products"
          className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <p className="text-sm font-medium text-zinc-500">Products</p>
          <p className="mt-2 truncate text-2xl font-semibold text-zinc-900 sm:text-3xl">
            {productCount}
          </p>
          <p className="mt-1 text-sm text-zinc-600">View & manage →</p>
        </Link>
        <Link
          href="/admin/inventory"
          className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <p className="text-sm font-medium text-zinc-500">Inventory</p>
          <p className="mt-2 truncate text-2xl font-semibold text-zinc-900 sm:text-3xl">
            {lowStockCount + outOfStockCount > 0 ? (
              <span className="text-amber-600">{lowStockCount + outOfStockCount} need attention</span>
            ) : (
              "OK"
            )}
          </p>
          <p className="mt-1 text-sm text-zinc-600">
            {outOfStockCount} out of stock · {lowStockCount} low stock
          </p>
        </Link>
        <Link
          href="/admin/categories"
          className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <p className="text-sm font-medium text-zinc-500">Categories</p>
          <p className="mt-2 truncate text-2xl font-semibold text-zinc-900 sm:text-3xl">
            {categoryCount}
          </p>
          <p className="mt-1 text-sm text-zinc-600">View & manage →</p>
        </Link>
        <Link
          href="/admin/tags"
          className="min-w-0 overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md"
        >
          <p className="text-sm font-medium text-zinc-500">Tags</p>
          <p className="mt-2 truncate text-2xl font-semibold text-zinc-900 sm:text-3xl">
            {tagCount}
          </p>
          <p className="mt-1 text-sm text-zinc-600">View & manage →</p>
        </Link>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-200 px-6 py-4">
          <h2 className="font-semibold text-zinc-900">Recent products</h2>
        </div>
        <ul className="divide-y divide-zinc-100">
          {recentProducts.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-zinc-500">
              No products yet.{" "}
              <Link href="/admin/products/new" className="underline">
                Create one
              </Link>
            </li>
          ) : (
            recentProducts.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-zinc-500">{p.slug}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    p.status === "ACTIVE"
                      ? "bg-green-100 text-green-800"
                      : p.status === "DRAFT"
                        ? "bg-zinc-100 text-zinc-600"
                        : "bg-zinc-100 text-zinc-500"
                  }`}
                >
                  {p.status}
                </span>
              </li>
            ))
          )}
        </ul>
      </div>

      {hasOrders && recentOrders.length > 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="font-semibold text-zinc-900">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-medium text-[var(--pink-600)] hover:underline">
              View all
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100">
            {recentOrders.map((o) => (
              <li key={o.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {o.email}
                  </Link>
                  <p className="text-xs text-zinc-500">
                    {(o.totalCents / 100).toFixed(2)} {o.currency} · {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    o.status === "DELIVERED"
                      ? "bg-green-100 text-green-800"
                      : o.status === "CANCELLED"
                        ? "bg-zinc-100 text-zinc-500"
                        : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {o.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
