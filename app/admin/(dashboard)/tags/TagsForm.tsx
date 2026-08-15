"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createTagAction,
  updateTagAction,
  deleteTagAction,
} from "./actions";
import type { Tag } from "@/generated/prisma/client";

type TagWithCount = Tag & { _count: { products: number } };

export function TagsForm({ tags }: { tags: TagWithCount[] }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
          <h2 className="font-semibold text-zinc-900">All tags</h2>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add tag
          </button>
        </div>
        {adding && (
          <form
            action={async (formData: FormData) => {
              await createTagAction(formData);
              setAdding(false);
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
          </form>
        )}
        <ul className="divide-y divide-zinc-100">
          {tags.length === 0 ? (
            <li className="px-6 py-8 text-center text-sm text-zinc-500">
              No tags yet.
            </li>
          ) : (
            tags.map((t) => (
              <li key={t.id} className="px-6 py-3">
                <TagRow tag={t} onRefresh={() => router.refresh()} />
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function TagRow({
  tag,
  onRefresh,
}: {
  tag: TagWithCount;
  onRefresh: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return editing ? (
    <form
      action={async (formData: FormData) => {
        formData.set("tagId", tag.id);
        await updateTagAction(formData);
        setEditing(false);
        onRefresh();
      }}
      className="flex flex-wrap items-center gap-3"
    >
      <input
        name="name"
        defaultValue={tag.name}
        required
        className="rounded border border-zinc-300 px-2 py-1 text-sm"
      />
      <input
        name="slug"
        defaultValue={tag.slug}
        required
        className="rounded border border-zinc-300 px-2 py-1 font-mono text-sm"
      />
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
        <span className="font-medium text-zinc-900">{tag.name}</span>
        <span className="font-mono text-xs text-zinc-500">{tag.slug}</span>
        <span className="text-xs text-zinc-400">
          {tag._count.products} products
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
                `Delete "${tag.name}"? Products will be unlinked from this tag.`
              )
            )
              return;
            const formData = new FormData(e.currentTarget);
            await deleteTagAction(formData);
            onRefresh();
          }}
        >
          <input type="hidden" name="tagId" value={tag.id} />
          <button type="submit" className="text-sm text-red-600 hover:underline">
            Delete
          </button>
        </form>
      </div>
    </div>
  );
}
