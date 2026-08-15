"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updatePreferencesAction } from "./actions";

export function PreferencesForm({
  timezone: initialTimezone,
  locale: initialLocale,
  theme: initialTheme,
  notifications: initialNotifications,
}: {
  timezone: string;
  locale: string;
  theme: string;
  notifications: boolean;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<"success" | "error" | null>(null);

  return (
    <form
      action={async (formData) => {
        setMessage(null);
        const result = await updatePreferencesAction(formData);
        if (result?.error) {
          setMessage("error");
          return;
        }
        setMessage("success");
        router.refresh();
      }}
      className="mt-8 space-y-6 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6"
    >
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]/80">Timezone</label>
        <input
          type="text"
          name="timezone"
          defaultValue={initialTimezone}
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
          placeholder="e.g. America/New_York"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]/80">Locale</label>
        <input
          type="text"
          name="locale"
          defaultValue={initialLocale}
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
          placeholder="e.g. en-US"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--foreground)]/80">Theme</label>
        <select
          name="theme"
          defaultValue={initialTheme || "system"}
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          name="notifications"
          defaultChecked={initialNotifications}
          value="on"
          className="rounded border-[var(--pink-300)]"
        />
        <span className="text-sm text-[var(--foreground)]/80">Email notifications (order updates, etc.)</span>
      </label>
      {message === "success" && (
        <p className="text-sm font-medium text-green-600">Preferences saved.</p>
      )}
      {message === "error" && (
        <p className="text-sm font-medium text-red-600">Could not save preferences.</p>
      )}
      <button
        type="submit"
        className="rounded-lg bg-[var(--pink-500)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--pink-600)]"
      >
        Save preferences
      </button>
    </form>
  );
}
