"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { createProductAction, updateProductAction } from "./actions";
import { STORE_CURRENCIES } from "@/lib/currencies";
import type { Product, Category, Tag } from "@/generated/prisma/client";

type ProductWithRelations = Product & {
  categories: { categoryId: string }[];
  tags: { tagId: string }[];
};

export function ProductForm({
  product,
  categories,
  tags,
}: {
  product?: ProductWithRelations | null;
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const isEdit = !!product;
  const initialImages = Array.isArray(product?.images) ? (product.images as string[]) : [];
  const [imageUrls, setImageUrls] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attributesValue =
    product?.attributes && typeof product.attributes === "object"
      ? JSON.stringify(product.attributes as Record<string, unknown>, null, 2)
      : "";

  return (
    <form
      action={async (formData: FormData) => {
        if (isEdit) {
          formData.set("productId", product.id);
          await updateProductAction(formData);
        } else {
          await createProductAction(formData);
        }
        router.push("/admin/products");
        router.refresh();
      }}
      className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      {isEdit && (
        <input type="hidden" name="productId" value={product.id} />
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700">
          Title *
        </label>
        <input
          id="title"
          name="title"
          defaultValue={product?.title}
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-zinc-700">
          Slug *
        </label>
        <input
          id="slug"
          name="slug"
          defaultValue={product?.slug}
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-zinc-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          defaultValue={product?.description ?? ""}
          rows={3}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priceCents" className="block text-sm font-medium text-zinc-700">
            Price (cents) *
          </label>
          <input
            id="priceCents"
            name="priceCents"
            type="number"
            min={0}
            defaultValue={product?.priceCents ?? 0}
            required
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-zinc-700">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={product?.currency ?? "USD"}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          >
            {STORE_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">Price is stored in this currency. Storefront converts to the store currency using current exchange rates.</p>
        </div>
      </div>
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-zinc-700">
          Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={product?.status ?? "DRAFT"}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </select>
      </div>
      <div>
        <label htmlFor="stockQuantity" className="block text-sm font-medium text-zinc-700">
          Stock quantity
        </label>
        <input
          id="stockQuantity"
          name="stockQuantity"
          type="number"
          min={0}
          placeholder="Leave blank for unlimited"
          defaultValue={product?.stockQuantity ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
        <p className="mt-0.5 text-xs text-zinc-500">Optional. Empty = no inventory tracking.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Product images
        </label>
        <p className="mt-0.5 text-xs text-zinc-500">
          Upload images (JPEG, PNG, WebP, GIF, max 5MB each). They are saved in{" "}
          <code className="rounded bg-zinc-100 px-1">public/uploads/products</code>.
        </p>
        <input
          type="hidden"
          name="images"
          value={imageUrls.join("\n")}
        />
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={async (e) => {
              const files = e.target.files;
              if (!files?.length) return;
              setUploadError(null);
              setUploading(true);
              try {
                const form = new FormData();
                for (let i = 0; i < files.length; i++) {
                  form.append("files", files[i]);
                }
                const res = await fetch("/api/upload", {
                  method: "POST",
                  body: form,
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Upload failed");
                setImageUrls((prev) => [...prev, ...(data.urls || [])]);
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
            {uploading ? "Uploading…" : "Upload images"}
          </button>
        </div>
        {uploadError && (
          <p className="mt-2 text-sm text-red-600">{uploadError}</p>
        )}
        {imageUrls.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <li
                key={`${url}-${i}`}
                className="relative flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2"
              >
                <img
                  src={url}
                  alt=""
                  className="h-10 w-10 rounded object-cover"
                />
                <span className="max-w-[120px] truncate text-xs text-zinc-600">
                  {url.split("/").pop()}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setImageUrls((prev) => prev.filter((_, j) => j !== i))
                  }
                  className="ml-1 rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-700"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <label htmlFor="attributes" className="block text-sm font-medium text-zinc-700">
          Attributes (JSON)
        </label>
        <textarea
          id="attributes"
          name="attributes"
          defaultValue={attributesValue}
          rows={4}
          placeholder='{"material": "silver", "weight": 10}'
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Categories (select)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((c) => (
            <label key={c.id} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                name="categoryIds"
                value={c.id}
                defaultChecked={product?.categories?.some((pc) => pc.categoryId === c.id)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
              />
              <span className="text-sm text-zinc-700">{c.name}</span>
            </label>
          ))}
          {categories.length === 0 && (
            <p className="text-sm text-zinc-500">No categories. Create one in Categories.</p>
          )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">
          Tags (select)
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((t) => (
            <label key={t.id} className="inline-flex items-center gap-1.5">
              <input
                type="checkbox"
                name="tagIds"
                value={t.id}
                defaultChecked={product?.tags?.some((pt) => pt.tagId === t.id)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
              />
              <span className="text-sm text-zinc-700">{t.name}</span>
            </label>
          ))}
          {tags.length === 0 && (
            <p className="text-sm text-zinc-500">No tags. Create one in Tags.</p>
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          {isEdit ? "Save changes" : "Create product"}
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
