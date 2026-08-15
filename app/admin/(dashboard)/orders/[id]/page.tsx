import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { OrderStatusForm } from "../OrderStatusForm";
import { OrderInternalNoteForm } from "../OrderInternalNoteForm";
import { OrderTrackingForm } from "../OrderTrackingForm";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-zinc-100 text-zinc-600",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = requirePrisma();
  if (typeof prisma.order === "undefined") notFound();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      shippingMethod: true,
    },
  });

  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-zinc-500 hover:text-zinc-700"
          >
            ← Orders
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Order {order.id.slice(-8)}
          </h1>
          <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
              STATUS_COLORS[order.status] ?? "bg-zinc-100 text-zinc-700"
            }`}
          >
            {order.status}
          </span>
        </div>
        <p className="text-sm text-zinc-500">
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Contact &amp; shipping
            </h2>
            <dl className="mt-3 space-y-1 text-sm">
              <div>
                <dt className="text-zinc-500">Email</dt>
                <dd className="font-medium text-zinc-900">{order.email}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Shipping</dt>
                <dd className="text-zinc-900">
                  {order.shippingName}<br />
                  {order.shippingLine1}
                  {order.shippingLine2 && <>, {order.shippingLine2}</>}<br />
                  {order.shippingCity}
                  {order.shippingState && `, ${order.shippingState}`}
                  {order.shippingPostalCode && ` ${order.shippingPostalCode}`}<br />
                  {order.shippingCountry}
                </dd>
              </div>
              {!order.billingSameAsShipping && order.billingName && (
                <div>
                  <dt className="text-zinc-500">Billing</dt>
                  <dd className="text-zinc-900">
                    {order.billingName}<br />
                    {order.billingLine1}
                    {order.billingLine2 && <>, {order.billingLine2}</>}<br />
                    {order.billingCity}
                    {order.billingState && `, ${order.billingState}`}
                    {order.billingPostalCode && ` ${order.billingPostalCode}`}<br />
                    {order.billingCountry}
                  </dd>
                </div>
              )}
              {order.shippingMethod && (
                <div>
                  <dt className="text-zinc-500">Shipping method</dt>
                  <dd className="text-zinc-900">{order.shippingMethod.name}</dd>
                </div>
              )}
              <div>
                <dt className="text-zinc-500">Payment</dt>
                <dd className="text-zinc-900">{order.paymentMethod.toUpperCase()}</dd>
              </div>
              {order.customerNote && (
                <div>
                  <dt className="text-zinc-500">Customer note</dt>
                  <dd className="text-zinc-900">{order.customerNote}</dd>
                </div>
              )}
            </dl>
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Internal note
            </h2>
            <OrderInternalNoteForm orderId={order.id} internalNote={order.internalNote} />
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Update status
            </h2>
            <OrderStatusForm orderId={order.id} currentStatus={order.status} />
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Tracking code
            </h2>
            <OrderTrackingForm orderId={order.id} trackingCode={order.trackingCode} />
          </section>

          <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Items
            </h2>
            <ul className="mt-3 divide-y divide-zinc-100">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between py-2 text-sm">
                  <span className="text-zinc-900">
                    {item.title} × {item.quantity}
                  </span>
                  <span className="font-medium text-zinc-900">
                    {(item.totalCents / 100).toFixed(2)} {order.currency}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t border-zinc-200 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>{(order.subtotalCents / 100).toFixed(2)} {order.currency}</span>
              </div>
              {order.shippingCents > 0 && (
                <div className="flex justify-between text-zinc-600">
                  <span>Shipping</span>
                  <span>{(order.shippingCents / 100).toFixed(2)} {order.currency}</span>
                </div>
              )}
              {order.taxCents > 0 && (
                <div className="flex justify-between text-zinc-600">
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
              <div className="flex justify-between font-semibold text-zinc-900">
                <span>Total</span>
                <span>{(order.totalCents / 100).toFixed(2)} {order.currency}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
