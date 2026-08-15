"use client";

import { deleteBannerAction } from "./actions";

export function DeleteBannerButton({ bannerId }: { bannerId: string }) {
  return (
    <form
      action={deleteBannerAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("Delete this banner?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="bannerId" value={bannerId} />
      <button
        type="submit"
        className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
