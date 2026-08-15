"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateStockAction } from "./actions";

type Props = {
  productId: string;
  currentStock: number | null;
};

export function StockUpdateForm({ productId, currentStock }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(currentStock === null ? "" : String(currentStock));
  const [pending, setPending] = useState(false);

  return (
    <form
      className="flex items-center gap-2"
      action={async (formData) => {
        formData.set("productId", productId);
        formData.set("stockQuantity", value);
        setPending(true);
        await updateStockAction(formData);
        setPending(false);
        router.refresh();
      }}
    >
      <input
        type="number"
        min={0}
        placeholder="—"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 rounded border border-zinc-300 px-2 py-1 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded bg-zinc-800 px-2 py-1 text-xs font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {pending ? "…" : "Set"}
      </button>
    </form>
  );
}
