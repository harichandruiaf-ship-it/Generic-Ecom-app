"use client";

import { useRouter } from "next/navigation";
import { logoutAction } from "./actions";

export function AdminLogoutButton() {
  const router = useRouter();
  return (
    <form
      action={async () => {
        await logoutAction();
        router.push("/admin/login");
        router.refresh();
      }}
      className="mt-1"
    >
      <button
        type="submit"
        className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-[var(--foreground)]/70 hover:bg-[var(--pink-50)] hover:text-[var(--pink-600)]"
      >
        Log out
      </button>
    </form>
  );
}
