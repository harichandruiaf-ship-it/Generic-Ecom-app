"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "../auth/actions";

export function LoginForm({ nextUrl }: { nextUrl?: string }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      action={async (formData) => {
        if (nextUrl) formData.set("next", nextUrl);
        setError(null);
        const result = await loginAction(formData);
        if (result?.error) setError(result.error);
      }}
      className="mt-6 space-y-4 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6"
    >
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <label className="block">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Email</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Password</span>
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-lg bg-[var(--pink-500)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
      >
        Log in
      </button>
      <p className="text-center text-sm text-[var(--foreground)]/60">
        <Link href="/" className="hover:underline">Back to store</Link>
      </p>
    </form>
  );
}
