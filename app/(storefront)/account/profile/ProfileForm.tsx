"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "./actions";

export function ProfileForm({
  email,
  name,
  phone,
  preferencesJson,
}: {
  email: string;
  name: string;
  phone: string;
  preferencesJson: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<"success" | "error" | null>(null);

  return (
    <form
      action={async (formData) => {
        setMessage(null);
        const result = await updateProfileAction(formData);
        if (result?.error) {
          setMessage("error");
          return;
        }
        setMessage("success");
        router.refresh();
      }}
      className="mt-6 space-y-6 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6"
    >
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]/80">Email</label>
        <p className="mt-1 text-[var(--foreground)]/70">{email}</p>
        <p className="mt-0.5 text-xs text-[var(--foreground)]/50">Email cannot be changed yet.</p>
      </div>
      <label className="block">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Name</span>
        <input
          type="text"
          name="name"
          defaultValue={name}
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Phone</span>
        <input
          type="tel"
          name="phone"
          defaultValue={phone}
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
          placeholder="+1 234 567 890"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Preferences (JSON)</span>
        <textarea
          name="preferences"
          rows={6}
          defaultValue={preferencesJson}
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 font-mono text-sm"
          placeholder='{"recentlyViewedIds": []}'
        />
      </label>
      {message === "success" && (
        <p className="text-sm font-medium text-green-600">Profile updated.</p>
      )}
      {message === "error" && (
        <p className="text-sm font-medium text-red-600">Could not update. Check preferences JSON.</p>
      )}
      <button
        type="submit"
        className="rounded-lg bg-[var(--pink-500)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
      >
        Save changes
      </button>
    </form>
  );
}
