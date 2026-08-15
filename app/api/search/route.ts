import { NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";

const PRODUCT_LIMIT = 6;
const CATEGORY_LIMIT = 4;
const TAG_LIMIT = 4;

export async function GET(request: NextRequest) {
  const prisma = getPrisma();
  if (!prisma) {
    return Response.json({ products: [], categories: [], tags: [] });
  }

  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length === 0) {
    return Response.json({ products: [], categories: [], tags: [] });
  }

  const search = q.toLowerCase();
  const [products, categories, tags] = await Promise.all([
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        title: { contains: q, mode: "insensitive" },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        priceCents: true,
        currency: true,
        images: true,
      },
      take: PRODUCT_LIMIT,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.category.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      take: CATEGORY_LIMIT,
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      select: { id: true, name: true, slug: true },
      take: TAG_LIMIT,
      orderBy: { name: "asc" },
    }),
  ]);

  return Response.json({ products, categories, tags });
}
