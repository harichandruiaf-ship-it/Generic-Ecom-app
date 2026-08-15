"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

function get(formData: FormData, key: string): string {
  return (formData.get(key) as string) ?? "";
}

export async function updatePreferencesAction(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prisma = getPrisma();
  if (!prisma || typeof prisma.user === "undefined") return { error: "Not available." };

  const timezone = get(formData, "timezone").trim();
  const locale = get(formData, "locale").trim();
  const theme = get(formData, "theme").trim();
  const notifications = formData.get("notifications") === "on";

  const existing = (user.preferences as Record<string, unknown>) ?? {};
  const preferences = {
    ...existing,
    timezone: timezone || undefined,
    locale: locale || undefined,
    theme: theme || "system",
    notifications,
  };

  await prisma.user.update({
    where: { id: user.id },
    data: { preferences },
  });

  revalidatePath("/account/preferences");
  revalidatePath("/account");
  return {};
}
