"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { createBannerAction, updateBannerAction } from "./actions";
import type { AdBanner } from "@/generated/prisma/client";
import type { Category, Tag } from "@/generated/prisma/client";

type ProductOption = { id: string; title: string; slug: string };
type BannerLinkType = AdBanner["linkType"];

const PLACEMENT_OPTIONS: { value: string; label: string; screen: string }[] = [
  { value: "HOME_HERO", label: "Home – Hero carousel", screen: "Home" },
  { value: "HOME_PROMO_GRID", label: "Home – Promo grid", screen: "Home" },
  { value: "CATEGORY_TOP", label: "Category/Shop – Top", screen: "Categories / Tags / Products" },
  { value: "CATEGORY_SIDEBAR", label: "Category/Shop – Sidebar", screen: "Categories / Tags / Products" },
  { value: "PRODUCT_PAGE", label: "Product page", screen: "Product detail" },
  { value: "CART_PROMO", label: "Cart – Promo strip", screen: "Cart" },
  { value: "FOOTER_STRIP", label: "Footer strip", screen: "Above footer" },
];
const LAYOUT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "FULL_WIDTH", label: "Full width" },
  { value: "CARD", label: "Card" },
  { value: "BOX", label: "Box (compact)" },
];
const ANIMATION_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "FADE", label: "Fade" },
  { value: "SLIDE", label: "Slide" },
  { value: "ZOOM", label: "Zoom" },
];

export function BannerForm({
  banner,
  defaultPlacement,
  categories,
  tags,
  products,
}: {
  banner?: AdBanner | null;
  defaultPlacement?: string;
  categories: Category[];
  tags: Tag[];
  products: ProductOption[];
}) {
  const router = useRouter();
  const isEdit = !!banner;
  const [imageUrl, setImageUrl] = useState<string>(banner?.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<BannerLinkType>(banner?.linkType ?? "CATEGORY");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const linkSlugDefault =
    isEdit && banner && banner.linkType === linkType
      ? banner.linkSlug
      : linkType === "TAG"
        ? tags[0]?.slug ?? ""
        : linkType === "CATEGORY"
          ? categories[0]?.slug ?? ""
          : products[0]?.slug ?? "";

  return (
    <form
      action={async (formData: FormData) => {
        formData.set("image", imageUrl);
        formData.set("linkType", linkType);
        const slug = formData.get("linkSlug") as string;
        if (slug) formData.set("linkSlug", slug);
        const placement = formData.get("placement") as string;
        if (placement) formData.set("placement", placement);
        const layout = formData.get("layout") as string;
        if (layout) formData.set("layout", layout);
        const animation = formData.get("animation") as string;
        if (animation) formData.set("animation", animation);
        if (isEdit) {
          formData.set("bannerId", banner.id);
          await updateBannerAction(formData);
        } else {
          await createBannerAction(formData);
        }
        router.push("/admin/banners");
        router.refresh();
      }}
      className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      {isEdit && <input type="hidden" name="bannerId" value={banner.id} />}

      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Banner image *
        </label>
        <p className="mt-0.5 text-xs text-zinc-500">
          Upload one image (JPEG, PNG, WebP, GIF, max 5MB). Saved in{" "}
          <code className="rounded bg-zinc-100 px-1">public/uploads/banners</code>.
        </p>
        <input type="hidden" name="image" value={imageUrl} />
        <div className="mt-2 flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadError(null);
              setUploading(true);
              try {
                const form = new FormData();
                form.append("files", file);
                form.append("folder", "banners");
                const res = await fetch("/api/upload", { method: "POST", body: form });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Upload failed");
                const url = data.urls?.[0];
                if (url) setImageUrl(url);
              } catch (err) {
                setUploadError(err instanceof Error ? err.message : "Upload failed");
              } finally {
                setUploading(false);
                e.target.value = "";
              }
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
        {imageUrl && (
          <div className="mt-3 flex items-center gap-2">
            <img
              src={imageUrl}
              alt="Banner"
              className="h-24 w-40 rounded border border-zinc-200 object-cover"
            />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="rounded p-1 text-sm text-zinc-500 hover:bg-zinc-100"
            >
              Remove
            </button>
          </div>
        )}
      </div>

      <div>
        <label htmlFor="placement" className="block text-sm font-medium text-zinc-700">
          Screen / Placement *
        </label>
        <select
          id="placement"
          name="placement"
          defaultValue={banner?.placement ?? defaultPlacement ?? "HOME_HERO"}
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {PLACEMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label} ({o.screen})
            </option>
          ))}
        </select>
        <p className="mt-0.5 text-xs text-zinc-500">Where this banner appears in the store.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="layout" className="block text-sm font-medium text-zinc-700">Layout</label>
          <select
            id="layout"
            name="layout"
            defaultValue={banner?.layout ?? ""}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            {LAYOUT_OPTIONS.map((o) => (
              <option key={o.value || "default"} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="animation" className="block text-sm font-medium text-zinc-700">Animation</label>
          <select
            id="animation"
            name="animation"
            defaultValue={banner?.animation ?? "NONE"}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            {ANIMATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="linkType" className="block text-sm font-medium text-zinc-700">
          Link to *
        </label>
        <select
          id="linkType"
          name="linkType"
          value={linkType}
          onChange={(e) => setLinkType(e.target.value as BannerLinkType)}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="CATEGORY">Category</option>
          <option value="TAG">Tag</option>
          <option value="PRODUCT">Product</option>
        </select>
      </div>

      <div>
        <label htmlFor="linkSlug" className="block text-sm font-medium text-zinc-700">
          {linkType === "TAG" ? "Tag" : linkType === "CATEGORY" ? "Category" : "Product"} *
        </label>
        <select
          key={linkType}
          id="linkSlug"
          name="linkSlug"
          defaultValue={linkSlugDefault}
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {linkType === "TAG" &&
            tags.map((t) => (
              <option key={t.id} value={t.slug}>
                {t.name}
              </option>
            ))}
          {linkType === "CATEGORY" &&
            categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          {linkType === "PRODUCT" &&
            products.map((p) => (
              <option key={p.id} value={p.slug}>
                {p.title}
              </option>
            ))}
        </select>
      </div>

      <div>
        <label htmlFor="sortOrder" className="block text-sm font-medium text-zinc-700">
          Sort order
        </label>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          min={0}
          defaultValue={banner?.sortOrder ?? 0}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <p className="mt-0.5 text-xs text-zinc-500">Lower numbers appear first within the same screen.</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          {isEdit ? "Save changes" : "Create banner"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
