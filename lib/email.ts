import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const fromEmail = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

export type OrderConfirmationPayload = {
  orderId: string;
  email: string;
  currency: string;
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents: number;
  totalCents: number;
  shippingName: string;
  shippingLine1: string;
  shippingLine2?: string | null;
  shippingCity: string;
  shippingState?: string | null;
  shippingPostalCode?: string | null;
  shippingCountry: string;
  items: { title: string; quantity: number; priceCents: number; totalCents: number }[];
};

function formatCents(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export async function sendOrderConfirmationEmail(payload: OrderConfirmationPayload): Promise<{ ok: boolean; error?: string }> {
  if (!resend) return { ok: true };

  const {
    orderId,
    email,
    currency,
    subtotalCents,
    shippingCents,
    taxCents,
    discountCents = 0,
    totalCents,
    shippingName,
    shippingLine1,
    shippingLine2,
    shippingCity,
    shippingState,
    shippingPostalCode,
    shippingCountry,
    items,
  } = payload;

  const reference = orderId.slice(-8).toUpperCase();
  const addressLines = [
    shippingName,
    shippingLine1,
    shippingLine2,
    [shippingCity, shippingState, shippingPostalCode].filter(Boolean).join(", "),
    shippingCountry,
  ].filter(Boolean);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Order confirmation</title></head>
<body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #333; max-width: 560px; margin: 0 auto; padding: 24px;">
  <h1 style="color: var(--pink-600, #be185d);">Thank you for your order</h1>
  <p>Your order has been received.</p>
  <p><strong>Order reference:</strong> ${reference}</p>
  <p><strong>Shipping address:</strong><br>${addressLines.join("<br>")}</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <thead>
      <tr style="border-bottom: 2px solid #fce7f3;">
        <th style="text-align: left; padding: 8px 0;">Item</th>
        <th style="text-align: right; padding: 8px 0;">Qty</th>
        <th style="text-align: right; padding: 8px 0;">Total</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((i) => `<tr style="border-bottom: 1px solid #fce7f3;"><td style="padding: 8px 0;">${escapeHtml(i.title)}</td><td style="text-align: right;">${i.quantity}</td><td style="text-align: right;">${formatCents(i.totalCents, currency)}</td></tr>`).join("")}
    </tbody>
  </table>
  <table style="width: 100%; margin-top: 12px;">
    <tr><td style="padding: 4px 0;">Subtotal</td><td style="text-align: right;">${formatCents(subtotalCents, currency)}</td></tr>
    ${shippingCents > 0 ? `<tr><td style="padding: 4px 0;">Shipping</td><td style="text-align: right;">${formatCents(shippingCents, currency)}</td></tr>` : ""}
    ${taxCents > 0 ? `<tr><td style="padding: 4px 0;">Tax</td><td style="text-align: right;">${formatCents(taxCents, currency)}</td></tr>` : ""}
    ${discountCents > 0 ? `<tr><td style="padding: 4px 0;">Discount</td><td style="text-align: right;">-${formatCents(discountCents, currency)}</td></tr>` : ""}
    <tr style="font-weight: bold; font-size: 1.1em;"><td style="padding: 8px 0;">Total</td><td style="text-align: right;">${formatCents(totalCents, currency)}</td></tr>
  </table>
  <p style="margin-top: 24px; color: #666;">We'll contact you at ${escapeHtml(email)} if we have any questions about your order.</p>
</body>
</html>
`;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Order confirmation – ${reference}`,
      html,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { ok: false, error: message };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
