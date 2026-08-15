import { getPrisma } from "@/lib/prisma";

/** Returns the low-stock threshold from Store settings (products with stock ≤ this are "low stock"). */
export async function getLowStockThreshold(): Promise<number> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.storeSettings === "undefined") return 5;
  const s = await prisma.storeSettings.findUnique({
    where: { id: "default" },
    select: { lowStockThreshold: true },
  });
  return s?.lowStockThreshold ?? 5;
}
