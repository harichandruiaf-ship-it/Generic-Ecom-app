import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { DeleteBannerButton } from "./DeleteBannerButton";
import type { BannerPlacement } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const PLACEMENT_LABELS: Record<BannerPlacement, string> = {
  HOME_HERO: "Home – Hero carousel",
  HOME_PROMO_GRID: "Home – Promo grid",
  CATEGORY_TOP: "Category/Shop – Top",
  CATEGORY_SIDEBAR: "Category/Shop – Sidebar",
  PRODUCT_PAGE: "Product page",
  CART_PROMO: "Cart – Promo strip",
  FOOTER_STRIP: "Footer strip",
};

const PLACEMENT_ORDER: BannerPlacement[] = [
  "HOME_HERO",
  "HOME_PROMO_GRID",
  "CATEGORY_TOP",
  "CATEGORY_SIDEBAR",
  "PRODUCT_PAGE",
  "CART_PROMO",
  "FOOTER_STRIP",
];

function getLinkHref(linkType: string, linkSlug: string): string {
  switch (linkType) {
    case "TAG":
      return `/tags/${linkSlug}`;
    case "CATEGORY":
      return `/categories/${linkSlug}`;
    case "PRODUCT":
      return `/products/${linkSlug}`;
    default:
      return "#";
  }
}

function getLinkLabel(linkType: string, linkSlug: string): string {
  return `${linkType}: ${linkSlug}`;
}

export default async function AdminBannersPage() {
  const prisma = requirePrisma();
  if (typeof prisma.adBanner === "undefined") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Ad Banners</h1>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-800">
          <p className="font-medium">Prisma client is out of date.</p>
          <p className="mt-2">
            Run <code className="rounded bg-amber-100 px-1.5 py-0.5">npx prisma generate</code> and restart the dev server.
          </p>
        </div>
      </div>
    );
  }

  const allBanners = await prisma.adBanner.findMany({
    orderBy: [{ placement: "asc" }, { sortOrder: "asc" }],
  });

  const byPlacement = new Map<BannerPlacement, typeof allBanners>();
  for (const p of PLACEMENT_ORDER) {
    byPlacement.set(p, allBanners.filter((b) => b.placement === p));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Ad Banners</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Manage banners by screen. Each banner is shown in one place in the store (Home hero, Category top, Cart, etc.). Create and edit from here.
          </p>
        </div>
        <Link
          href="/admin/banners/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Add banner
        </Link>
      </div>

      {PLACEMENT_ORDER.map((placement) => {
        const banners = byPlacement.get(placement) ?? [];
        return (
          <section key={placement} className="rounded-xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 bg-zinc-50/80 px-4 py-3 sm:px-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">
                {PLACEMENT_LABELS[placement]}
              </h2>
              <p className="mt-0.5 text-xs text-zinc-500">
                {banners.length} banner{banners.length !== 1 ? "s" : ""}
              </p>
            </div>
            {banners.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-zinc-500 sm:px-6">
                No banners.{" "}
                <Link href={`/admin/banners/new?placement=${placement}`} className="underline">
                  Add one for this screen
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-zinc-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:px-6">Image</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:px-6">Links to</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:px-6">Layout / Animation</th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 sm:px-6">Order</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 sm:px-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {banners.map((b) => (
                      <tr key={b.id} className="hover:bg-zinc-50">
                        <td className="px-4 py-3 sm:px-6">
                          <img
                            src={b.image}
                            alt=""
                            className="h-14 w-28 rounded border border-zinc-200 object-cover"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-700 sm:px-6">
                          <Link
                            href={getLinkHref(b.linkType, b.linkSlug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-900 underline hover:text-zinc-700"
                          >
                            {getLinkLabel(b.linkType, b.linkSlug)}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs text-zinc-500 sm:px-6">
                          {b.layout ?? "—"} / {b.animation ?? "NONE"}
                        </td>
                        <td className="px-4 py-3 text-sm text-zinc-500 sm:px-6">{b.sortOrder}</td>
                        <td className="px-4 py-3 text-right sm:px-6">
                          <Link
                            href={`/admin/banners/${b.id}/edit`}
                            className="mr-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                          >
                            Edit
                          </Link>
                          <DeleteBannerButton bannerId={b.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
