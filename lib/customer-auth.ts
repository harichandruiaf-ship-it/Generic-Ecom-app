import bcrypt from "bcryptjs";
import { getPrisma } from "@/lib/prisma";
import { getCustomerSession } from "./customer-session";

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  preferences: unknown;
} | null> {
  const session = await getCustomerSession();
  const userId = session.userId;
  if (!userId) return null;

  const prisma = getPrisma();
  if (!prisma || typeof prisma.user === "undefined") return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, phone: true, preferences: true },
  });
  return user;
}
