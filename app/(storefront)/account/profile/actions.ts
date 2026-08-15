"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

export async function updateProfileAction(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prisma = getPrisma();
  if (!prisma || typeof prisma.user === "undefined") return { error: "Not available." };

  const name = (formData.get("name") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;
  const preferencesRaw = (formData.get("preferences") as string)?.trim();
  let preferences: Prisma.InputJsonValue | null = null;
  if (preferencesRaw) {
    try {
      preferences = JSON.parse(preferencesRaw) as Prisma.InputJsonValue;
    } catch {
      return { error: "Invalid preferences JSON." };
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      phone,
      preferences: preferences === null ? Prisma.JsonNull : preferences,
    },
  });

  revalidatePath("/account");
  revalidatePath("/account/profile");
  return {};
}
