"use server";

import { clearAdminCookie } from "@/lib/auth";

export async function logoutAction() {
  await clearAdminCookie();
}
