import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminLogoutButton } from "../AdminLogoutButton";

const SIDEBAR_LINKS: { href: string; label: string }[] = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/tags", label: "Tags" },
  { href: "/admin/banners", label: "Ad Banners" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/company", label: "Company profile" },
  { href: "/admin/settings", label: "Store settings" },
  { href: "/admin/shipping", label: "Shipping" },
  { href: "/admin/coupons", label: "Coupons" },
];

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 w-56 border-r border-[var(--pink-200)] bg-white shadow-sm">
        <div className="flex h-14 items-center border-b border-[var(--pink-100)] px-4">
          <Link
            href="/admin"
            className="font-semibold uppercase tracking-wide text-[var(--pink-600)]"
          >
            Admin
          </Link>
        </div>
        <nav className="flex flex-col gap-0.5 p-3">
          {SIDEBAR_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--foreground)]/80 transition hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
            >
              {label}
            </Link>
          ))}
          <div className="mt-4 border-t border-[var(--pink-100)] pt-3">
            <Link
              href="/"
              target="_blank"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--pink-500)] transition hover:bg-[var(--pink-50)]"
            >
              View site →
            </Link>
            <AdminLogoutButton />
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col pl-56">
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--pink-200)] bg-white px-6 shadow-sm">
          <span className="text-sm font-medium text-[var(--foreground)]/60">
            Ecom Store · Admin
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="text-sm font-medium text-[var(--pink-500)] hover:text-[var(--pink-600)]"
            >
              Home
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
