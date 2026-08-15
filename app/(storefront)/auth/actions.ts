"use server";

import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getCustomerSession } from "@/lib/customer-session";
import { hashPassword, verifyPassword } from "@/lib/customer-auth";
import { revalidatePath } from "next/cache";

export async function registerAction(formData: FormData): Promise<{ error?: string }> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.user === "undefined") {
    return { error: "Registration is not available." };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const name = (formData.get("name") as string)?.trim() || null;

  if (!email) return { error: "Email is required." };
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, passwordHash, name },
  });

  const session = await getCustomerSession();
  session.userId = user.id;
  await session.save();

  revalidatePath("/");
  revalidatePath("/account");
  redirect("/account");
}

export async function loginAction(formData: FormData): Promise<{ error?: string }> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.user === "undefined") {
    return { error: "Login is not available." };
  }

  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email) return { error: "Email is required." };
  if (!password) return { error: "Password is required." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { error: "Invalid email or password." };

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password." };

  const session = await getCustomerSession();
  session.userId = user.id;
  await session.save();

  const nextUrl = (formData.get("next") as string)?.trim();
  const safeNext = nextUrl && nextUrl.startsWith("/") && !nextUrl.startsWith("//") ? nextUrl : "/account";
  revalidatePath("/");
  revalidatePath("/account");
  redirect(safeNext);
}

export async function logoutAction() {
  const session = await getCustomerSession();
  session.destroy();
  revalidatePath("/");
  revalidatePath("/account");
  redirect("/");
}
