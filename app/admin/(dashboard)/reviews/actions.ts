"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import type { ReviewStatus } from "@/generated/prisma/client";

export async function updateReviewStatusAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.productReview === "undefined") redirect("/admin");

  const reviewId = formData.get("reviewId") as string;
  const status = formData.get("status") as ReviewStatus;
  if (!reviewId || !status) return;
  const valid: ReviewStatus[] = ["PENDING", "APPROVED", "REJECTED"];
  if (!valid.includes(status)) return;

  await prisma.productReview.update({
    where: { id: reviewId },
    data: { status },
  });

  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
  const revalidateUserId = formData.get("revalidateUserId");
  if (typeof revalidateUserId === "string" && revalidateUserId) {
    revalidatePath(`/admin/users/${revalidateUserId}`);
  }
}
