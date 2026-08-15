"use server";

import { revalidatePath } from "next/cache";
import {
  getCartFromCookie,
  setCartCookie,
  type Cart,
  type CartItem,
} from "@/lib/cart";
import { getPrisma } from "@/lib/prisma";

export async function addToCartAction(
  productId: string,
  quantity: number = 1
): Promise<{ error?: string }> {
  const prisma = getPrisma();
  if (!prisma) return { error: "Store unavailable." };

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      slug: true,
      title: true,
      priceCents: true,
      currency: true,
      images: true,
      status: true,
      stockQuantity: true,
    },
  });
  if (!product || product.status !== "ACTIVE")
    return { error: "Product not found or not available." };

  const cart = await getCartFromCookie();
  const existing = cart.items.find((i) => i.productId === productId);
  const existingQty = existing?.quantity ?? 0;
  let qty = Math.max(1, Math.min(quantity, 99));

  if (product.stockQuantity != null) {
    const available = Math.max(0, product.stockQuantity - existingQty);
    if (available <= 0) return { error: "Not enough stock." };
    qty = Math.min(qty, available);
  }

  const images = Array.isArray(product.images) ? (product.images as string[]) : [];
  const image = images[0];

  if (existing) {
    existing.quantity = existingQty + qty;
  } else {
    cart.items.push({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      priceCents: product.priceCents,
      currency: product.currency ?? "USD",
      quantity: qty,
      image,
    });
  }

  await setCartCookie(cart);
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return {};
}

export async function updateCartItemAction(
  productId: string,
  quantity: number
): Promise<{ error?: string }> {
  const prisma = getPrisma();
  const cart = await getCartFromCookie();
  const item = cart.items.find((i) => i.productId === productId);
  if (!item) return { error: "Item not in cart." };

  if (quantity <= 0) {
    cart.items = cart.items.filter((i) => i.productId !== productId);
  } else {
    let maxQty = 99;
    if (prisma) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { stockQuantity: true },
      });
      if (product?.stockQuantity != null)
        maxQty = Math.max(0, product.stockQuantity);
    }
    item.quantity = Math.min(maxQty, quantity);
  }

  await setCartCookie(cart);
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return {};
}

export async function removeFromCartAction(productId: string): Promise<void> {
  const cart = await getCartFromCookie();
  cart.items = cart.items.filter((i) => i.productId !== productId);
  await setCartCookie(cart);
  revalidatePath("/");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function getCart(): Promise<Cart> {
  return getCartFromCookie();
}
