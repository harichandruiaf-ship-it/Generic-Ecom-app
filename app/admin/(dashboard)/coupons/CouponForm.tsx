"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCouponAction, updateCouponAction } from "./actions";

type Coupon = {
  id: string;
  code: string;
  type: string;
  valuePercent: number | null;
  valueCents: number | null;
  minOrderCents: number;
} | null;

export function CouponForm({ coupon }: { coupon?: Coupon | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isEdit = !!coupon;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
      >
        {isEdit ? "Edit" : "Add coupon"}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-zinc-900">
              {isEdit ? "Edit coupon" : "New coupon"}
            </h2>
            <form
              action={async (formData) => {
                if (isEdit) {
                  formData.set("id", coupon.id);
                  await updateCouponAction(formData);
                } else {
                  await createCouponAction(formData);
                }
                router.refresh();
                setOpen(false);
              }}
              className="mt-4 space-y-4"
            >
              {isEdit && <input type="hidden" name="id" value={coupon.id} />}
              <div>
                <label className="block text-sm font-medium text-zinc-700">Code *</label>
                <input
                  type="text"
                  name="code"
                  required
                  defaultValue={coupon?.code}
                  placeholder="SAVE10"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono uppercase"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Type</label>
                <select
                  name="type"
                  defaultValue={coupon?.type ?? "FIXED"}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                >
                  <option value="FIXED">Fixed amount off</option>
                  <option value="PERCENT">Percent off</option>
                </select>
              </div>
              <div id="value-fixed">
                <label className="block text-sm font-medium text-zinc-700">Value (cents) – for Fixed</label>
                <input
                  type="number"
                  name="valueCents"
                  min={0}
                  defaultValue={coupon?.type === "FIXED" ? (coupon.valueCents ?? 0) : ""}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div id="value-percent">
                <label className="block text-sm font-medium text-zinc-700">Value (%) – for Percent</label>
                <input
                  type="number"
                  name="valuePercent"
                  min={1}
                  max={100}
                  defaultValue={coupon?.type === "PERCENT" ? (coupon.valuePercent ?? 10) : ""}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700">Minimum order (cents)</label>
                <input
                  type="number"
                  name="minOrderCents"
                  min={0}
                  defaultValue={coupon?.minOrderCents ?? 0}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
                />
              </div>
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
