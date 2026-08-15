"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function OrderLookupForm({
  initialEmail,
  initialRef,
}: {
  initialEmail: string;
  initialRef: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [ref, setRef] = useState(initialRef);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (email.trim()) params.set("email", email.trim());
    if (ref.trim()) params.set("ref", ref.trim());
    router.push(`/order-lookup?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 text-[var(--foreground)]"
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-[var(--foreground)]/80">Order reference</span>
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          required
          placeholder="e.g. 8 characters from your confirmation"
          className="mt-1 w-full rounded-lg border-2 border-[var(--pink-200)] px-3 py-2 font-mono text-[var(--foreground)]"
          maxLength={20}
        />
      </label>
      <button
        type="submit"
        className="rounded-lg bg-[var(--pink-500)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--pink-600)]"
      >
        Look up order
      </button>
    </form>
  );
}
