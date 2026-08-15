"use server";

import { redirect } from "next/navigation";
import { setAdminCookie } from "@/lib/auth";

export async function loginAction(
  _prev: { error?: string } | null,
  formData: FormData
): Promise<{ error?: string }> {
  const password = formData.get("password") as string | null;
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return { error: "Admin login not configured (ADMIN_PASSWORD in .env)." };
  }
  if (!password || password !== expected) {
    return { error: "Invalid password." };
  }
  await setAdminCookie();
  redirect("/admin");
}
