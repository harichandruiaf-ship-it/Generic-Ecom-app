/**
 * Exchange rates for converting product prices (stored in any allowed currency)
 * to the store display currency. Uses live rates from the internet by default,
 * with optional admin override in Store settings.
 */

import { getPrisma } from "@/lib/prisma";
import { STORE_CURRENCY_CODES } from "@/lib/currencies";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const API_URL = "https://latest.currency-api.pages.dev/v1/currencies/usd.json";

let cachedRates: Record<string, number> | null = null;
let cacheExpiry = 0;

/** Fetch live rates from API (1 USD = X for each currency). Keys in response are lowercase. */
async function fetchLiveRates(): Promise<Record<string, number>> {
  const res = await fetch(API_URL, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error("Exchange rate API unavailable");
  const data = (await res.json()) as { usd?: Record<string, number> };
  const usd = data.usd ?? {};
  const rates: Record<string, number> = { USD: 1 };
  for (const code of STORE_CURRENCY_CODES) {
    if (code === "USD") continue;
    const v = usd[code.toLowerCase()];
    if (typeof v === "number" && Number.isFinite(v)) rates[code] = v;
  }
  return rates;
}

/**
 * Returns rates relative to USD (e.g. { USD: 1, INR: 91.94, EUR: 0.86 }).
 * Uses StoreSettings.exchangeRatesOverride if set, otherwise fetches from API (cached).
 */
export async function getExchangeRates(): Promise<Record<string, number>> {
  const prisma = getPrisma();
  if (prisma && typeof prisma.storeSettings !== "undefined") {
    const row = await prisma.storeSettings.findUnique({
      where: { id: "default" },
      select: { exchangeRatesOverride: true },
    });
    const override = row?.exchangeRatesOverride;
    if (override && typeof override === "object" && !Array.isArray(override)) {
      const rates: Record<string, number> = { USD: 1 };
      for (const code of STORE_CURRENCY_CODES) {
        const v = (override as Record<string, unknown>)[code];
        if (typeof v === "number" && Number.isFinite(v)) rates[code] = v;
      }
      if (Object.keys(rates).length > 1) return rates;
    }
  }

  const now = Date.now();
  if (cachedRates && now < cacheExpiry) return cachedRates;
  try {
    cachedRates = await fetchLiveRates();
    cacheExpiry = now + CACHE_TTL_MS;
    return cachedRates;
  } catch {
    cachedRates = Object.fromEntries(STORE_CURRENCY_CODES.map((c) => [c, c === "USD" ? 1 : 0]));
    for (const c of STORE_CURRENCY_CODES) {
      if (cachedRates[c] === 0) cachedRates[c] = 1;
    }
    cacheExpiry = now + 60 * 1000; // retry in 1 min
    return cachedRates;
  }
}

/**
 * Convert a price in cents from one currency to another using the given rates (USD-based).
 * Returns rounded integer cents in the target currency.
 */
export function convertPriceCents(
  priceCents: number,
  fromCurrency: string,
  toCurrency: string,
  rates: Record<string, number>
): number {
  if (fromCurrency === toCurrency) return priceCents;
  const fromRate = rates[fromCurrency.toUpperCase()] ?? 1;
  const toRate = rates[toCurrency.toUpperCase()] ?? 1;
  if (fromRate <= 0) return priceCents;
  const amount = (priceCents / 100) * (toRate / fromRate);
  return Math.round(amount * 100);
}

/**
 * Convert product price to store currency and return the result in cents.
 * Use this on the storefront when displaying prices.
 */
export async function toStoreCurrencyCents(
  priceCents: number,
  productCurrency: string,
  storeCurrency: string
): Promise<number> {
  const rates = await getExchangeRates();
  return convertPriceCents(priceCents, productCurrency, storeCurrency, rates);
}
