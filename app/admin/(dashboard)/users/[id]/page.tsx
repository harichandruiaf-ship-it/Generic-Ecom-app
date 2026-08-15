import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { ProductImage } from "@/app/components/ProductImage";
import { ReviewStatusForm } from "@/app/admin/(dashboard)/reviews/ReviewStatusForm";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = requirePrisma();
  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);
  if (typeof prisma.user === "undefined") notFound();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      orders: { orderBy: { createdAt: "desc" }, take: 20, include: { items: true } },
      wishlist: {
        include: {
          product: {
            select: {
              id: true,
              title: true,
              slug: true,
              priceCents: true,
              currency: true,
              images: true,
              status: true,
            },
          },
        },
      },
      ...(typeof prisma.productReview !== "undefined" && {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            product: { select: { id: true, title: true, slug: true } },
          },
        },
      }),
    },
  });

  if (!user) notFound();

  type ReviewRow = { id: string; product: { id: string; title: string; slug: string }; rating: number; comment: string | null; status: string };
  const reviews: ReviewRow[] = ((user as { reviews?: unknown }).reviews ?? []) as ReviewRow[];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/users" className="text-sm font-medium text-zinc-500 hover:text-zinc-700">
          ← Users
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Customer</h1>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Profile
        </h2>
        <dl className="mt-3 grid gap-2 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-zinc-500">Email</dt>
            <dd className="font-medium text-zinc-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Name</dt>
            <dd className="text-zinc-900">{user.name ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Phone</dt>
            <dd className="text-zinc-900">{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs text-zinc-500">Joined</dt>
            <dd className="text-zinc-900">{new Date(user.createdAt).toLocaleString()}</dd>
          </div>
        </dl>
        {user.preferences != null && (
          <div className="mt-4">
            <dt className="text-xs text-zinc-500">Preferences</dt>
            <pre className="mt-1 overflow-x-auto rounded bg-zinc-100 p-3 text-xs text-zinc-700">
              {JSON.stringify(user.preferences, null, 2)}
            </pre>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Addresses ({user.addresses.length})
        </h2>
        {user.addresses.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No saved addresses.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {user.addresses.map((addr) => (
              <li
                key={addr.id}
                className="rounded-lg border border-zinc-100 bg-zinc-50/50 p-3 text-sm"
              >
                <span className="font-medium text-zinc-900">{addr.label}</span>
                {addr.isDefault && (
                  <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-xs">Default</span>
                )}
                <p className="mt-1 text-zinc-600">
                  {addr.line1}
                  {addr.line2 && `, ${addr.line2}`}
                  <br />
                  {addr.city}
                  {addr.state && `, ${addr.state}`}
                  {addr.postalCode && ` ${addr.postalCode}`}
                  <br />
                  {addr.country}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Orders ({user.orders.length})
        </h2>
        {user.orders.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No orders.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {user.orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="flex justify-between rounded-lg border border-zinc-100 px-3 py-2 text-sm hover:bg-zinc-50"
                >
                  <span className="font-mono text-zinc-700">#{order.id.slice(-8)}</span>
                  <span className="text-zinc-600">
                    {(order.totalCents / 100).toFixed(2)} {order.currency}
                  </span>
                  <span className="text-zinc-500">{order.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">No reviews posted.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-zinc-500">
                  <th className="pb-2 pr-4 font-medium">Product</th>
                  <th className="pb-2 pr-4 font-medium">Rating</th>
                  <th className="pb-2 pr-4 font-medium">Comment</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/products/${r.product.id}/edit`}
                        className="font-medium text-zinc-900 hover:underline"
                      >
                        {r.product.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-amber-600" aria-hidden>{"★".repeat(r.rating)}</span>
                      <span className="sr-only">{r.rating} stars</span>
                    </td>
                    <td className="max-w-[200px] truncate py-3 pr-4 text-zinc-600">
                      {r.comment ?? "—"}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={
                          r.status === "APPROVED"
                            ? "text-green-600"
                            : r.status === "REJECTED"
                              ? "text-red-600"
                              : "text-amber-600"
                        }
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <ReviewStatusForm reviewId={r.id} currentStatus={r.status} revalidateUserId={id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Wishlist ({user.wishlist.length})
        </h2>
        {user.wishlist.length === 0 ? (
          <p className="mt-3 text-sm text-zinc-500">Wishlist is empty.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {user.wishlist.map((w) => {
              const p = w.product;
              const images = Array.isArray(p.images) ? (p.images as string[]) : [];
              return (
                <li key={w.productId}>
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="flex gap-3 rounded-lg border border-zinc-100 p-3 hover:bg-zinc-50"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded bg-zinc-100">
                      {images[0] ? (
                        <ProductImage
                          src={images[0]}
                          alt={p.title}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">
                          —
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-900">{p.title}</p>
                      <p className="text-xs text-zinc-500">
                        {new Intl.NumberFormat("en-US", { style: "currency", currency: storeCurrency }).format(convertPriceCents(p.priceCents, p.currency, storeCurrency, rates) / 100)} · {p.status}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}