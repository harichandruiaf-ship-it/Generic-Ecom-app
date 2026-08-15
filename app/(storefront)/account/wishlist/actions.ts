"use server";

import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

export async function addToWishlistAction(productId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please log in to save products." };

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userWishlist === "undefined") return { error: "Not available." };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") return { error: "Product not found." };

  await prisma.userWishlist.upsert({
    where: {
      userId_productId: { userId: user.id, productId },
    },
    create: { userId: user.id, productId },
    update: {},
  });

  revalidatePath("/account/wishlist");
  revalidatePath("/account");
  revalidatePath("/products/[slug]", "page");
  return {};
}

export async function removeFromWishlistAction(productId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not logged in." };

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userWishlist === "undefined") return {};

  await prisma.userWishlist.deleteMany({
    where: { userId: user.id, productId },
  });

  revalidatePath("/account/wishlist");
  revalidatePath("/account");
  revalidatePath("/products/[slug]", "page");
  return {};
}
