"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
} from "./actions";
import type { Category } from "@/generated/prisma/client";

type CatWithMeta = Category & {
  parent: Category | null;
  _count: { products: number };
};

export function CategoriesForm({ categories }: { categories: CatWithMeta[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [newCategoryImage, setNewCategoryImage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const newCatFileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="font-semibold text-zinc-900">All categories</h2>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add category
          </button>
        </div>
        {adding && (
          <form
            action={async (formData: FormData) => {
              await createCategoryAction(formData);
              setAdding(false);
              setNewCategoryImage("");
              router.refresh();
            }}
            className="border-b border-zinc-100 p-6"
          >
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  Name
                </label>
                <input
                  name="name"
                  required
                  className="mt-1 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  Slug
                </label>
                <input
                  name="slug"
                  placeholder="auto"
                  className="mt-1 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  Parent
                </label>
                <select
                  name="parentId"
                  className="mt-1 rounded border border-zinc-300 px-2 py-1.5 text-sm"
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500">
                  Image (optional)
                </label>
                <input type="hidden" name="image" value={newCategoryImage} />
                <input
                  ref={newCatFileRef}
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
                      form.append("folder", "categories");
                      const res = await fetch("/api/upload", { method: "POST", body: form });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || "Upload failed");
                      const url = data.urls?.[0];
                      if (url) setNewCategoryImage(url);
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
                  onClick={() => newCatFileRef.current?.click()}
                  disabled={uploading}
                  className="mt-1 rounded border border-zinc-300 px-2 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-50"
                >
                  {uploading ? "…" : "Upload"}
                </button>
                {newCategoryImage && (
                  <img src={newCategoryImage} alt="" className="mt-1 h-12 w-16 rounded object-cover" />
                )}
              </div>
              <button
                type="submit"
                className="rounded bg-zinc-900 px-3 py-1.5 text-sm text-white hover:bg-zinc-800"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setAdding(false)}
                className="rounded border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                Cancel
              </button>
            </div>
            {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
          </form>
        )}
        <ul className="divide-y divide-zinc-100">
          {categories.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-zinc-500">
              No categories yet.
            </li>
          ) : (
            categories.map((c) => (
              <li key={c.id} className="px-6 py-3">
                <CategoryRow
                  category={c}
                  allCategories={categories}
                  onRefresh={() => router.refresh()}
                />
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  allCategories,
  onRefresh,
}: {
  category: CatWithMeta;
  allCategories: CatWithMeta[];
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [imageUrl, setImageUrl] = useState(category.image ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const others = allCategories.filter((x) => x.id !== category.id);

  return editing ? (
    <form
      action={async (formData: FormData) => {
        formData.set("categoryId", category.id);
        formData.set("image", imageUrl);
        await updateCategoryAction(formData);
        setEditing(false);
        onRefresh();
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <input
        name="name"
        defaultValue={category.name}
        required
        className="rounded border border-zinc-300 px-2 py-1 text-sm"
      />
      <input
        name="slug"
        defaultValue={category.slug}
        required
        className="rounded border border-zinc-300 px-2 py-1 font-mono text-sm"
      />
      <select
        name="parentId"
        defaultValue={category.parentId ?? ""}
        className="rounded border border-zinc-300 px-2 py-1 text-sm"
      >
        <option value="">None</option>
        {others.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-2">
        <span className="text-xs text-zinc-500">Image</span>
        <input type="hidden" name="image" value={imageUrl} />
        <input
          ref={fileRef}
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
              form.append("folder", "categories");
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
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded border border-zinc-300 px-2 py-1 text-xs hover:bg-zinc-50 disabled:opacity-50"
        >
          {uploading ? "…" : "Upload"}
        </button>
        {imageUrl && (
          <img src={imageUrl} alt="" className="h-10 w-14 rounded object-cover" />
        )}
      </div>
      {uploadError && <span className="text-xs text-red-600">{uploadError}</span>}
      <button type="submit" className="text-sm text-zinc-600 hover:underline">
        Save
      </button>
      <button
        type="button"
        onClick={() => setEditing(false)}
        className="text-sm text-zinc-500 hover:underline"
      >
        Cancel
      </button>
    </form>
  ) : (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {category.image && (
          <img src={category.image} alt="" className="h-10 w-14 rounded object-cover" />
        )}
        <span className="font-medium text-zinc-900">{category.name}</span>
        <span className="font-mono text-xs text-zinc-500">{category.slug}</span>
        {category.parent && (
          <span className="text-xs text-zinc-500">
            Parent: {category.parent.name}
          </span>
        )}
        <span className="text-xs text-zinc-400">
          {category._count.products} products
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-sm text-zinc-600 hover:underline"
        >
          Edit
        </button>
        <form
          className="inline"
          onSubmit={async (e) => {
            e.preventDefault();
            if (
              !confirm(
                `Delete "${category.name}"? Products will be unlinked from this category.`
              )
            )
              return;
            const formData = new FormData(e.currentTarget);
            await deleteCategoryAction(formData);
            onRefresh();
          }}
        >
          <input type="hidden" name="categoryId" value={category.id} />
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
