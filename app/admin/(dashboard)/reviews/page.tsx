import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { ReviewStatusForm } from "./ReviewStatusForm";

export const dynamic = "force-dynamic";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex text-amber-500" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < value ? "" : "text-zinc-300"}`}
          aria-hidden
        >
          ★
        </span>
      ))}
    </span>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const prisma = requirePrisma();
  if (typeof prisma.productReview === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Reviews</h1>
        <p className="mt-2 text-zinc-500">Reviews are not available.</p>
      </div>
    );
  }

  const { status: filter } = await searchParams;
  const statusFilter =
    filter === "PENDING" || filter === "APPROVED" || filter === "REJECTED" ? filter : undefined;

  const reviews = await prisma.productReview.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, title: true, slug: true } },
    },
  });

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    prisma.productReview.count({ where: { status: "PENDING" } }),
    prisma.productReview.count({ where: { status: "APPROVED" } }),
    prisma.productReview.count({ where: { status: "REJECTED" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Reviews
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Approve or reject product reviews. Only approved reviews appear on the storefront.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/reviews"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            !statusFilter ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
          }`}
        >
          All
        </Link>
        <Link
          href="/admin/reviews?status=PENDING"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            statusFilter === "PENDING"
              ? "bg-amber-600 text-white"
              : "bg-amber-50 text-amber-700 hover:bg-amber-100"
          }`}
        >
          Pending ({pendingCount})
        </Link>
        <Link
          href="/admin/reviews?status=APPROVED"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            statusFilter === "APPROVED"
              ? "bg-green-600 text-white"
              : "bg-green-50 text-green-700 hover:bg-green-100"
          }`}
        >
          Approved ({approvedCount})
        </Link>
        <Link
          href="/admin/reviews?status=REJECTED"
          className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
            statusFilter === "REJECTED"
              ? "bg-red-600 text-white"
              : "bg-red-50 text-red-700 hover:bg-red-100"
          }`}
        >
          Rejected ({rejectedCount})
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Product / Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Rating
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Comment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-zinc-500">
                  No reviews {statusFilter ? `with status ${statusFilter}` : ""}.
                </td>
              </tr>
            ) : (
              reviews.map((r) => (
                <tr key={r.id} className="hover:bg-zinc-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/products/${r.product.id}/edit`}
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      {r.product.title}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {r.authorName}
                      {r.authorEmail ? ` · ${r.authorEmail}` : ""}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {new Date(r.createdAt).toLocaleString()}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Stars value={r.rating} />
                  </td>
                  <td className="max-w-xs px-6 py-4 text-sm text-zinc-700">
                    {r.comment ? (
                      <span className="line-clamp-3">{r.comment}</span>
                    ) : (
                      <span className="text-zinc-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        STATUS_COLORS[r.status] ?? "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <ReviewStatusForm reviewId={r.id} currentStatus={r.status} />
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
