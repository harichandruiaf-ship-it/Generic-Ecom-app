import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/customer-auth";
import { RegisterForm } from "./RegisterForm";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/account");

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <nav className="mb-6 text-sm text-[var(--foreground)]/70">
        <Link href="/" className="transition hover:text-[var(--pink-500)]">Home</Link>
        <span className="mx-2">/</span>
        <span className="font-medium text-[var(--pink-600)]">Sign up</span>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">Create account</h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        Sign up to save your preferences, wishlist, and continue where you left off.
      </p>
      <RegisterForm />
      <p className="mt-6 text-center text-sm text-[var(--foreground)]/70">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-[var(--pink-500)] hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
