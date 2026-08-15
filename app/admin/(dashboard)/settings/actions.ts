"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import { isAllowedStoreCurrency } from "@/lib/currencies";
import { STORE_CURRENCY_CODES } from "@/lib/currencies";

export async function updateStoreSettingsAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.storeSettings === "undefined") redirect("/admin");

  const cartEnabled = formData.get("cartEnabled") === "on";
  const checkoutEnabled = formData.get("checkoutEnabled") === "on";
  const taxRatePercent = parseFloat((formData.get("taxRatePercent") as string) ?? "0") || 0;
  const currencyRaw = (formData.get("currency") as string)?.trim() || "USD";
  const currency = isAllowedStoreCurrency(currencyRaw) ? currencyRaw : "USD";
  const shippingEnabled = formData.get("shippingEnabled") === "on";
  const thankYouMessage = (formData.get("thankYouMessage") as string)?.trim() || null;
  const termsText = (formData.get("termsText") as string)?.trim() || null;
  const minimumOrderCents = parseInt((formData.get("minimumOrderCents") as string) ?? "0", 10) || 0;
  const lowStockThreshold = Math.max(0, parseInt((formData.get("lowStockThreshold") as string) ?? "5", 10) || 5);
  const themePaletteRaw = (formData.get("themePalette") as string)?.trim() || "pink";
  const allowedPalettes = ["pink", "blue", "green", "slate", "coral", "violet"];
  const themePalette = allowedPalettes.includes(themePaletteRaw) ? themePaletteRaw : "pink";

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      cartEnabled,
      checkoutEnabled,
      taxRatePercent,
      currency,
      shippingEnabled,
      thankYouMessage,
      termsText,
      minimumOrderCents,
      lowStockThreshold,
      themePalette,
    },
    create: {
      id: "default",
      cartEnabled,
      checkoutEnabled,
      taxRatePercent,
      currency,
      shippingEnabled,
      thankYouMessage,
      termsText,
      minimumOrderCents,
      lowStockThreshold,
      themePalette,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/cart", "layout");
  revalidatePath("/checkout", "layout");
  revalidatePath("/products", "layout");
  revalidatePath("/account", "layout");
  redirect("/admin/settings");
}

/** Fetch current exchange rates from the internet and save as custom override. */
export async function fetchAndSaveExchangeRatesAction() {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.storeSettings === "undefined") redirect("/admin");

  const res = await fetch("https://latest.currency-api.pages.dev/v1/currencies/usd.json", {
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error("Failed to fetch exchange rates");
  const data = (await res.json()) as { usd?: Record<string, number> };
  const usd = data.usd ?? {};
  const override: Record<string, number> = { USD: 1 };
  for (const code of STORE_CURRENCY_CODES) {
    if (code === "USD") continue;
    const v = usd[code.toLowerCase()];
    if (typeof v === "number" && Number.isFinite(v)) override[code] = v;
  }

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: { exchangeRatesOverride: override },
    create: { id: "default", exchangeRatesOverride: override },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}

/** Clear custom exchange rates so the store uses live rates from the internet again. */
export async function clearExchangeRatesOverrideAction() {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.storeSettings === "undefined") redirect("/admin");

  await prisma.storeSettings.update({
    where: { id: "default" },
    data: { exchangeRatesOverride: Prisma.JsonNull },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
}
