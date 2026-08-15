import Link from "next/link";
import { requirePrisma } from "@/lib/prisma";
import { ProductForm } from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  const prisma = requirePrisma();
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900"
        >
          ← Products
        </Link>
      </div>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        New product
      </h1>
      <ProductForm categories={categories} tags={tags} />
    </div>
  );
}
