"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import type { BannerLinkType, BannerPlacement, BannerLayout, BannerAnimation } from "@/generated/prisma/client";

const PLACEMENTS: BannerPlacement[] = ["HOME_HERO", "HOME_PROMO_GRID", "CATEGORY_TOP", "CATEGORY_SIDEBAR", "PRODUCT_PAGE", "CART_PROMO", "FOOTER_STRIP"];
const LAYOUTS: BannerLayout[] = ["FULL_WIDTH", "CARD", "BOX"];
const ANIMATIONS: BannerAnimation[] = ["NONE", "FADE", "SLIDE", "ZOOM"];

function parsePlacement(v: unknown): BannerPlacement {
  return typeof v === "string" && PLACEMENTS.includes(v as BannerPlacement) ? (v as BannerPlacement) : "HOME_HERO";
}
function parseLayout(v: unknown): BannerLayout | null {
  return typeof v === "string" && v && LAYOUTS.includes(v as BannerLayout) ? (v as BannerLayout) : null;
}
function parseAnimation(v: unknown): BannerAnimation | null {
  return typeof v === "string" && ANIMATIONS.includes(v as BannerAnimation) ? (v as BannerAnimation) : null;
}

export async function createBannerAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const image = (formData.get("image") as string)?.trim();
  const linkType = formData.get("linkType") as BannerLinkType | null;
  const linkSlug = (formData.get("linkSlug") as string)?.trim();
  const sortOrder = formData.get("sortOrder");
  const placement = parsePlacement(formData.get("placement"));
  const layout = parseLayout(formData.get("layout"));
  const animation = parseAnimation(formData.get("animation"));

  if (!image || !linkType || !linkSlug) return { error: "Image, link type, and link target are required." };
  if (typeof prisma.adBanner === "undefined") redirect("/admin/banners");

  const order = sortOrder != null ? parseInt(String(sortOrder), 10) : 0;

  await prisma.adBanner.create({
    data: {
      image,
      linkType,
      linkSlug,
      sortOrder: Number.isNaN(order) ? 0 : order,
      placement,
      layout: layout ?? undefined,
      animation: animation ?? undefined,
    },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
  redirect("/admin/banners");
}

export async function updateBannerAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  const id = formData.get("bannerId") as string | null;
  if (!id) return { error: "Missing banner ID." };

  const image = (formData.get("image") as string)?.trim();
  const linkType = formData.get("linkType") as BannerLinkType | null;
  const linkSlug = (formData.get("linkSlug") as string)?.trim();
  const sortOrder = formData.get("sortOrder");
  const placement = parsePlacement(formData.get("placement"));
  const layout = parseLayout(formData.get("layout"));
  const animation = parseAnimation(formData.get("animation"));

  if (!image || !linkType || !linkSlug) return { error: "Image, link type, and link target are required." };
  if (typeof prisma.adBanner === "undefined") redirect("/admin/banners");

  const order = sortOrder != null ? parseInt(String(sortOrder), 10) : 0;

  await prisma.adBanner.update({
    where: { id },
    data: {
      image,
      linkType,
      linkSlug,
      sortOrder: Number.isNaN(order) ? 0 : order,
      placement,
      layout: layout ?? undefined,
      animation: animation ?? undefined,
    },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
  redirect("/admin/banners");
}

export async function deleteBannerAction(formData: FormData) {
  if (!(await isAdmin())) {
    redirect("/admin/login");
  }
  const prisma = requirePrisma();
  const id = formData.get("bannerId") as string | null;
  if (!id) return;
  if (typeof prisma.adBanner === "undefined") {
    redirect("/admin/banners");
  }

  await prisma.adBanner.delete({ where: { id } });
  revalidatePath("/admin/banners");
  revalidatePath("/", "layout");
}
