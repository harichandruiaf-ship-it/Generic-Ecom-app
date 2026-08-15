import { requirePrisma } from "@/lib/prisma";
import { CategoriesForm } from "./CategoriesForm";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const prisma = requirePrisma();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Categories
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage categories for products. Products can be in multiple categories.
        </p>
      </div>
      <CategoriesForm categories={categories} />
    </div>
  );
}
