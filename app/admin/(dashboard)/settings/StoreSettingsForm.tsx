"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateStoreSettingsAction, fetchAndSaveExchangeRatesAction, clearExchangeRatesOverrideAction } from "./actions";
import { STORE_CURRENCIES } from "@/lib/currencies";

type Settings = {
  id: string;
  cartEnabled: boolean;
  checkoutEnabled: boolean;
  taxRatePercent: number;
  currency: string;
  shippingEnabled: boolean;
  thankYouMessage: string | null;
  termsText: string | null;
  minimumOrderCents: number;
  lowStockThreshold?: number | null;
  themePalette?: string | null;
  /** From Prisma Json type; runtime-checked before use */
  exchangeRatesOverride?: unknown;
} | null;

const PALETTES = [
  { id: "pink", name: "Pink", desc: "Warm rose", bg: "#fef7f8", primary: "#c94c62" },
  { id: "blue", name: "Blue", desc: "Calm & trust", bg: "#f0f5fc", primary: "#3b6fb8" },
  { id: "green", name: "Green", desc: "Fresh & natural", bg: "#eef6ee", primary: "#3d8b3d" },
  { id: "slate", name: "Slate", desc: "Light elegant", bg: "#f0f2f4", primary: "#4d5d6f" },
  { id: "coral", name: "Coral", desc: "Warm peach", bg: "#fdf2ee", primary: "#c95a3d" },
  { id: "violet", name: "Violet", desc: "Soft creative", bg: "#f2eef8", primary: "#6f4ab0" },
] as const;

export function StoreSettingsForm({
  settings,
  themePalette = "pink",
}: {
  settings: Settings;
  themePalette?: string;
}) {
  const router = useRouter();
  const [selectedPalette, setSelectedPalette] = useState(themePalette);

  useEffect(() => {
    setSelectedPalette(themePalette);
  }, [themePalette]);

  return (
    <form
      action={async (formData) => {
        await updateStoreSettingsAction(formData);
        router.refresh();
      }}
      className="max-w-2xl space-y-8 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm"
    >
      <section className="rounded-xl border-2 border-amber-200 bg-amber-50/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-800">Theme & colour</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Choose a colour palette for the entire storefront. It updates header, buttons, cards, and accents in one go.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {PALETTES.map((p) => {
            const isSelected = selectedPalette === p.id;
            return (
              <label
                key={p.id}
                className={`flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-zinc-900 ring-2 ring-zinc-900 ring-offset-2 shadow-md"
                    : "border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                }`}
              >
                <input
                  type="radio"
                  name="themePalette"
                  value={p.id}
                  checked={isSelected}
                  onChange={() => setSelectedPalette(p.id)}
                  className="sr-only"
                />
                <div
                  className="h-14 w-full"
                  style={{ backgroundColor: p.bg }}
                />
                <div className="flex items-center gap-2 border-t border-zinc-100 p-3">
                  <span
                    className="h-5 w-5 shrink-0 rounded-full border border-zinc-200"
                    style={{ backgroundColor: p.primary }}
                  />
                  <div className="min-w-0">
                    <span className="block text-sm font-medium text-zinc-800">{p.name}</span>
                    <span className="block text-xs text-zinc-500">{p.desc}</span>
                  </div>
                  {isSelected && (
                    <span className="ml-auto text-sm font-medium text-zinc-600">Selected</span>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-6">
        <h2 className="text-lg font-semibold text-zinc-800">Exchange rates</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Product prices are stored in the currency you set when creating each product. They are converted to the store currency above using current rates. Use live rates from the internet, or save current rates as custom (e.g. to lock in values).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {settings?.exchangeRatesOverride && typeof settings.exchangeRatesOverride === "object" && !Array.isArray(settings.exchangeRatesOverride) && Object.keys(settings.exchangeRatesOverride as Record<string, unknown>).length > 1 ? (
            <>
              <span className="text-sm text-zinc-600">Using custom rates (saved).</span>
              <button
                type="button"
                onClick={async () => {
                  await clearExchangeRatesOverrideAction();
                  router.refresh();
                }}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Use live rates from internet again
              </button>
            </>
          ) : (
            <>
              <span className="text-sm text-zinc-600">Using live rates from the internet.</span>
              <button
                type="button"
                onClick={async () => {
                  await fetchAndSaveExchangeRatesAction();
                  router.refresh();
                }}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Fetch current rates & save as custom
              </button>
            </>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-zinc-800">Store behaviour</h2>
      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="cartEnabled"
            defaultChecked={settings?.cartEnabled ?? true}
            className="rounded border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700">Cart enabled</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="checkoutEnabled"
            defaultChecked={settings?.checkoutEnabled ?? true}
            className="rounded border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700">Checkout enabled</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="shippingEnabled"
            defaultChecked={settings?.shippingEnabled ?? true}
            className="rounded border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700">Shipping enabled</span>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-zinc-700">Currency</label>
          <select
            id="currency"
            name="currency"
            defaultValue={settings?.currency ?? "USD"}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-800"
          >
            {STORE_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-xs text-zinc-500">Used for cart, checkout, and orders across the store.</p>
        </div>
        <div>
          <label htmlFor="taxRatePercent" className="block text-sm font-medium text-zinc-700">Tax rate (%)</label>
          <input
            id="taxRatePercent"
            name="taxRatePercent"
            type="number"
            min={0}
            step={0.01}
            defaultValue={settings?.taxRatePercent ?? 0}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="minimumOrderCents" className="block text-sm font-medium text-zinc-700">Minimum order (cents)</label>
          <input
            id="minimumOrderCents"
            name="minimumOrderCents"
            type="number"
            min={0}
            defaultValue={settings?.minimumOrderCents ?? 0}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-zinc-700">Low stock threshold</label>
          <input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={settings?.lowStockThreshold ?? 5}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
          <p className="mt-1 text-xs text-zinc-500">Products with stock ≤ this are shown as &quot;Low stock&quot; in inventory. Used in Dashboard and Inventory.</p>
        </div>
      </div>

      <div>
        <label htmlFor="thankYouMessage" className="block text-sm font-medium text-zinc-700">Thank you message (order confirmation)</label>
        <textarea
          id="thankYouMessage"
          name="thankYouMessage"
          rows={2}
          defaultValue={settings?.thankYouMessage ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="termsText" className="block text-sm font-medium text-zinc-700">Terms and conditions (shown at checkout)</label>
        <textarea
          id="termsText"
          name="termsText"
          rows={3}
          defaultValue={settings?.termsText ?? ""}
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Save settings
        </button>
      </div>
      </section>
    </form>
  );
}
