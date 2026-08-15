"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createShippingMethodAction, updateShippingMethodAction } from "./actions";

type Method = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  isDefault: boolean;
  sortOrder: number;
} | null;

export function ShippingMethodForm({ method }: { method?: Method | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = !!method;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        {isEdit ? "Edit" : "Add method"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-900">
              {isEdit ? "Edit shipping method" : "New shipping method"}
            </h2>
            <form
              action={async (formData) => {
                if (isEdit) {
                  formData.set("id", method.id);
                  await updateShippingMethodAction(formData);
                } else {
                  await createShippingMethodAction(formData);
                }
                router.refresh();
                setOpen(false);
              }}
              className="mt-4 space-y-4"
            >
              {isEdit && <input type="hidden" name="id" value={method.id} />}
              <div>
                <label className="block text-sm font-medium text-zinc-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  defaultValue={method?.name}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Description</label>
                <input
                  type="text"
                  name="description"
                  defaultValue={method?.description ?? ""}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Price (cents)</label>
                <input
                  type="number"
                  name="priceCents"
                  min={0}
                  defaultValue={method?.priceCents ?? 0}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Sort order</label>
                <input
                  type="number"
                  name="sortOrder"
                  defaultValue={method?.sortOrder ?? 0}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isDefault"
                  defaultChecked={method?.isDefault ?? false}
                  className="rounded border-zinc-300"
                />
                <span className="text-sm text-zinc-700">Default method</span>
              </label>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
                >
                  {isEdit ? "Save" : "Create"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
