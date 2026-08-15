"use server";

import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getCartFromCookie, clearCartCookie } from "@/lib/cart";
import { getStoreCurrency } from "@/lib/store-currency";
import { getExchangeRates, convertPriceCents } from "@/lib/exchange-rates";
import { getCurrentUser } from "@/lib/customer-auth";
import { OrderStatus } from "@/generated/prisma/client";
import { sendOrderConfirmationEmail } from "@/lib/email";

function get(formData: FormData, key: string): string {
  return (formData.get(key) as string) ?? "";
}

export async function validateCouponAction(
  code: string,
  subtotalCents: number
): Promise<{ discountCents?: number; error?: string }> {
  const prisma = getPrisma();
  if (!prisma || typeof prisma.coupon === "undefined")
    return { error: "Coupons not available." };

  const trimmed = code.trim().toUpperCase();
  if (!trimmed) return {};

  const coupon = await prisma.coupon.findUnique({
    where: { code: trimmed },
  });
  if (!coupon) return { error: "Invalid or expired code." };
  if (subtotalCents < coupon.minOrderCents) {
    return {
      error: `Minimum order for this code is ${(coupon.minOrderCents / 100).toFixed(2)}.`,
    };
  }

  let discountCents = 0;
  if (coupon.type === "FIXED" && coupon.valueCents != null) {
    discountCents = Math.min(coupon.valueCents, subtotalCents);
  } else if (coupon.type === "PERCENT" && coupon.valuePercent != null) {
    discountCents = Math.round(subtotalCents * (coupon.valuePercent / 100));
  }
  return { discountCents };
}

export async function placeOrderAction(formData: FormData): Promise<{ error?: string }> {
  const prisma = getPrisma();
  if (!prisma) return { error: "Store unavailable." };

  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings?.checkoutEnabled) return { error: "Checkout is currently disabled." };

  const cart = await getCartFromCookie();
  if (cart.items.length === 0) return { error: "Your cart is empty." };

  for (const item of cart.items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { title: true, stockQuantity: true },
    });
    if (product?.stockQuantity != null && item.quantity > product.stockQuantity) {
      return {
        error: `Not enough stock for "${product.title}". Available: ${product.stockQuantity}.`,
      };
    }
  }

  const storeCurrency = settings.currency;
  const rates = await getExchangeRates();
  const subtotalCents = cart.items.reduce((s, i) => {
    const itemCents = convertPriceCents(i.priceCents, i.currency ?? "USD", storeCurrency, rates);
    return s + itemCents * i.quantity;
  }, 0);
  if (settings.minimumOrderCents > 0 && subtotalCents < settings.minimumOrderCents) {
    return {
      error: `Minimum order is ${(settings.minimumOrderCents / 100).toFixed(2)} ${settings.currency}. Add more items to checkout.`,
    };
  }

  const email = get(formData, "email").trim();
  const shippingName = get(formData, "shippingName").trim();
  const shippingLine1 = get(formData, "shippingLine1").trim();
  const shippingCity = get(formData, "shippingCity").trim();
  const shippingCountry = get(formData, "shippingCountry").trim();
  if (!email) return { error: "Please enter your email address." };
  if (!shippingName) return { error: "Please enter your full name." };
  if (!shippingLine1) return { error: "Please enter your shipping address." };
  if (!shippingCity) return { error: "Please enter your city." };
  if (!shippingCountry) return { error: "Please enter your country." };

  if (formData.get("acceptTerms") !== "on")
    return { error: "You must accept the terms and conditions to place your order." };

  const billingSameAsShipping = formData.get("billingSameAsShipping") === "on";
  if (!billingSameAsShipping) {
    const billingName = get(formData, "billingName").trim();
    const billingLine1 = get(formData, "billingLine1").trim();
    const billingCountry = get(formData, "billingCountry").trim();
    if (!billingName) return { error: "Please enter billing name." };
    if (!billingLine1) return { error: "Please enter billing address." };
    if (!billingCountry) return { error: "Please enter billing country." };
  }
  let shippingCents = 0;
  const shippingMethodId = get(formData, "shippingMethodId");
  if (settings.shippingEnabled && shippingMethodId) {
    const method = await prisma.shippingMethod.findUnique({
      where: { id: shippingMethodId },
    });
    if (method) shippingCents = method.priceCents;
  } else if (settings.shippingEnabled) {
    const defaultMethod = await prisma.shippingMethod.findFirst({
      where: { isDefault: true },
      orderBy: { sortOrder: "asc" },
    });
    if (defaultMethod) shippingCents = defaultMethod.priceCents;
  }

  const taxCents = Math.round(
    (subtotalCents + shippingCents) * (settings.taxRatePercent / 100)
  );
  const couponCodeRaw = get(formData, "couponCode").trim().toUpperCase();
  let discountCents = 0;
  if (couponCodeRaw && typeof prisma.coupon !== "undefined") {
    const coupon = await prisma.coupon.findUnique({
      where: { code: couponCodeRaw },
    });
    if (coupon && subtotalCents >= coupon.minOrderCents) {
      if (coupon.type === "FIXED" && coupon.valueCents != null)
        discountCents = Math.min(coupon.valueCents, subtotalCents);
      else if (coupon.type === "PERCENT" && coupon.valuePercent != null)
        discountCents = Math.round(subtotalCents * (coupon.valuePercent / 100));
    }
  }
  const totalCents = Math.max(0, subtotalCents + shippingCents + taxCents - discountCents);
  const currency = storeCurrency;

  const currentUser = await getCurrentUser();

  const order = await prisma.order.create({
    data: {
      userId: currentUser?.id ?? null,
      status: OrderStatus.PENDING,
      email,
      shippingName,
      shippingLine1,
      shippingLine2: get(formData, "shippingLine2")?.trim() || null,
      shippingCity,
      shippingState: get(formData, "shippingState")?.trim() || null,
      shippingPostalCode: get(formData, "shippingPostalCode")?.trim() || null,
      shippingCountry,
      billingSameAsShipping,
      billingName: billingSameAsShipping ? null : get(formData, "billingName")?.trim() || null,
      billingLine1: billingSameAsShipping ? null : get(formData, "billingLine1")?.trim() || null,
      billingLine2: billingSameAsShipping ? null : get(formData, "billingLine2")?.trim() || null,
      billingCity: billingSameAsShipping ? null : get(formData, "billingCity")?.trim() || null,
      billingState: billingSameAsShipping ? null : get(formData, "billingState")?.trim() || null,
      billingPostalCode: billingSameAsShipping ? null : get(formData, "billingPostalCode")?.trim() || null,
      billingCountry: billingSameAsShipping ? null : get(formData, "billingCountry")?.trim() || null,
      shippingMethodId: shippingMethodId || null,
      paymentMethod: get(formData, "paymentMethod") || "cod",
      subtotalCents,
      shippingCents,
      taxCents,
      discountCents,
      totalCents,
      currency,
      couponCode: couponCodeRaw || null,
      customerNote: get(formData, "customerNote")?.trim() || null,
    },
  });

  for (const item of cart.items) {
    const itemPriceCents = convertPriceCents(item.priceCents, item.currency ?? "USD", storeCurrency, rates);
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        title: item.title,
        slug: item.slug,
        priceCents: itemPriceCents,
        quantity: item.quantity,
        totalCents: itemPriceCents * item.quantity,
      },
    });
  }

  for (const item of cart.items) {
    await prisma.product.updateMany({
      where: { id: item.productId, stockQuantity: { not: null } },
      data: { stockQuantity: { decrement: item.quantity } },
    });
  }

  try {
    await sendOrderConfirmationEmail({
      orderId: order.id,
      email: order.email,
      currency: order.currency,
      subtotalCents: order.subtotalCents,
      shippingCents: order.shippingCents,
      taxCents: order.taxCents,
      totalCents: order.totalCents,
      shippingName: order.shippingName,
      shippingLine1: order.shippingLine1,
      shippingLine2: order.shippingLine2,
      shippingCity: order.shippingCity,
      shippingState: order.shippingState,
      shippingPostalCode: order.shippingPostalCode,
      shippingCountry: order.shippingCountry,
      discountCents: order.discountCents,
      items: cart.items.map((i) => {
        const itemCents = convertPriceCents(i.priceCents, i.currency ?? "USD", storeCurrency, rates);
        return {
          title: i.title,
          quantity: i.quantity,
          priceCents: itemCents,
          totalCents: itemCents * i.quantity,
        };
      }),
    });
  } catch {
    // Don't block order success if email fails
  }

  await clearCartCookie();
  redirect(`/checkout/confirmation?orderId=${order.id}`);
}
