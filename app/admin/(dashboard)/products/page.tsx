import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { getLowStockThreshold } from "@/lib/inventory";
import { ProductStatusBadge } from "./ProductStatusBadge";
import { DeleteProductButton } from "./DeleteProductButton";

export const dynamic = "force-dynamic";

function StockBadge({
  stockQuantity,
  lowStockThreshold,
}: {
  stockQuantity: number | null;
  lowStockThreshold: number;
}) {
  if (stockQuantity === null) return <span className="text-zinc-500">—</span>;
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
  return <span className="text-zinc-700">{stockQuantity}</span>;
}

export default async function AdminProductsPage() {
  const prisma = requirePrisma();
  const [storeCurrency, rates, lowStockThreshold] = await Promise.all([
    getStoreCurrency(),
    getExchangeRates(),
    getLowStockThreshold(),
  ]);
  let products: Awaited<ReturnType<typeof prisma.product.findMany>>;
  try {
    products = await prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Database error";
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Products
        </h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-800">
          <p className="font-medium">Cannot reach the database.</p>
          <p className="mt-2 text-sm">{message}</p>
          <p className="mt-2 text-sm">
            If using Supabase: open your project dashboard and resume the project if it is paused.
            Otherwise check <code className="rounded bg-amber-100 px-1">.env</code> and your network.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage products visible on the storefront.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Add product
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
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Categories / Tags
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-zinc-500">
                  No products.{" "}
                  <Link href="/admin/products/new" className="underline">
                    Create one
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((p) => (
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
                  <td className="px-6 py-4 text-sm text-zinc-700">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: storeCurrency,
                    }).format(convertPriceCents(p.priceCents, p.currency, storeCurrency, rates) / 100)}
                  </td>
                  <td className="px-6 py-4">
                    <StockBadge stockQuantity={p.stockQuantity} lowStockThreshold={lowStockThreshold} />
                  </td>
                  <td className="px-6 py-4">
                    <ProductStatusBadge status={p.status} />
                  </td>
                  <td className="px-6 py-4 text-xs text-zinc-600">
                    {(p as unknown as { categories?: { category: { name: string } }[] }).categories?.map((c) => c.category.name).join(", ") || "—"}
                    {((p as unknown as { tags?: { tag: { name: string } }[] }).tags?.length ?? 0) > 0 && (
                      <span className="mt-1 block">
                        Tags: {(p as unknown as { tags: { tag: { name: string } }[] }).tags?.map((t) => t.tag.name).join(", ")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
                    >
                      Edit
                    </Link>
                    <span className="mx-2 text-zinc-300">|</span>
                    <DeleteProductButton productId={p.id} productTitle={p.title} />
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
