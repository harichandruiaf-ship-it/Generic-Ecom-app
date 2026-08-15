"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import type { CouponType } from "@/generated/prisma/client";

export async function createCouponAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { error: "Code is required." };
  const type = (formData.get("type") as CouponType) || "FIXED";
  const valuePercent = type === "PERCENT" ? parseInt((formData.get("valuePercent") as string) ?? "0", 10) : null;
  const valueCents = type === "FIXED" ? parseInt((formData.get("valueCents") as string) ?? "0", 10) : null;
  const minOrderCents = parseInt((formData.get("minOrderCents") as string) ?? "0", 10) || 0;

  if (type === "PERCENT" && (valuePercent == null || valuePercent < 1 || valuePercent > 100))
    return { error: "Percent must be 1–100." };
  if (type === "FIXED" && (valueCents == null || valueCents < 0))
    return { error: "Fixed value must be 0 or more." };

  await prisma.coupon.create({
    data: {
      code,
      type,
      valuePercent: type === "PERCENT" ? valuePercent : null,
      valueCents: type === "FIXED" ? valueCents : null,
      minOrderCents,
    },
  });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function updateCouponAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const id = formData.get("id") as string;
  if (!id) redirect("/admin/coupons");
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { error: "Code is required." };
  const type = (formData.get("type") as CouponType) || "FIXED";
  const valuePercent = type === "PERCENT" ? parseInt((formData.get("valuePercent") as string) ?? "0", 10) : null;
  const valueCents = type === "FIXED" ? parseInt((formData.get("valueCents") as string) ?? "0", 10) : null;
  const minOrderCents = parseInt((formData.get("minOrderCents") as string) ?? "0", 10) || 0;

  if (type === "PERCENT" && (valuePercent == null || valuePercent < 1 || valuePercent > 100))
    return { error: "Percent must be 1–100." };
  if (type === "FIXED" && (valueCents == null || valueCents < 0))
    return { error: "Fixed value must be 0 or more." };

  await prisma.coupon.update({
    where: { id },
    data: {
      code,
      type,
      valuePercent: type === "PERCENT" ? valuePercent : null,
      valueCents: type === "FIXED" ? valueCents : null,
      minOrderCents,
    },
  });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function deleteCouponAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const id = formData.get("id") as string;
  if (!id) return;
  await prisma.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}
