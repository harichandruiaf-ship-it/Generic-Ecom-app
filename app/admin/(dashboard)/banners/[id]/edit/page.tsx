import { notFound, redirect } from "next/navigation";
import { requirePrisma } from "@/lib/prisma";
import { BannerForm } from "../../BannerForm";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prisma = requirePrisma();
  if (typeof prisma.adBanner === "undefined") redirect("/admin/banners");
  const banner = await prisma.adBanner.findUnique({ where: { id } });
  if (!banner) notFound();

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
        Edit ad banner
      </h1>
      <BannerForm
        banner={banner}
        categories={categories}
        tags={tags}
        products={products}
      />
    </div>
  );
}
