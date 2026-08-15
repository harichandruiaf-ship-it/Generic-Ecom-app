"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { addToWishlistAction, removeFromWishlistAction } from "@/app/(storefront)/account/wishlist/actions";

export function WishlistButton({
  productId,
  inWishlist,
}: {
  productId: string;
  inWishlist: boolean;
}) {
  const router = useRouter();

  async function handleAdd() {
    await addToWishlistAction(productId);
    router.refresh();
  }

  async function handleRemove() {
    await removeFromWishlistAction(productId);
    router.refresh();
  }

  return inWishlist ? (
    <button
      type="button"
      onClick={() => handleRemove()}
      className="mt-4 flex items-center gap-2 rounded-lg border-2 border-[var(--pink-200)] bg-[var(--pink-50)] px-4 py-2 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-100)]"
    >
      <span aria-hidden>♥</span> Remove from wishlist
    </button>
  ) : (
    <button
      type="button"
      onClick={() => handleAdd()}
      className="mt-4 flex items-center gap-2 rounded-lg border-2 border-[var(--pink-200)] px-4 py-2 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]"
    >
      <span aria-hidden>♡</span> Save to wishlist
    </button>
  );
}

export function WishlistButtonGuest() {
  return (
    <Link
      href="/login"
      className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-[var(--pink-200)] px-4 py-2 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)]"
    >
      <span aria-hidden>♡</span> Log in to save to wishlist
    </Link>
  );
}
