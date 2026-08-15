import { Header } from "@/app/components/Header";
import { Footer } from "@/app/components/Footer";
import { FooterBannerStrip } from "@/app/components/FooterBannerStrip";
import { getCartFromCookie, getCartProductCount } from "@/lib/cart";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";
import { getSiteProfile } from "@/lib/site-profile";

export const dynamic = "force-dynamic";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cart = await getCartFromCookie();
  const cartCount = getCartProductCount(cart);
  const profile = await getSiteProfile();

  let cartEnabled = true;
  let themePalette = "pink";
  const prisma = getPrisma();
  if (prisma && typeof prisma.storeSettings !== "undefined") {
    const settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    cartEnabled = settings?.cartEnabled ?? true;
    const allowed = ["pink", "blue", "green", "slate", "coral", "violet"];
    if (settings?.themePalette && allowed.includes(settings.themePalette)) {
      themePalette = settings.themePalette;
    }
  }

  const user = await getCurrentUser();
  let wishlistCount = 0;
  if (user && prisma && typeof prisma.userWishlist !== "undefined") {
    wishlistCount = await prisma.userWishlist.count({ where: { userId: user.id } });
  }

  return (
    <div data-palette={themePalette} className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
      <Header
        profile={profile}
        cartCount={cartCount}
        cartEnabled={cartEnabled}
        user={user ? { email: user.email, name: user.name } : null}
        wishlistCount={wishlistCount}
      />
      <main className="flex-1 animate-fade-in">{children}</main>
      <FooterBannerStrip />
      <Footer profile={profile} />
    </div>
  );
}
