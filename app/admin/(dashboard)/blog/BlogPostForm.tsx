"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { createBlogPostAction } from "./actions";

export function BlogPostForm() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={async (formData) => {
        formData.set("imageUrl", imageUrl);
        await createBlogPostAction(formData);
        router.refresh();
      }}
      className="max-w-2xl space-y-6 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-zinc-700">Title *</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-zinc-700">Excerpt (optional)</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700">Content *</label>
        <textarea
          id="content"
          name="content"
          rows={12}
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
        />
        <p className="mt-1 text-xs text-zinc-500">HTML is supported.</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-700">Featured image (optional)</label>
        <p className="mt-0.5 text-xs text-zinc-500">
          Upload an image (JPEG, PNG, WebP, GIF, max 5MB).
        </p>
        <input type="hidden" name="imageUrl" value={imageUrl} />
        <div className="mt-2 flex items-center gap-3">
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
                form.append("folder", "blog");
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
            className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload image"}
          </button>
        </div>
        {uploadError && <p className="mt-2 text-sm text-red-600">{uploadError}</p>}
        {imageUrl && (
          <div className="mt-3 flex items-center gap-2">
            <img
              src={imageUrl}
              alt="Preview"
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
        <label className="block text-sm font-medium text-zinc-700">Status</label>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="DRAFT" defaultChecked className="rounded border-zinc-300" />
            <span>Draft</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="status" value="PUBLISHED" className="rounded border-zinc-300" />
            <span>Published</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Create post
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
