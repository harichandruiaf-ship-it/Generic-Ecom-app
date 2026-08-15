"use client";

import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "./actions";
import type { OrderStatus } from "@/generated/prisma/client";

const STATUSES: OrderStatus[] = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrderStatusForm({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: OrderStatus;
}) {
  const router = useRouter();

  return (
    <form
      action={async (formData) => {
        await updateOrderStatusAction(formData);
        router.refresh();
      }}
      className="mt-3"
    >
      <input type="hidden" name="orderId" value={orderId} />
      <select
        name="status"
        defaultValue={currentStatus}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        onChange={(e) => {
          const form = e.target.form;
          if (form) form.requestSubmit();
        }}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </form>
  );
}
