import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient | null {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) return null;

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export function getPrisma(): PrismaClient | null {
  if (process.env.NODE_ENV === "production") {
    return createPrismaClient();
  }

  const cached = global.__prisma;
  if (cached && typeof (cached as { adBanner?: unknown }).adBanner === "undefined") {
    global.__prisma = undefined;
  }

  if (!global.__prisma) {
    global.__prisma = createPrismaClient() ?? undefined;
  }

  return global.__prisma ?? null;
}

export function requirePrisma(): PrismaClient {
  const prisma = getPrisma();
  if (!prisma) {
    throw new Error(
      "DATABASE_URL is not set. Add it to your .env file before using Prisma."
    );
  }
  return prisma;
}

