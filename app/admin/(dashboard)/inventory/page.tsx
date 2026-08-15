import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { getLowStockThreshold } from "@/lib/inventory";
import { StockUpdateForm } from "./StockUpdateForm";

export const dynamic = "force-dynamic";

type Filter = "all" | "out" | "low" | "unlimited";

function StockBadge({
  stockQuantity,
  lowStockThreshold,
}: {
  stockQuantity: number | null;
  lowStockThreshold: number;
}) {
  if (stockQuantity === null)
    return (
      <span className="inline-flex rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
        Unlimited
      </span>
    );
  if (stockQuantity === 0)
    return (
      <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">
        Out of stock
      </span>
    );
  if (stockQuantity <= lowStockThreshold)
    return (
      <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
        Low ({stockQuantity})
      </span>
    );
  return (
    <span className="inline-flex rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
      {stockQuantity}
    </span>
  );
}

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const prisma = requirePrisma();
  const { filter: filterRaw } = await searchParams;
  const filter: Filter =
    filterRaw === "out" || filterRaw === "low" || filterRaw === "unlimited" ? filterRaw : "all";

  const lowStockThreshold = await getLowStockThreshold();

  const products = await prisma.product.findMany({
    orderBy: [{ stockQuantity: "asc" }, { title: "asc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      stockQuantity: true,
    },
  });

  const filtered =
    filter === "out"
      ? products.filter((p) => p.stockQuantity === 0)
      : filter === "low"
        ? products.filter(
            (p) => p.stockQuantity != null && p.stockQuantity > 0 && p.stockQuantity <= lowStockThreshold
          )
        : filter === "unlimited"
          ? products.filter((p) => p.stockQuantity === null)
          : products;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          View and update stock levels. Low stock uses the threshold from Store settings.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/inventory"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            filter === "all"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/inventory?filter=out"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            filter === "out"
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          Out of stock
        </Link>
        <Link
          href="/admin/inventory?filter=low"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            filter === "low"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          Low stock
        </Link>
        <Link
          href="/admin/inventory?filter=unlimited"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            filter === "unlimited"
              ? "bg-zinc-900 text-white"
              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          Unlimited
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Update stock
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-zinc-500">
                  {filter === "all" ? "No products." : `No products match "${filter}".`}
                  {filter !== "all" && (
                    <Link href="/admin/inventory" className="ml-1 underline">
                      Show all
                    </Link>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {p.title}
                    </Link>
                    <p className="text-xs text-zinc-500">{p.slug}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        p.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : p.status === "DRAFT"
                            ? "bg-zinc-100 text-zinc-600"
                            : "bg-zinc-100 text-zinc-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StockBadge stockQuantity={p.stockQuantity} lowStockThreshold={lowStockThreshold} />
                  </td>
                  <td className="px-6 py-4">
                    <StockUpdateForm productId={p.id} currentStock={p.stockQuantity} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
