"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductImage } from "./ProductImage";

type ProductHit = {
  id: string;
  title: string;
  slug: string;
  priceCents: number;
  currency: string;
  images: unknown;
};

type CategoryHit = { id: string; name: string; slug: string };
type TagHit = { id: string; name: string; slug: string };

type SearchResult = {
  products: ProductHit[];
  categories: CategoryHit[];
  tags: TagHit[];
};

const DEBOUNCE_MS = 280;

export function HeaderSearchBar() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResult(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResult(null);
      setOpen(false);
      return;
    }
    setOpen(true);
    debounceRef.current = setTimeout(() => fetchSearch(query), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchSearch]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const hasResults =
    result &&
    (result.products.length > 0 || result.categories.length > 0 || result.tags.length > 0);
  const showDropdown = open && query.trim().length > 0;

  const formatPrice = (cents: number, currency: string) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

  return (
    <div ref={containerRef} className="relative flex-1 max-w-xl min-w-0">
      <div className="relative rounded-full bg-white shadow-md ring-1 ring-[var(--pink-200)]/50 focus-within:ring-2 focus-within:ring-[var(--pink-400)] focus-within:shadow-lg transition-shadow">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--pink-400)]" aria-hidden>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Search products, categories, tags…"
          aria-label="Search"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          className="w-full rounded-full bg-transparent py-2.5 pl-11 pr-10 text-sm text-[var(--foreground)] placeholder:text-[var(--foreground)]/50 focus:outline-none"
        />
        {loading ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--pink-400)]">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </span>
        ) : null}
      </div>

      {showDropdown && (
        <div
          className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-[var(--pink-200)] bg-white shadow-xl"
          role="listbox"
        >
          {loading && !result ? (
            <div className="p-6 text-center text-sm text-[var(--foreground)]/60">Searching…</div>
          ) : result && !hasResults ? (
            <div className="p-6 text-center text-sm text-[var(--foreground)]/60">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : result ? (
            <div className="p-3">
              {result.categories.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--pink-500)]">
                    Categories
                  </p>
                  <ul className="space-y-0.5">
                    {result.categories.map((c) => (
                      <li key={c.id}>
                        <Link
                          href={`/categories/${c.slug}`}
                          className="block rounded-lg px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
                          onClick={() => setOpen(false)}
                        >
                          {c.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.tags.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--pink-500)]">
                    Tags
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {result.tags.map((t) => (
                      <li key={t.id}>
                        <Link
                          href={`/tags/${t.slug}`}
                          className="inline-block rounded-full bg-[var(--pink-100)] px-3 py-1 text-xs font-medium text-[var(--pink-600)] hover:bg-[var(--pink-200)]"
                          onClick={() => setOpen(false)}
                        >
                          {t.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.products.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 px-2 text-xs font-semibold uppercase tracking-wider text-[var(--pink-500)]">
                    Products
                  </p>
                  <ul className="space-y-1">
                    {result.products.map((p) => {
                      const images = Array.isArray(p.images) ? (p.images as string[]) : [];
                      const first = images[0] ?? null;
                      return (
                        <li key={p.id}>
                          <Link
                            href={`/products/${p.slug}`}
                            className="flex items-center gap-3 rounded-lg p-2 text-left transition hover:bg-[var(--pink-50)]"
                            onClick={() => setOpen(false)}
                          >
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[var(--pink-50)]">
                              {first ? (
                                <ProductImage
                                  src={first}
                                  alt={p.title}
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--pink-400)]">
                                  —
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-[var(--foreground)]">{p.title}</p>
                              <p className="text-xs font-semibold text-[var(--pink-500)]">
                                {formatPrice(p.priceCents, p.currency)}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              <div className="border-t border-[var(--pink-100)] pt-2">
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  className="block rounded-lg px-3 py-2 text-center text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]"
                  onClick={() => setOpen(false)}
                >
                  Advanced search → filters &amp; all results
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
