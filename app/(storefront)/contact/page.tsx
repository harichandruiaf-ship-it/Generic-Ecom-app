import Link from "next/link";
import { getSiteProfile } from "@/lib/site-profile";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const profile = await getSiteProfile();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
        Contact us
      </h1>
      <p className="mt-2 text-[var(--foreground)]/70">
        Get in touch with {profile.siteName}.
      </p>

      <div className="mt-8 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--pink-600)]">
          Contact details
        </h2>
        <div className="mt-4 space-y-3">
          {profile.contactEmail ? (
            <p>
              <span className="text-[var(--foreground)]/60">Email: </span>
              <a
                href={`mailto:${profile.contactEmail}`}
                className="font-medium text-[var(--pink-500)] hover:underline"
              >
                {profile.contactEmail}
              </a>
            </p>
          ) : null}
          {profile.contactPhone ? (
            <p>
              <span className="text-[var(--foreground)]/60">Phone: </span>
              <a
                href={`tel:${profile.contactPhone.replace(/\s/g, "")}`}
                className="font-medium text-[var(--pink-500)] hover:underline"
              >
                {profile.contactPhone}
              </a>
            </p>
          ) : null}
          {!profile.contactEmail && !profile.contactPhone && (
            <p className="text-[var(--foreground)]/60">
              Contact details can be set in Admin → Company profile.
            </p>
          )}
        </div>

        {profile.contactPageContent && (
          <div
            className="mt-6 border-t border-[var(--pink-100)] pt-6 text-[var(--foreground)]/80"
            dangerouslySetInnerHTML={{ __html: profile.contactPageContent }}
          />
        )}
      </div>

      <p className="mt-8">
        <Link href="/" className="text-sm font-medium text-[var(--pink-500)] hover:underline">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
