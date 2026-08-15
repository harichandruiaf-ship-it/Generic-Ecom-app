"use client";

import { useState } from "react";
import Link from "next/link";
import { getBannerHref } from "@/lib/banner-utils";
import type { BannerItem } from "@/lib/banner-utils";

const ANIMATION_CLASS: Record<string, string> = {
  NONE: "",
  FADE: "animate-fade-in",
  SLIDE: "animate-slide-up",
  ZOOM: "animate-zoom-in",
};

function PromoCard({
  b,
  index,
}: {
  b: BannerItem;
  index: number;
}) {
  const href = getBannerHref(b.linkType, b.linkSlug);
  const anim = (b.animation && ANIMATION_CLASS[b.animation]) ? ANIMATION_CLASS[b.animation] : "";
  const delay = anim ? { animationDelay: `${(index % 10) * 80}ms` } : undefined;
  const zoomHover = b.animation === "ZOOM" ? "group-hover:scale-105 transition-transform duration-300" : "";

  return (
    <Link
      href={href}
      className={`group flex-shrink-0 overflow-hidden rounded-2xl border-2 border-[var(--pink-200)] bg-white shadow-md transition duration-300 hover:border-[var(--pink-400)] hover:shadow-lg ${anim}`}
      style={delay}
      aria-label={`Promo: ${b.linkType} ${b.linkSlug}`}
    >
      <div className="h-[140px] w-[280px] sm:h-[160px] sm:w-[320px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={b.image}
          alt=""
          className={`h-full w-full object-cover ${zoomHover}`}
        />
      </div>
    </Link>
  );
}

export function BannerGrid({ banners }: { banners: BannerItem[] }) {
  const [isHovered, setIsHovered] = useState(false);

  if (banners.length === 0) return null;

  return (
    <section
      className="border-b border-[var(--pink-200)] bg-[var(--pink-50)]/50"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label="Promo offers"
    >
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden">
          <div
            className="flex w-max gap-4 animate-promo-ribbon"
            style={{
              animationPlayState: isHovered ? "paused" : "running",
            }}
          >
            {banners.map((b, i) => (
              <PromoCard key={`a-${b.id}-${i}`} b={b} index={i} />
            ))}
            {banners.map((b, i) => (
              <PromoCard key={`b-${b.id}-${i}`} b={b} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
