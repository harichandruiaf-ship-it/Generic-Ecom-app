/**
 * Shared banner types and helpers with no Node/prisma dependency.
 * Safe to import from client components (BannerStrip, BannerSingle, BannerGrid, BannerCarousel).
 */

export type BannerItem = {
  id: string;
  image: string;
  linkType: string;
  linkSlug: string;
  layout: string | null;
  animation: string | null;
};

export function getBannerHref(linkType: string, linkSlug: string): string {
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
