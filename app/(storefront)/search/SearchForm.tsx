"use client";

import { useRouter } from "next/navigation";

type Category = { id: string; name: string; slug: string };

export function SearchForm({
  initialQuery,
  initialCategory,
  initialMinPrice,
  initialMaxPrice,
  categories,
}: {
  initialQuery: string;
  initialCategory: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  categories: Category[];
}) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = (form.elements.namedItem("q") as HTMLInputElement)?.value?.trim() ?? "";
    const category = (form.elements.namedItem("category") as HTMLSelectElement)?.value ?? "";
    const minPrice = (form.elements.namedItem("minPrice") as HTMLInputElement)?.value?.trim() ?? "";
    const maxPrice = (form.elements.namedItem("maxPrice") as HTMLInputElement)?.value?.trim() ?? "";
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-4 flex flex-col gap-4 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-4 sm:flex-row sm:flex-wrap sm:items-end"
    >
      <label className="min-w-0 flex-1 sm:max-w-xs">
        <span className="sr-only">Search</span>
        <input
          type="search"
          name="q"
          defaultValue={initialQuery}
          placeholder="Product name..."
          className="w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-[var(--foreground)]"
          aria-label="Search products"
        />
      </label>
      <label className="sm:w-40">
        <span className="block text-xs font-medium text-[var(--foreground)]/70">Category</span>
        <select
          name="category"
          defaultValue={initialCategory}
          className="mt-0.5 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-sm text-[var(--foreground)]"
        >
          <option value="">All</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </label>
      <label className="w-28">
        <span className="block text-xs font-medium text-[var(--foreground)]/70">Min $</span>
        <input
          type="number"
          name="minPrice"
          min={0}
          step={1}
          defaultValue={initialMinPrice}
          placeholder="0"
          className="mt-0.5 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-sm"
        />
      </label>
      <label className="w-28">
        <span className="block text-xs font-medium text-[var(--foreground)]/70">Max $</span>
        <input
          type="number"
          name="maxPrice"
          min={0}
          step={1}
          defaultValue={initialMaxPrice}
          placeholder="Any"
          className="mt-0.5 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-sm"
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-[var(--pink-500)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
      >
        Search
      </button>
    </form>
  );
}
