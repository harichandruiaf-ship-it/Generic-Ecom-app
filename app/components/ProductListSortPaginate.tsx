import Link from "next/link";

export const PAGE_SIZE = 12;

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "name_asc", label: "Name: A–Z" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];

function buildQueryString(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v != null && v !== "") search.set(k, v);
  }
  const s = search.toString();
  return s ? `?${s}` : "";
}

export function ProductListSortPaginate({
  basePath,
  params,
  totalCount,
  totalPages,
}: {
  basePath: string;
  params: { category?: string; tag?: string; sort?: string; page?: string };
  totalCount: number;
  totalPages: number;
}) {
  const { category, tag, sort = "newest", page = "1" } = params;
  const currentPage = Math.max(1, parseInt(page, 10) || 1);

  const base = { category, tag };
  const sortLinks = SORT_OPTIONS.map((opt) => ({
    ...opt,
    href: basePath + buildQueryString({ ...base, sort: opt.value, page: "1" }),
    active: (sort || "newest") === opt.value,
  }));

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;
  const prevHref = prevPage ? basePath + buildQueryString({ ...base, sort: sort || "newest", page: String(prevPage) }) : null;
  const nextHref = nextPage ? basePath + buildQueryString({ ...base, sort: sort || "newest", page: String(nextPage) }) : null;

  const start = totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const end = Math.min(currentPage * PAGE_SIZE, totalCount);

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--foreground)]/60">
        Showing {start}–{end} of {totalCount}
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--foreground)]/60">Sort</span>
        <div className="flex flex-wrap gap-2">
          {sortLinks.map(({ href, label, active }) => (
            <Link
              key={href}
              href={href}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${active ? "bg-[var(--pink-500)] text-white" : "bg-[var(--pink-100)] text-[var(--pink-600)] hover:bg-[var(--pink-200)]"}`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
      {totalPages > 1 && (
        <nav className="flex items-center gap-2" aria-label="Pagination">
          {prevHref ? (
            <Link href={prevHref} className="rounded-lg border-2 border-[var(--pink-200)] px-3 py-1.5 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]">
              Previous
            </Link>
          ) : (
            <span className="rounded-lg border-2 border-[var(--pink-100)] px-3 py-1.5 text-sm text-[var(--foreground)]/40 cursor-not-allowed">
              Previous
            </span>
          )}
          <span className="text-sm text-[var(--foreground)]/70">
            Page {currentPage} of {totalPages}
          </span>
          {nextHref ? (
            <Link href={nextHref} className="rounded-lg border-2 border-[var(--pink-200)] px-3 py-1.5 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]">
              Next
            </Link>
          ) : (
            <span className="rounded-lg border-2 border-[var(--pink-100)] px-3 py-1.5 text-sm text-[var(--foreground)]/40 cursor-not-allowed">
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}

export function getOrderBy(sort: string | undefined) {
  switch (sort) {
    case "price_asc":
      return { priceCents: "asc" as const };
    case "price_desc":
      return { priceCents: "desc" as const };
    case "name_asc":
      return { title: "asc" as const };
    default:
      return { updatedAt: "desc" as const };
  }
}
