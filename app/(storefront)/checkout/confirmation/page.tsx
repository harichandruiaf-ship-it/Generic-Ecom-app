import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ orderId?: string }> };

export default async function CheckoutConfirmationPage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  if (!orderId) notFound();

  const prisma = getPrisma();
  if (!prisma || typeof prisma.order === "undefined") notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) notFound();

  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });
  const thankYouMessage = settings?.thankYouMessage ?? "Thank you for your order!";
  const currency = order.currency;

  const format = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 text-center">
        <h1 className="text-2xl font-bold text-[var(--pink-600)]">Order confirmed</h1>
        <p className="mt-4 text-[var(--foreground)]/80">{thankYouMessage}</p>
        <p className="mt-2 font-mono text-sm text-[var(--foreground)]/60">
          Order reference: {order.id.slice(-8).toUpperCase()}
        </p>
        <p className="mt-4 text-sm text-[var(--foreground)]/70">
          We&apos;ll contact you at <strong>{order.email}</strong> if we have any questions about your order.
        </p>

        <div className="mt-8 border-t border-[var(--pink-100)] pt-6 text-left">
          <h2 className="font-semibold text-[var(--pink-600)]">Order summary</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.title} × {item.quantity}</span>
                <span>{format(item.totalCents)}</span>
              </li>
            ))}
          </ul>
          {(order.discountCents ?? 0) > 0 && (
            <div className="mt-2 flex justify-between text-sm text-green-600">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>-{format(order.discountCents ?? 0)}</span>
            </div>
          )}
          <div className="mt-4 flex justify-between border-t border-[var(--pink-100)] pt-2 font-medium">
            <span>Total</span>
            <span>{format(order.totalCents)}</span>
          </div>
        </div>

        <p className="mt-6 text-sm text-[var(--foreground)]/70">
          <Link href="/order-lookup" className="text-[var(--pink-500)] hover:underline">
            Look up this order later
          </Link>
        </p>
        <Link
          href="/products"
          className="mt-4 inline-block rounded-lg bg-[var(--pink-500)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
