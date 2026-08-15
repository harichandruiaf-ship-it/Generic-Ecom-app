import { requirePrisma } from "@/lib/prisma";
import { TagsForm } from "./TagsForm";

export const dynamic = "force-dynamic";

export default async function AdminTagsPage() {
  const prisma = requirePrisma();
  const tags = await prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Tags
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage tags for products. Products can have multiple tags.
        </p>
      </div>
      <TagsForm tags={tags} />
    </div>
  );
}
