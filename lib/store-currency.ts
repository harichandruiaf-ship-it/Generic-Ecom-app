import { getPrisma } from "@/lib/prisma";

/**
 * Returns the store's display currency from Admin → Store settings.
 * Use this for all storefront price display so it matches the selected currency (e.g. INR).
 */
export async function getStoreCurrency(): Promise<string> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.storeSettings === "undefined") return "USD";
  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
    select: { currency: true },
  });
  return settings?.currency ?? "USD";
}
