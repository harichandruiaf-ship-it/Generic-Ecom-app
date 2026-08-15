"use client";

import { useRouter } from "next/navigation";
import { updateOrderInternalNoteAction } from "./actions";

export function OrderInternalNoteForm({
  orderId,
  internalNote,
}: {
  orderId: string;
  internalNote: string | null;
}) {
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        await updateOrderInternalNoteAction(formData);
        router.refresh();
      }}
      className="mt-3"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <textarea
        name="internalNote"
        rows={3}
        defaultValue={internalNote ?? ""}
        placeholder="Internal note (not visible to customer)"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="mt-2 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Save note
      </button>
    </form>
  );
}
