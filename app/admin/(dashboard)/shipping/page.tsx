import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { ShippingMethodForm } from "./ShippingMethodForm";
import { DeleteShippingButton } from "./DeleteShippingButton";

export const dynamic = "force-dynamic";

export default async function AdminShippingPage() {
  const prisma = requirePrisma();
  const storeCurrency = await getStoreCurrency();
  if (typeof prisma.shippingMethod === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Shipping methods</h1>
        <p className="mt-2 text-zinc-500">Run migrations to enable shipping.</p>
      </div>
    );
  }

  const methods = await prisma.shippingMethod.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Shipping methods
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Define shipping options shown at checkout. One can be set as default.
          </p>
        </div>
      </div>

      <ShippingMethodForm />

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Default</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {methods.map((m) => (
              <tr key={m.id}>
                <td className="px-6 py-4">
                  <span className="font-medium text-zinc-900">{m.name}</span>
                  {m.description && <p className="text-xs text-zinc-500">{m.description}</p>}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-700">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: storeCurrency }).format(m.priceCents / 100)}
                </td>
                <td className="px-6 py-4 text-sm">{m.isDefault ? "Yes" : "—"}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <ShippingMethodForm method={m} />
                    <DeleteShippingButton id={m.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {methods.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-zinc-500">No shipping methods yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
