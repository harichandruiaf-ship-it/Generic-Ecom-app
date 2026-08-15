"use client";

import Link from "next/link";
import { getBannerHref } from "@/lib/banner-utils";
import type { BannerItem } from "@/lib/banner-utils";

export function BannerStrip({ banners }: { banners: BannerItem[] }) {
  if (banners.length === 0) return null;

  return (
    <section className="border-y border-[var(--pink-200)] bg-[var(--pink-100)]">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
          {banners.map((b) => {
            const href = getBannerHref(b.linkType, b.linkSlug);
            return (
              <Link
                key={b.id}
                href={href}
                className="block h-14 shrink-0 overflow-hidden rounded-lg border border-[var(--pink-200)] bg-white shadow-sm transition hover:border-[var(--pink-400)] hover:shadow md:h-16"
                aria-label={`Promo: ${b.linkType} ${b.linkSlug}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={b.image}
                  alt=""
                  className="h-full w-auto max-w-[200px] object-contain md:max-w-[280px]"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
