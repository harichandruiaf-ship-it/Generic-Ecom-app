import { getBannersByPlacement } from "@/lib/banners";
import { BannerStrip } from "./BannerStrip";

export async function FooterBannerStrip() {
  const banners = await getBannersByPlacement("FOOTER_STRIP");
  if (banners.length === 0) return null;
  return <BannerStrip banners={banners} />;
}
