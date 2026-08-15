"use client";

import { logoutAction } from "@/app/(storefront)/auth/actions";

export function AccountLogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[var(--pink-300)] bg-gradient-to-b from-[var(--pink-50)] to-white px-4 py-3 text-sm font-semibold text-[var(--pink-700)] shadow-sm transition hover:border-[var(--pink-400)] hover:from-[var(--pink-100)] hover:to-[var(--pink-50)] hover:shadow focus:outline-none focus:ring-2 focus:ring-[var(--pink-400)] focus:ring-offset-2"
      >
        <span aria-hidden>⎋</span>
        Log out
      </button>
    </form>
  );
}
