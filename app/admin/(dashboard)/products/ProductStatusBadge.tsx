import type { ProductStatus } from "@/generated/prisma/client";

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const styles: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    DRAFT: "bg-amber-100 text-amber-800",
    ARCHIVED: "bg-zinc-100 text-zinc-600",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status] ?? "bg-zinc-100 text-zinc-600"}`}
    >
      {status}
    </span>
  );
}
