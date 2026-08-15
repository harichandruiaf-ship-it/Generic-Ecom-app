import { cookies } from "next/headers";

export const CART_COOKIE_NAME = "cart";
const CART_MAX_ITEMS = 50;

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  priceCents: number;
  /** Product currency when added (e.g. USD). Used to convert to store currency for display. */
  currency?: string;
  quantity: number;
  image?: string;
};

export type Cart = {
  items: CartItem[];
};

function parseCart(value: string | undefined): Cart {
  if (!value) return { items: [] };
  try {
    const parsed = JSON.parse(value) as Cart;
    if (!Array.isArray(parsed?.items)) return { items: [] };
    const items = parsed.items.slice(0, CART_MAX_ITEMS).filter(
      (i) =>
        i &&
        typeof i.productId === "string" &&
        typeof i.slug === "string" &&
        typeof i.title === "string" &&
        typeof i.priceCents === "number" &&
        typeof i.quantity === "number" &&
        i.quantity > 0
    ).map((i) => ({ ...i, currency: typeof i.currency === "string" ? i.currency : "USD" }));
    return { items };
  } catch {
    return { items: [] };
  }
}

function serializeCart(cart: Cart): string {
  return JSON.stringify(cart);
}

export async function getCartFromCookie(): Promise<Cart> {
  const cookieStore = await cookies();
  const value = cookieStore.get(CART_COOKIE_NAME)?.value;
  return parseCart(value);
}

export function getCartCount(cart: Cart): number {
  return cart.items.reduce((sum, i) => sum + i.quantity, 0);
}

/** Number of distinct product lines in the cart (not total quantity). */
export function getCartProductCount(cart: Cart): number {
  return cart.items.length;
}

export async function setCartCookie(cart: Cart): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, serializeCart(cart), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    sameSite: "lax",
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearCartCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
