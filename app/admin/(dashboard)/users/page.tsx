import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const prisma = requirePrisma();
  if (typeof prisma.user === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Users</h1>
        <p className="mt-2 text-zinc-600">Users are not available.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { orders: true, wishlist: true, addresses: true },
      },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Customers</h1>
      <p className="text-sm text-zinc-600">
        Store customer accounts. Click a user to view profile, addresses, orders, and wishlist.
      </p>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-zinc-200">
          <thead className="bg-zinc-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Orders
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Wishlist
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="transition hover:bg-zinc-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/users/${user.id}`}
                    className="font-medium text-[var(--pink-600)] hover:underline"
                  >
                    {user.email}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-900">{user.name ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{user._count.orders}</td>
                <td className="px-4 py-3 text-sm text-zinc-600">{user._count.wishlist}</td>
                <td className="px-4 py-3 text-sm text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
