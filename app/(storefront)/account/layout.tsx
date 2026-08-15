import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/customer-auth";
import { AccountLogoutButton } from "./AccountLogoutButton";

export const dynamic = "force-dynamic";

const nav = [
  { href: "/account", label: "Overview", icon: "◇" },
  { href: "/account/profile", label: "Profile & details", icon: "👤" },
  { href: "/account/addresses", label: "Addresses", icon: "📍" },
  { href: "/account/orders", label: "My orders", icon: "📦" },
  { href: "/account/wishlist", label: "Wishlist", icon: "♥" },
  { href: "/account/preferences", label: "Preferences", icon: "⚙" },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">Account</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="lg:w-56 shrink-0">
          <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-4 shadow-sm">
            <p className="truncate text-sm font-medium text-[var(--foreground)]/90">{user.email}</p>
            {user.name && (
              <p className="mt-0.5 truncate text-xs text-[var(--foreground)]/60">{user.name}</p>
            )}
            <ul className="mt-4 space-y-0.5">
              {nav.map(({ href, label, icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-[var(--foreground)]/80 transition hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
                  >
                    <span className="text-[var(--pink-500)]" aria-hidden>{icon}</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 border-t border-[var(--pink-100)] pt-4">
              <AccountLogoutButton />
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
