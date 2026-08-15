"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { logoutAction } from "@/app/(storefront)/auth/actions";

export function UserMenu({
  user,
  wishlistCount,
}: {
  user: { email: string; name: string | null };
  wishlistCount: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const initials = user.name
    ? user.name
        .trim()
        .split(/\s+/)
        .map((s) => s[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/40 bg-white/20 text-sm font-semibold text-white shadow-inner backdrop-blur transition hover:border-white/60 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-[var(--pink-200)] bg-white py-2 shadow-xl ring-1 ring-black/5"
          role="menu"
        >
          <div className="border-b border-[var(--pink-100)] px-4 py-3">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">
              {user.name || "Account"}
            </p>
            <p className="truncate text-xs text-[var(--foreground)]/60">{user.email}</p>
          </div>
          <div className="py-1">
            <Link
              href="/account"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]/90 transition hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="text-[var(--pink-500)]" aria-hidden>◇</span>
              Account overview
            </Link>
            <Link
              href="/account/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]/90 transition hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="text-[var(--pink-500)]" aria-hidden>👤</span>
              Profile & settings
            </Link>
            <Link
              href="/account/orders"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]/90 transition hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="text-[var(--pink-500)]" aria-hidden>📦</span>
              My orders
            </Link>
            <Link
              href="/account/wishlist"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--foreground)]/90 transition hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <span className="text-[var(--pink-500)]" aria-hidden>♥</span>
              Wishlist
              {wishlistCount > 0 && (
                <span className="ml-auto rounded-full bg-[var(--pink-200)] px-2 py-0.5 text-xs font-medium text-[var(--pink-700)]">
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
          <div className="border-t border-[var(--pink-100)] py-1">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[var(--pink-600)] transition hover:bg-[var(--pink-50)]"
                role="menuitem"
              >
                <span aria-hidden>⎋</span>
                Log out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
