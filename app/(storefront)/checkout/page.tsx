import Link from "next/link";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getCartFromCookie } from "@/lib/cart";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { getCurrentUser } from "@/lib/customer-auth";
import { CheckoutForm } from "./CheckoutForm";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const cart = await getCartFromCookie();
  const prisma = getPrisma();

  if (cart.items.length === 0) {
    redirect("/cart");
  }

  const user = await getCurrentUser();
  type AddressOption = {
    id: string;
    label: string;
    line1: string;
    line2: string | null;
    city: string;
    state: string | null;
    postalCode: string | null;
    country: string;
    isDefault: boolean;
  };
  let savedAddresses: AddressOption[] = [];
  let defaultAddress: AddressOption | null = null;
  if (user && prisma && typeof prisma.userAddress !== "undefined") {
    const addresses = await prisma.userAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    });
    savedAddresses = addresses.map((a) => ({
      id: a.id,
      label: a.label,
      line1: a.line1,
      line2: a.line2,
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country,
      isDefault: a.isDefault,
    }));
    defaultAddress = savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0] ?? null;
  }

  let settings = null;
  let shippingMethods: { id: string; name: string; description: string | null; priceCents: number; isDefault: boolean }[] = [];
  if (prisma && typeof prisma.storeSettings !== "undefined") {
    settings = await prisma.storeSettings.findUnique({
      where: { id: "default" },
    });
    if (!settings?.checkoutEnabled) redirect("/cart");
    if (typeof prisma.shippingMethod !== "undefined" && settings.shippingEnabled) {
      shippingMethods = await prisma.shippingMethod.findMany({
        orderBy: { sortOrder: "asc" },
        select: { id: true, name: true, description: true, priceCents: true, isDefault: true },
      });
    }
  } else {
    redirect("/cart");
  }

  const [storeCurrency, rates] = await Promise.all([getStoreCurrency(), getExchangeRates()]);
  const subtotalCents = cart.items.reduce((s, i) => {
    const itemCents = convertPriceCents(i.priceCents, i.currency ?? "USD", storeCurrency, rates);
    return s + itemCents * i.quantity;
  }, 0);
  const currency = storeCurrency;
  const cartForDisplay = {
    ...cart,
    items: cart.items.map((i) => ({
      ...i,
      priceCents: convertPriceCents(i.priceCents, i.currency ?? "USD", storeCurrency, rates),
    })),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition duration-200 hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/cart" className="transition duration-200 hover:text-[var(--pink-500)]">Cart</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">Checkout</span>
      </nav>

      <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
        Checkout
      </h1>

      <CheckoutForm
        cart={cartForDisplay}
        subtotalCents={subtotalCents}
        currency={currency}
        settings={settings}
        shippingMethods={shippingMethods}
        termsText={settings?.termsText ?? undefined}
        defaultEmail={user?.email}
        defaultShippingName={user?.name ?? undefined}
        defaultAddress={defaultAddress}
        savedAddresses={savedAddresses}
      />
    </div>
  );
}
