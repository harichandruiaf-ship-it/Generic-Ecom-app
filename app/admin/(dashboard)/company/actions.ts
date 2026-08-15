"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";
import type { NavItem, SocialLinks } from "@/lib/site-profile";

function parseNavFromForm(formData: FormData): NavItem[] {
  const items: NavItem[] = [];
  let i = 0;
  while (true) {
    const label = (formData.get(`navLabel_${i}`) as string)?.trim();
    const href = (formData.get(`navHref_${i}`) as string)?.trim();
    if (!label && !href) break;
    if (label && href) items.push({ label, href });
    i++;
  }
  return items.length > 0 ? items : [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/categories" },
    { label: "Tags", href: "/tags" },
    { label: "All Products", href: "/products" },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
  ];
}

function parseSocialFromForm(formData: FormData): SocialLinks {
  const links: SocialLinks = {};
  const keys = ["facebook", "twitter", "instagram", "linkedin", "youtube"] as const;
  for (const k of keys) {
    const v = (formData.get(`social_${k}`) as string)?.trim();
    if (v) links[k] = v;
  }
  return links;
}

export async function updateCompanyProfileAction(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin/login");
  const prisma = requirePrisma();
  if (typeof prisma.storeSettings === "undefined") redirect("/admin");

  const siteName = (formData.get("siteName") as string)?.trim() || null;
  const logoUrl = (formData.get("logoUrl") as string)?.trim() || null;
  const contactEmail = (formData.get("contactEmail") as string)?.trim() || null;
  const contactPhone = (formData.get("contactPhone") as string)?.trim() || null;
  const showTopBar = formData.get("showTopBar") === "on";
  const headerNavItems = parseNavFromForm(formData);
  const socialLinks = parseSocialFromForm(formData);
  const aboutUsContent = (formData.get("aboutUsContent") as string)?.trim() || null;
  const contactPageContent = (formData.get("contactPageContent") as string)?.trim() || null;
  const footerTagline = (formData.get("footerTagline") as string)?.trim() || null;
  const footerCopyright = (formData.get("footerCopyright") as string)?.trim() || null;

  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {
      siteName: siteName ?? undefined,
      logoUrl: logoUrl ?? undefined,
      contactEmail: contactEmail ?? undefined,
      contactPhone: contactPhone ?? undefined,
      showTopBar,
      headerNavItems,
      socialLinks,
      aboutUsContent: aboutUsContent ?? undefined,
      contactPageContent: contactPageContent ?? undefined,
      footerTagline: footerTagline ?? undefined,
      footerCopyright: footerCopyright ?? undefined,
    },
    create: {
      id: "default",
      siteName: siteName ?? undefined,
      logoUrl: logoUrl ?? undefined,
      contactEmail: contactEmail ?? undefined,
      contactPhone: contactPhone ?? undefined,
      showTopBar,
      headerNavItems,
      socialLinks,
      aboutUsContent: aboutUsContent ?? undefined,
      contactPageContent: contactPageContent ?? undefined,
      footerTagline: footerTagline ?? undefined,
      footerCopyright: footerCopyright ?? undefined,
    },
  });

  revalidatePath("/admin/company");
  revalidatePath("/", "layout");
  revalidatePath("/about", "layout");
  revalidatePath("/contact", "layout");
  redirect("/admin/company");
}
