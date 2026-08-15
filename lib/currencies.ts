/**
 * Supported store currencies. Used in admin Store settings and validated on save.
 * Add more entries here to expose them in the currency dropdown.
 */
export const STORE_CURRENCIES = [
  { code: "USD", name: "US Dollar (USD)" },
  { code: "EUR", name: "Euro (EUR)" },
  { code: "GBP", name: "British Pound (GBP)" },
  { code: "INR", name: "Indian Rupee (INR)" },
  { code: "JPY", name: "Japanese Yen (JPY)" },
  { code: "CAD", name: "Canadian Dollar (CAD)" },
  { code: "AUD", name: "Australian Dollar (AUD)" },
  { code: "CHF", name: "Swiss Franc (CHF)" },
  { code: "CNY", name: "Chinese Yuan (CNY)" },
  { code: "SGD", name: "Singapore Dollar (SGD)" },
  { code: "AED", name: "UAE Dirham (AED)" },
  { code: "MXN", name: "Mexican Peso (MXN)" },
  { code: "BRL", name: "Brazilian Real (BRL)" },
  { code: "ZAR", name: "South African Rand (ZAR)" },
] as const;

export const STORE_CURRENCY_CODES = STORE_CURRENCIES.map((c) => c.code);

export function isAllowedStoreCurrency(code: string): code is (typeof STORE_CURRENCY_CODES)[number] {
  return STORE_CURRENCY_CODES.includes(code as (typeof STORE_CURRENCY_CODES)[number]);
}
