"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/app/(storefront)/cart/actions";

export function AddToCartForm({
  productId,
  cartEnabled,
  maxQuantity,
  initialCartQuantity = 0,
}: {
  productId: string;
  cartEnabled: boolean;
  maxQuantity?: number;
  initialCartQuantity?: number;
}) {
  const router = useRouter();
  const cap = maxQuantity != null ? Math.max(0, maxQuantity) : 99;
  const [quantity, setQuantity] = useState(Math.min(1, cap));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<"success" | "error" | null>(null);

  if (!cartEnabled) return null;

  const effectiveMax = Math.min(99, cap);
  const outOfStock = effectiveMax <= 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (outOfStock) return;
    setPending(true);
    setMessage(null);
    const result = await addToCartAction(productId, quantity);
    setPending(false);
    if (result.error) {
      setMessage("error");
      return;
    }
    setMessage("success");
    router.refresh();
  }

  function handleAddMore() {
    setMessage(null);
  }

  if (message === "success") {
    return (
      <div className="mt-6 rounded-2xl border-2 border-green-200 bg-green-50 p-5">
        <p className="font-medium text-green-800">
          Added to cart. {initialCartQuantity} {initialCartQuantity === 1 ? "item" : "items"} in your cart for this product.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/cart"
            className="inline-flex items-center justify-center rounded-lg bg-[var(--pink-500)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
          >
            Go to cart
          </Link>
          <button
            type="button"
            onClick={handleAddMore}
            className="inline-flex items-center justify-center rounded-lg border-2 border-[var(--pink-300)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--pink-600)] transition hover:bg-[var(--pink-50)]"
          >
            Add more
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {initialCartQuantity > 0 && (
        <p className="mb-3 text-sm font-medium text-[var(--pink-600)]">
          {initialCartQuantity} {initialCartQuantity === 1 ? "item" : "items"} already in your cart — add more below
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-4">
        <label htmlFor={`quantity-${productId}`} className="text-sm font-medium text-[var(--foreground)]/80">
          Quantity
        </label>
        <input
          id={`quantity-${productId}`}
          type="number"
          min={1}
          max={effectiveMax}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Math.min(effectiveMax, parseInt(e.target.value, 10) || 1)))}
          className="w-20 rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-center text-[var(--foreground)]"
          disabled={outOfStock}
        />
        {maxQuantity != null && maxQuantity > 0 && (
          <span className="text-sm text-[var(--foreground)]/60">Only {maxQuantity} left</span>
        )}
        {outOfStock && (
          <span className="text-sm font-medium text-red-600">Out of stock</span>
        )}
        <button
          type="submit"
          disabled={pending || outOfStock}
          className="rounded-lg bg-[var(--pink-500)] px-6 py-3 text-sm font-semibold text-white transition duration-200 hover:bg-[var(--pink-600)] disabled:opacity-50"
        >
          {pending ? "Adding…" : outOfStock ? "Out of stock" : initialCartQuantity > 0 ? "Add more to cart" : "Add to cart"}
        </button>
      </form>
      {message === "error" && (
        <p className="mt-2 text-sm font-medium text-red-600">Could not add. Check stock and try again.</p>
      )}
    </div>
  );
}
