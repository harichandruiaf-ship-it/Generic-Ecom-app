"use server";

import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

export async function submitReviewAction(formData: FormData): Promise<{ error?: string }> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.productReview === "undefined") return { error: "Reviews are not available." };

  const user = await getCurrentUser();
  if (!user) return { error: "You must be signed in to submit a review." };

  const productId = formData.get("productId") as string;
  const ratingRaw = formData.get("rating");
  const rating = ratingRaw ? Math.min(5, Math.max(0, parseInt(String(ratingRaw), 10) || 0)) : 0;
  const comment = (formData.get("comment") as string)?.trim() || null;

  if (!productId) return { error: "Product is required." };
  if (rating < 1) return { error: "Please select a rating." };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, status: true },
  });
  if (!product || product.status !== "ACTIVE") return { error: "Product not found." };

  const authorName = user.name?.trim() || user.email || "Customer";
  const authorEmail = user.email ?? null;

  await prisma.productReview.create({
    data: {
      productId,
      userId: user.id,
      authorName,
      authorEmail,
      rating,
      comment,
      status: "PENDING",
    },
  });

  return {};
}
