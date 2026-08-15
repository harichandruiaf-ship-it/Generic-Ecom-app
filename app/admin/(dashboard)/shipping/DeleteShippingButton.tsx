"use client";

import { deleteShippingMethodAction } from "./actions";

export function DeleteShippingButton({ id }: { id: string }) {
  return (
    <form action={deleteShippingMethodAction} className="ml-2 inline">
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => !confirm("Delete this shipping method?") && e.preventDefault()}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
