"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { updateBlogPostAction, deleteBlogPostAction } from "./actions";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  status: string;
};

export function BlogPostEditForm({ post }: { post: Post }) {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string>(post.imageUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <form
      action={async (formData) => {
        formData.set("imageUrl", imageUrl);
        await updateBlogPostAction(post.id, formData);
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
          defaultValue={post.title}
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      <p className="text-xs text-zinc-500">Slug: {post.slug} (auto-updated from title on save)</p>
      <div>
        <label htmlFor="excerpt" className="block text-sm font-medium text-zinc-700">Excerpt (optional)</label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post.excerpt ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-zinc-700">Content *</label>
        <textarea
          id="content"
          name="content"
          rows={12}
          defaultValue={post.content}
          required
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
        />
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
            <input
              type="radio"
              name="status"
              value="DRAFT"
              defaultChecked={post.status === "DRAFT"}
              className="rounded border-zinc-300"
            />
            <span>Draft</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="status"
              value="PUBLISHED"
              defaultChecked={post.status === "PUBLISHED"}
              className="rounded border-zinc-300"
            />
            <span>Published</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Save changes
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={async () => {
            if (!confirm("Delete this post?")) return;
            await deleteBlogPostAction(post.id);
          }}
          className="ml-auto rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          Delete post
        </button>
      </div>
    </form>
  );
}
