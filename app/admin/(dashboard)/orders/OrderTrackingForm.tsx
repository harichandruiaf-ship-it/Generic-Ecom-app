"use client";

import { useRouter } from "next/navigation";
import { updateOrderTrackingAction } from "./actions";

export function OrderTrackingForm({
  orderId,
  trackingCode,
}: {
  orderId: string;
  trackingCode: string | null;
}) {
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        await updateOrderTrackingAction(formData);
        router.refresh();
      }}
      className="mt-3 space-y-2"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <input
        type="text"
        name="trackingCode"
        defaultValue={trackingCode ?? ""}
        placeholder="Carrier tracking number"
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm font-mono"
      />
      <button
        type="submit"
        className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700"
      >
        Save tracking
      </button>
    </form>
  );
}
