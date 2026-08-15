import Link from "next/link";
import { getCurrentUser } from "@/lib/customer-auth";
import { getPrisma } from "@/lib/prisma";
import { AccountLogoutButton } from "./AccountLogoutButton";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const prisma = getPrisma();
  const wishlistCount =
    prisma && typeof prisma.userWishlist !== "undefined"
      ? await prisma.userWishlist.count({ where: { userId: user.id } })
      : 0;
  const orderCount =
    prisma && typeof prisma.order !== "undefined"
      ? await prisma.order.count({ where: { userId: user.id } })
      : 0;
  const addressCount =
    prisma && typeof prisma.userAddress !== "undefined"
      ? await prisma.userAddress.count({ where: { userId: user.id } })
      : 0;

  const cards = [
    {
      href: "/account/profile",
      label: "Profile",
      title: "Profile & details",
      desc: "Name, phone, and basic info.",
      icon: "👤",
    },
    {
      href: "/account/addresses",
      label: "Addresses",
      title: `Addresses (${addressCount})`,
      desc: "Manage saved shipping addresses.",
      icon: "📍",
    },
    {
      href: "/account/orders",
      label: "Orders",
      title: `My orders (${orderCount})`,
      desc: "View and track your orders.",
      icon: "📦",
    },
    {
      href: "/account/wishlist",
      label: "Wishlist",
      title: `Wishlist (${wishlistCount})`,
      desc: "Products you saved for later.",
      icon: "♥",
    },
    {
      href: "/account/preferences",
      label: "Preferences",
      title: "Preferences",
      desc: "Timezone, locale, notifications.",
      icon: "⚙",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">Your account</h1>
      <p className="mt-2 text-[var(--foreground)]/70">
        Welcome back{user.name ? `, ${user.name}` : ""}.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="flex flex-col rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6 transition hover:border-[var(--pink-300)] hover:shadow-md"
          >
            <span className="text-2xl" aria-hidden>{c.icon}</span>
            <span className="mt-2 text-sm font-medium text-[var(--pink-500)]">{c.label}</span>
            <span className="mt-1 font-semibold text-[var(--foreground)]">{c.title}</span>
            <span className="mt-1 text-sm text-[var(--foreground)]/60">{c.desc}</span>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <AccountLogoutButton />
      </div>
    </div>
  );
}
