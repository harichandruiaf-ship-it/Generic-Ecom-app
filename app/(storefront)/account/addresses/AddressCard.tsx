"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "./actions";

type Address = {
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

export function AddressCard({ address }: { address: Address }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fullAddress = [
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <div className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--foreground)]">{address.label}</span>
            {address.isDefault && (
              <span className="rounded-full bg-[var(--pink-200)] px-2 py-0.5 text-xs font-medium text-[var(--pink-700)]">
                Default
              </span>
            )}
          </div>
          <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-[var(--foreground)]/80">
            {fullAddress}
          </pre>
        </div>
        <div className="flex shrink-0 gap-2">
          {!address.isDefault && (
            <form
              action={async () => {
                setError(null);
                await setDefaultAddressAction(address.id);
                router.refresh();
              }}
            >
              <button
                type="submit"
                className="text-sm font-medium text-[var(--pink-600)] hover:underline"
              >
                Set default
              </button>
            </form>
          )}
          <button
            type="button"
            onClick={() => setEditing((e) => !e)}
            className="text-sm font-medium text-[var(--foreground)]/70 hover:text-[var(--pink-600)]"
          >
            {editing ? "Cancel" : "Edit"}
          </button>
          <form
            action={async () => {
              if (confirm("Delete this address?")) {
                setError(null);
                await deleteAddressAction(address.id);
                router.refresh();
              }
            }}
          >
            <button type="submit" className="text-sm font-medium text-red-600 hover:underline">
              Delete
            </button>
          </form>
        </div>
      </div>

      {editing && (
        <form
          action={async (formData) => {
            setError(null);
            const result = await updateAddressAction(address.id, formData);
            if (result?.error) {
              setError(result.error);
              return;
            }
            setEditing(false);
            router.refresh();
          }}
          className="mt-4 grid gap-3 border-t border-[var(--pink-100)] pt-4 sm:grid-cols-2"
        >
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-[var(--foreground)]/80">Label</span>
            <input
              type="text"
              name="label"
              defaultValue={address.label}
              required
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-[var(--foreground)]/80">Address line 1</span>
            <input
              type="text"
              name="line1"
              defaultValue={address.line1}
              required
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--foreground)]/80">Line 2</span>
            <input
              type="text"
              name="line2"
              defaultValue={address.line2 ?? ""}
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--foreground)]/80">City</span>
            <input
              type="text"
              name="city"
              defaultValue={address.city}
              required
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--foreground)]/80">State</span>
            <input
              type="text"
              name="state"
              defaultValue={address.state ?? ""}
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
            />
          </label>
          <label>
            <span className="text-sm font-medium text-[var(--foreground)]/80">Postal code</span>
            <input
              type="text"
              name="postalCode"
              defaultValue={address.postalCode ?? ""}
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
            />
          </label>
          <label className="sm:col-span-2">
            <span className="text-sm font-medium text-[var(--foreground)]/80">Country</span>
            <input
              type="text"
              name="country"
              defaultValue={address.country}
              required
              className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={address.isDefault}
              className="rounded border-[var(--pink-300)]"
            />
            <span className="text-sm text-[var(--foreground)]/80">Default address</span>
          </label>
          {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
          <button
            type="submit"
            className="rounded-lg bg-[var(--pink-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--pink-600)] sm:col-span-2"
          >
            Save changes
          </button>
        </form>
      )}
    </div>
  );
}
