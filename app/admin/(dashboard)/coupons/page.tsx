import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { CouponForm } from "./CouponForm";
import { DeleteCouponButton } from "./DeleteCouponButton";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const prisma = requirePrisma();
  const storeCurrency = await getStoreCurrency();
  if (typeof prisma.coupon === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Coupons</h1>
        <p className="mt-2 text-zinc-500">Run migrations to enable coupons.</p>
      </div>
    );
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { code: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Coupons
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Discount codes for checkout. Customers enter the code at checkout.
          </p>
        </div>
        <CouponForm />
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">Min order</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {coupons.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 font-mono font-medium text-zinc-900">{c.code}</td>
                <td className="px-6 py-4 text-sm text-zinc-700">{c.type}</td>
                <td className="px-6 py-4 text-sm text-zinc-700">
                  {c.type === "PERCENT" ? `${c.valuePercent}% off` : `${new Intl.NumberFormat("en-US", { style: "currency", currency: storeCurrency }).format((c.valueCents ?? 0) / 100)} off`}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-700">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: storeCurrency }).format(c.minOrderCents / 100)}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <CouponForm coupon={c} />
                    <DeleteCouponButton id={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && (
          <p className="px-6 py-8 text-center text-sm text-zinc-500">No coupons yet. Add one above.</p>
        )}
      </div>
    </div>
  );
}
