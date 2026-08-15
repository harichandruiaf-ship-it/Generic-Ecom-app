import { getPrisma } from "@/lib/prisma";
import type { BannerItem } from "@/lib/banner-utils";

export type { BannerItem } from "@/lib/banner-utils";
export { getBannerHref } from "@/lib/banner-utils";

export type BannerPlacement =
  | "HOME_HERO"
  | "HOME_PROMO_GRID"
  | "CATEGORY_TOP"
  | "CATEGORY_SIDEBAR"
  | "PRODUCT_PAGE"
  | "CART_PROMO"
  | "FOOTER_STRIP";

export async function getBannersByPlacement(placement: BannerPlacement): Promise<BannerItem[]> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.adBanner === "undefined") return [];

  const rows = await prisma.adBanner.findMany({
    where: { placement },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      image: true,
      linkType: true,
      linkSlug: true,
      layout: true,
      animation: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    image: r.image,
    linkType: r.linkType,
    linkSlug: r.linkSlug,
    layout: r.layout,
    animation: r.animation,
  }));
}
