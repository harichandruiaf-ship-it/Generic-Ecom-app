"use client";

import Link from "next/link";
import { getBannerHref } from "@/lib/banner-utils";
import type { BannerItem } from "@/lib/banner-utils";

const ANIMATION_CLASS: Record<string, string> = {
  NONE: "",
  FADE: "animate-fade-in",
  SLIDE: "animate-slide-up",
  ZOOM: "animate-zoom-in",
};

const LAYOUT_CLASS: Record<string, string> = {
  FULL_WIDTH: "aspect-[21/9] w-full min-h-[140px] sm:min-h-[180px]",
  CARD: "aspect-[2/1] w-full max-w-2xl rounded-2xl",
  BOX: "aspect-square w-full max-w-[280px] rounded-2xl",
};

export function BannerSingle({ banner }: { banner: BannerItem }) {
  const href = getBannerHref(banner.linkType, banner.linkSlug);
  const anim = (banner.animation && ANIMATION_CLASS[banner.animation]) ? ANIMATION_CLASS[banner.animation] : "";
  const layoutClass = (banner.layout && LAYOUT_CLASS[banner.layout]) ? LAYOUT_CLASS[banner.layout] : LAYOUT_CLASS.FULL_WIDTH;
  const zoomHover = banner.animation === "ZOOM" ? "group-hover:scale-105 transition-transform duration-300" : "";

  return (
    <div className={anim || undefined}>
      <Link
        href={href}
        className={`group block overflow-hidden rounded-2xl border-2 border-[var(--pink-200)] bg-white shadow-md transition duration-300 hover:border-[var(--pink-400)] hover:shadow-lg ${layoutClass}`}
        aria-label={`Banner: ${banner.linkType} ${banner.linkSlug}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={banner.image}
          alt=""
          className={`h-full w-full object-cover ${zoomHover}`}
        />
      </Link>
    </div>
  );
}
