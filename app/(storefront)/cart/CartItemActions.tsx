"use client";

import { useRouter } from "next/navigation";
import { updateCartItemAction, removeFromCartAction } from "./actions";

export function CartItemActions({
  productId,
  quantity,
}: {
  productId: string;
  quantity: number;
}) {
  const router = useRouter();

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <form
        className="flex items-center gap-1"
        action={async (formData) => {
          const qty = parseInt(formData.get("quantity") as string, 10);
          await updateCartItemAction(productId, Number.isNaN(qty) ? 1 : qty);
          router.refresh();
        }}
      >
        <label htmlFor={`qty-${productId}`} className="sr-only">
          Quantity
        </label>
        <select
          id={`qty-${productId}`}
          name="quantity"
          defaultValue={quantity}
          onChange={(e) => {
            const form = e.target.form;
            if (form) {
              const fd = new FormData(form);
              updateCartItemAction(productId, parseInt(e.target.value, 10)).then(() =>
                router.refresh()
              );
            }
          }}
          className="rounded border border-[var(--pink-200)] bg-white px-2 py-1 text-sm text-[var(--foreground)]"
        >
          {Array.from({ length: 99 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </form>
      <form
        action={async () => {
          await removeFromCartAction(productId);
          router.refresh();
        }}
        className="inline"
      >
        <button
          type="submit"
          className="text-sm font-medium text-red-600 hover:underline"
        >
          Remove
        </button>
      </form>
    </div>
  );
}
