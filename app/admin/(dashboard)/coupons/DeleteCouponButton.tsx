"use client";

import { deleteCouponAction } from "./actions";

export function DeleteCouponButton({ id }: { id: string }) {
  return (
    <form action={deleteCouponAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => !confirm("Delete this coupon?") && e.preventDefault()}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        Delete
      </button>
    </form>
  );
}
