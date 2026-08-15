import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { AdminLoginForm } from "./AdminLoginForm";

export default async function AdminLoginPage() {
  if (await isAdmin()) {
    redirect("/admin");
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--pink-50)] px-4">
      <div className="w-full max-w-sm rounded-2xl border-2 border-[var(--pink-200)] bg-white p-8 shadow-lg">
        <h1 className="text-xl font-semibold tracking-tight text-[var(--pink-600)]">
          Admin login
        </h1>
        <p className="mt-1 text-sm text-[var(--foreground)]/70">
          Sign in to manage products, categories, tags, and banners.
        </p>
        <AdminLoginForm />
      </div>
      <Link
        href="/"
        className="mt-6 text-sm font-medium text-[var(--pink-500)] hover:text-[var(--pink-600)]"
      >
        ← Back to store
      </Link>
    </div>
  );
}
