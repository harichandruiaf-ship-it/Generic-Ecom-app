import { requirePrisma } from "@/lib/prisma";
import { BannerForm } from "../BannerForm";

export const dynamic = "force-dynamic";

export default async function NewBannerPage({
  searchParams,
}: {
  searchParams: Promise<{ placement?: string }>;
}) {
  const { placement } = await searchParams;
  const prisma = requirePrisma();
  const [categories, tags, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      orderBy: { title: "asc" },
      select: { id: true, title: true, slug: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        New ad banner
      </h1>
      <BannerForm
        banner={null}
        defaultPlacement={placement}
        categories={categories}
        tags={tags}
        products={products}
      />
    </div>
  );
}
