import Link from "next/link";
import { getPrisma } from "@/lib/prisma";
import { OrderLookupForm } from "./OrderLookupForm";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ email?: string; ref?: string }>;
};

export default async function OrderLookupPage({ searchParams }: Props) {
  const prisma = getPrisma();
  const { email, ref } = await searchParams;

  const trimmedEmail = (email ?? "").trim();
  const trimmedRef = (ref ?? "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  let order: {
    id: string;
    status: string;
    email: string;
    totalCents: number;
    currency: string;
    createdAt: Date;
    items: { title: string; quantity: number; totalCents: number }[];
  } | null = null;
  let notFound = false;

  if (prisma && typeof prisma.order !== "undefined" && trimmedEmail && trimmedRef.length >= 6) {
    const orders = await prisma.order.findMany({
      where: {
        email: { equals: trimmedEmail, mode: "insensitive" },
        id: { endsWith: trimmedRef },
      },
      take: 1,
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    const found = orders[0];
    if (found) {
      order = {
        id: found.id,
        status: found.status,
        email: found.email,
        totalCents: found.totalCents,
        currency: found.currency,
        createdAt: found.createdAt,
        items: found.items.map((i) => ({ title: i.title, quantity: i.quantity, totalCents: i.totalCents })),
      };
    } else if (trimmedEmail && trimmedRef) {
      notFound = true;
    }
  }

  const formatCents = (cents: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition duration-200 hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">Order lookup</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">
        Look up your order
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        Enter the email you used and the order reference from your confirmation (e.g. the 8-character code).
      </p>

      <OrderLookupForm initialEmail={trimmedEmail} initialRef={ref ?? ""} />

      {notFound && (
        <div className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          No order found for this email and reference. Please check and try again.
        </div>
      )}

      {order && (
        <div className="mt-8 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--pink-600)]">Order status</h2>
          <p className="mt-2 text-sm text-[var(--foreground)]/70">
            <strong>Reference:</strong> {order.id.slice(-8).toUpperCase()}
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]/70">
            <strong>Status:</strong>{" "}
            <span className="inline-flex rounded-full bg-[var(--pink-100)] px-2.5 py-0.5 text-xs font-medium text-[var(--pink-700)]">
              {order.status}
            </span>
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]/70">
            <strong>Placed:</strong> {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <p className="mt-1 text-sm text-[var(--foreground)]/70">
            <strong>Total:</strong> {formatCents(order.totalCents, order.currency)}
          </p>
          <ul className="mt-4 list-inside list-disc text-sm text-[var(--foreground)]/80">
            {order.items.map((i, idx) => (
              <li key={idx}>
                {i.title} × {i.quantity} – {formatCents(i.totalCents, order.currency)}
              </li>
            ))}
          </ul>
          <Link
            href="/products"
            className="mt-6 inline-block text-sm font-medium text-[var(--pink-500)] hover:text-[var(--pink-600)]"
          >
            Continue shopping →
          </Link>
        </div>
      )}

      <Link href="/" className="mt-8 inline-block text-sm text-[var(--foreground)]/60 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
