"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ProductImage } from "@/app/components/ProductImage";
import { placeOrderAction, validateCouponAction } from "./actions";
import type { Cart } from "@/lib/cart";

type Settings = {
  taxRatePercent: number;
  currency: string;
  shippingEnabled: boolean;
  minimumOrderCents: number;
} | null;

type ShippingMethod = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isDefault: boolean;
};

type SavedAddress = {
  id: string;
  label: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string | null;
  country: string;
  isDefault: boolean;
};

export function CheckoutForm({
  cart,
  subtotalCents,
  currency,
  settings,
  shippingMethods,
  termsText,
  defaultEmail,
  defaultShippingName,
  defaultAddress,
  savedAddresses = [],
}: {
  cart: Cart;
  subtotalCents: number;
  currency: string;
  settings: Settings;
  shippingMethods: ShippingMethod[];
  termsText?: string;
  defaultEmail?: string;
  defaultShippingName?: string;
  defaultAddress?: SavedAddress | null;
  savedAddresses?: SavedAddress[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [billingSame, setBillingSame] = useState(true);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [appliedDiscountCents, setAppliedDiscountCents] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(defaultAddress?.id ?? "");
  const [termsOpen, setTermsOpen] = useState(false);
  const [acceptTermsChecked, setAcceptTermsChecked] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const fillShippingFromAddress = useCallback((addr: SavedAddress | null) => {
    const form = formRef.current;
    if (!form) return;
    const set = (name: string, value: string) => {
      const el = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
      if (el) el.value = value;
    };
    if (addr) {
      set("shippingLine1", addr.line1);
      set("shippingLine2", addr.line2 ?? "");
      set("shippingCity", addr.city);
      set("shippingState", addr.state ?? "");
      set("shippingPostalCode", addr.postalCode ?? "");
      set("shippingCountry", addr.country);
    }
  }, []);

  const clearShippingFields = useCallback(() => {
    const form = formRef.current;
    if (!form) return;
    const set = (name: string, value: string) => {
      const el = form.querySelector<HTMLInputElement>(`[name="${name}"]`);
      if (el) el.value = value;
    };
    set("shippingLine1", "");
    set("shippingLine2", "");
    set("shippingCity", "");
    set("shippingState", "");
    set("shippingPostalCode", "");
    set("shippingCountry", "");
  }, []);

  const handleAddressSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value;
      setSelectedAddressId(value);
      if (value === "") {
        clearShippingFields();
        return;
      }
      const addr = savedAddresses.find((a) => a.id === value);
      if (addr) fillShippingFromAddress(addr);
    },
    [savedAddresses, fillShippingFromAddress, clearShippingFields]
  );

  const defaultShippingId = shippingMethods.find((m) => m.isDefault)?.id ?? shippingMethods[0]?.id;
  const [shippingId, setShippingId] = useState<string | null>(defaultShippingId);

  const shippingCents =
    settings?.shippingEnabled && shippingId
      ? shippingMethods.find((m) => m.id === shippingId)?.priceCents ?? 0
      : 0;
  const taxCents = Math.round(
    (subtotalCents + shippingCents) * ((settings?.taxRatePercent ?? 0) / 100)
  );
  const totalCents = Math.max(0, subtotalCents + shippingCents + taxCents - appliedDiscountCents);

  async function handleApplyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) return;
    setApplyingCoupon(true);
    setCouponError(null);
    const result = await validateCouponAction(code, subtotalCents);
    setApplyingCoupon(false);
    if (result.error) {
      setCouponError(result.error);
      setAppliedCode(null);
      setAppliedDiscountCents(0);
      return;
    }
    setAppliedCode(code);
    setAppliedDiscountCents(result.discountCents ?? 0);
  }

  const format = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("billingSameAsShipping", billingSame ? "on" : "off");
    if (shippingId) formData.set("shippingMethodId", shippingId);
    if (appliedCode) formData.set("couponCode", appliedCode);
    const result = await placeOrderAction(formData);
    setPending(false);
    if (result?.error) setError(result.error);
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="mt-8 flex flex-col gap-8 lg:flex-row">
      <div className="flex-1 space-y-8">
        {error && (
          <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--pink-600)]">Contact</h2>
          <label className="mt-4 block">
            <span className="text-sm font-medium text-[var(--foreground)]/80">Email *</span>
            <input
              type="email"
              name="email"
              required
              defaultValue={defaultEmail}
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>
        </section>

        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--pink-600)]">Shipping address</h2>
          {savedAddresses.length > 0 && (
            <label className="mt-4 block">
              <span className="text-sm font-medium text-[var(--foreground)]/80">Use a saved address</span>
              <select
                value={selectedAddressId}
                onChange={handleAddressSelect}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-[var(--foreground)]"
              >
                <option value="">Enter new address</option>
                {savedAddresses.map((addr) => (
                  <option key={addr.id} value={addr.id}>
                    {addr.label}
                    {addr.isDefault ? " (default)" : ""} — {addr.line1}, {addr.city}
                  </option>
                ))}
              </select>
            </label>
          )}
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--foreground)]/80">Full name *</span>
              <input
                type="text"
                name="shippingName"
                required
                defaultValue={defaultShippingName}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--foreground)]/80">Address line 1 *</span>
              <input
                type="text"
                name="shippingLine1"
                required
                defaultValue={defaultAddress?.line1}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
              />
            </label>
            <label className="sm:col-span-2">
              <span className="text-sm font-medium text-[var(--foreground)]/80">Address line 2</span>
              <input
                type="text"
                name="shippingLine2"
                defaultValue={defaultAddress?.line2 ?? ""}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--foreground)]/80">City *</span>
              <input
                type="text"
                name="shippingCity"
                required
                defaultValue={defaultAddress?.city}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--foreground)]/80">State / Province</span>
              <input
                type="text"
                name="shippingState"
                defaultValue={defaultAddress?.state ?? ""}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--foreground)]/80">Postal code</span>
              <input
                type="text"
                name="shippingPostalCode"
                defaultValue={defaultAddress?.postalCode ?? ""}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
              />
            </label>
            <label>
              <span className="text-sm font-medium text-[var(--foreground)]/80">Country *</span>
              <input
                type="text"
                name="shippingCountry"
                required
                defaultValue={defaultAddress?.country}
                className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={billingSame}
              onChange={(e) => setBillingSame(e.target.checked)}
            />
            <span className="text-sm font-medium">Billing same as shipping</span>
          </label>
          {!billingSame && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-[var(--foreground)]/80">Billing name *</span>
                <input type="text" name="billingName" className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2" />
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-[var(--foreground)]/80">Billing address *</span>
                <input type="text" name="billingLine1" className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2" />
              </label>
              <label><span className="text-sm font-medium text-[var(--foreground)]/80">City</span><input type="text" name="billingCity" className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2" /></label>
              <label><span className="text-sm font-medium text-[var(--foreground)]/80">Country</span><input type="text" name="billingCountry" className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2" /></label>
            </div>
          )}
        </section>

        {settings?.shippingEnabled && shippingMethods.length > 0 && (
          <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
            <h2 className="text-lg font-semibold text-[var(--pink-600)]">Shipping method</h2>
            <ul className="mt-4 space-y-2">
              {shippingMethods.map((m) => (
                <li key={m.id}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-[var(--pink-200)] p-3">
                    <input
                      type="radio"
                      name="shippingMethodId"
                      value={m.id}
                      checked={shippingId === m.id}
                      onChange={() => setShippingId(m.id)}
                    />
                    <span className="font-medium">{m.name}</span>
                    {m.description && <span className="text-sm text-[var(--foreground)]/60">({m.description})</span>}
                    <span className="ml-auto font-medium">{format(m.priceCents)}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        )}

        <input type="hidden" name="paymentMethod" value="cod" />

        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--pink-600)]">Discount code</h2>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value); setCouponError(null); }}
              placeholder="Enter code"
              className="rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 font-mono uppercase text-[var(--foreground)]"
            />
            <button
              type="button"
              onClick={handleApplyCoupon}
              disabled={applyingCoupon || !couponCode.trim()}
              className="rounded-lg border-2 border-[var(--pink-300)] px-4 py-2 text-sm font-medium text-[var(--pink-600)] hover:bg-[var(--pink-50)] disabled:opacity-50"
            >
              {applyingCoupon ? "Applying…" : "Apply"}
            </button>
          </div>
          {appliedCode && appliedDiscountCents > 0 && (
            <p className="mt-2 text-sm text-green-600">Code {appliedCode} applied. You save {format(appliedDiscountCents)}.</p>
          )}
          {couponError && <p className="mt-2 text-sm text-red-600">{couponError}</p>}
        </section>

        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <label className="block">
            <span className="text-sm font-medium text-[var(--foreground)]/80">Order note (optional)</span>
            <textarea name="customerNote" rows={2} className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2" />
          </label>
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">Terms and conditions</h3>
            {termsText ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setTermsOpen(true);
                    setAcceptTermsChecked(true);
                  }}
                  className="mt-2 text-sm font-medium text-[var(--pink-600)] underline hover:no-underline"
                >
                  View terms and conditions
                </button>
                <label className="mt-4 flex items-start gap-2">
                  <input
                    type="checkbox"
                    name="acceptTerms"
                    required
                    checked={acceptTermsChecked}
                    onChange={(e) => setAcceptTermsChecked(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-[var(--foreground)]/80">I have read and agree to the terms and conditions.</span>
                </label>
                {termsOpen && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="terms-title"
                  >
                    <div className="max-h-[85vh] w-full max-w-lg rounded-2xl border-2 border-[var(--pink-200)] bg-white shadow-xl">
                      <div className="flex items-center justify-between border-b border-[var(--pink-100)] px-4 py-3">
                        <h2 id="terms-title" className="text-lg font-semibold text-[var(--pink-600)]">Terms and conditions</h2>
                        <button
                          type="button"
                          onClick={() => setTermsOpen(false)}
                          className="rounded-lg p-1 text-[var(--foreground)]/70 hover:bg-[var(--pink-100)] hover:text-[var(--foreground)]"
                          aria-label="Close"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="max-h-[60vh] overflow-y-auto p-4 text-sm text-[var(--foreground)]/90 whitespace-pre-wrap">
                        {termsText}
                      </div>
                      <div className="border-t border-[var(--pink-100)] px-4 py-3">
                        <button
                          type="button"
                          onClick={() => setTermsOpen(false)}
                          className="w-full rounded-lg bg-[var(--pink-500)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--pink-600)]"
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <label className="mt-4 flex items-start gap-2">
                <input type="checkbox" name="acceptTerms" required className="mt-0.5" />
                <span className="text-sm text-[var(--foreground)]/80">I agree to the terms and conditions.</span>
              </label>
            )}
          </div>
        </section>
      </div>

      <div className="lg:w-96">
        <div className="sticky top-24 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--pink-600)]">Order summary</h2>
          <ul className="mt-4 max-h-60 space-y-3 overflow-y-auto">
            {cart.items.map((item) => (
              <li key={item.productId} className="flex gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[var(--pink-50)]">
                  {item.image ? (
                    <ProductImage src={item.image} alt={item.title} fill className="object-cover" sizes="56px" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--pink-400)]">—</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-[var(--foreground)]/60">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-medium">{format(item.priceCents * item.quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-[var(--pink-100)] pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-[var(--foreground)]/70">Subtotal</dt>
              <dd>{format(subtotalCents)}</dd>
            </div>
            {settings?.shippingEnabled && (
              <div className="flex justify-between">
                <dt className="text-[var(--foreground)]/70">Shipping</dt>
                <dd>{format(shippingCents)}</dd>
              </div>
            )}
            {(settings?.taxRatePercent ?? 0) > 0 && (
              <div className="flex justify-between">
                <dt className="text-[var(--foreground)]/70">Tax</dt>
                <dd>{format(taxCents)}</dd>
              </div>
            )}
            {appliedDiscountCents > 0 && (
              <div className="flex justify-between text-green-600">
                <dt>Discount</dt>
                <dd>-{format(appliedDiscountCents)}</dd>
              </div>
            )}
            <div className="flex justify-between font-semibold text-[var(--pink-600)]">
              <dt>Total</dt>
              <dd>{format(totalCents)}</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-[var(--foreground)]/60">
            Payment: Pay on delivery (COD)
          </p>
          <button
            type="submit"
            disabled={pending}
            className="mt-6 w-full rounded-lg bg-[var(--pink-500)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)] disabled:opacity-50"
          >
            {pending ? "Placing order…" : "Place order"}
          </button>
          <Link href="/cart" className="mt-4 block text-center text-sm text-[var(--pink-500)] hover:underline">
            Back to cart
          </Link>
        </div>
      </div>
    </form>
  );
}
