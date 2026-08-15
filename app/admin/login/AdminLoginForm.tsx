"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function AdminLoginForm() {
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-700"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          required
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
      >
        Sign in
      </button>
    </form>
  );
}
