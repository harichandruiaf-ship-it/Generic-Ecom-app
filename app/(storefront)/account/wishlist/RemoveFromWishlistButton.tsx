"use client";

import { useRouter } from "next/navigation";
import { removeFromWishlistAction } from "./actions";

export function RemoveFromWishlistButton({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const router = useRouter();

  return (
    <form
      action={async () => {
        await removeFromWishlistAction(productId);
        router.refresh();
      }}
    >
      <button type="submit" className={className}>
        Remove
      </button>
    </form>
  );
}
