"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAddressAction } from "./actions";

export function AddAddressForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        setError(null);
        const result = await addAddressAction(formData);
        if (result?.error) {
          setError(result.error);
          return;
        }
        router.refresh();
      }}
      className="mt-4 grid gap-4 sm:grid-cols-2"
    >
      <label className="sm:col-span-2">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Label (e.g. Home, Office)</span>
        <input
          type="text"
          name="label"
          required
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
          placeholder="Home"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Address line 1</span>
        <input
          type="text"
          name="line1"
          required
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[var(--foreground)]/80">Address line 2</span>
        <input
          type="text"
          name="line2"
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[var(--foreground)]/80">City</span>
        <input
          type="text"
          name="city"
          required
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[var(--foreground)]/80">State / Province</span>
        <input
          type="text"
          name="state"
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label>
        <span className="text-sm font-medium text-[var(--foreground)]/80">Postal code</span>
        <input
          type="text"
          name="postalCode"
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label className="sm:col-span-2">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Country</span>
        <input
          type="text"
          name="country"
          required
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label className="flex items-center gap-2 sm:col-span-2">
        <input type="checkbox" name="isDefault" className="rounded border-[var(--pink-300)]" />
        <span className="text-sm text-[var(--foreground)]/80">Set as default address</span>
      </label>
      {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
      <button
        type="submit"
        className="rounded-lg bg-[var(--pink-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--pink-600)] sm:col-span-2"
      >
        Add address
      </button>
    </form>
  );
}
