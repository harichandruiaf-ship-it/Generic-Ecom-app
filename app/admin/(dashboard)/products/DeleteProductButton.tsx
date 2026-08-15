"use client";

import { deleteProductAction } from "./actions";

export function DeleteProductButton({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  return (
    <form
      action={deleteProductAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm(`Delete "${productTitle}"? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Delete
      </button>
    </form>
  );
}
