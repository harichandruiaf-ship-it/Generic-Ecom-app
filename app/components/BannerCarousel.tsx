"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getBannerHref } from "@/lib/banner-utils";
import type { BannerItem } from "@/lib/banner-utils";

const ROTATE_MS = 5000;

export function BannerCarousel({ banners }: { banners: BannerItem[] }) {
  const [index, setIndex] = useState(0);

  const go = useCallback(
    (i: number) => {
      setIndex(((i % banners.length) + banners.length) % banners.length);
    },
    [banners.length]
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => {
      setIndex((prev) => (prev + 1) % banners.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const current = banners[index];
  const href = getBannerHref(current.linkType, current.linkSlug);

  return (
    <section className="border-b border-[var(--pink-200)] bg-[var(--pink-100)]">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border-2 border-[var(--pink-200)] bg-white shadow-lg w-full">
          <Link
            href={href}
            className="block aspect-[21/9] w-full min-h-[180px] sm:aspect-[3/1] sm:min-h-[220px]"
            aria-label={`Offer: go to ${current.linkType} ${current.linkSlug}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={current.id}
              src={current.image}
              alt=""
              className="h-full w-full object-cover object-center transition duration-500 ease-out hover:scale-[1.02]"
            />
          </Link>

          {banners.length > 1 && (
            <>
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      go(i);
                    }}
                    className={`h-2 rounded-full transition-all ${
                      i === index
                        ? "w-6 bg-[var(--pink-500)]"
                        : "w-2 bg-[var(--pink-300)]/70 hover:bg-[var(--pink-400)]"
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
