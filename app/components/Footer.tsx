import Link from "next/link";
import type { SiteProfile } from "@/lib/site-profile";

export function Footer({ profile }: { profile: SiteProfile }) {
  const year = new Date().getFullYear();
  const copyrightText =
    profile.footerCopyright ||
    `© ${year} ${profile.siteName}. All rights reserved.`;

  return (
    <footer className="mt-auto border-t border-[var(--pink-200)] bg-[var(--pink-100)]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pink-600)]">
              Shop
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/products"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/tags"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  Tags
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pink-600)]">
              Help
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/order-lookup"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  Order lookup
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  Account
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--pink-600)]">
              Company
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm text-[var(--foreground)]/80 transition duration-200 hover:text-[var(--pink-500)]"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-[var(--pink-600)]">{profile.siteName}</p>
            {profile.footerTagline && (
              <p className="mt-2 max-w-xs text-sm text-[var(--foreground)]/70">
                {profile.footerTagline}
              </p>
            )}
            <div className="mt-3 flex gap-3">
              {profile.socialLinks.facebook && (
                <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--pink-500)]" aria-label="Facebook">f</a>
              )}
              {profile.socialLinks.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--pink-500)]" aria-label="Twitter">𝕏</a>
              )}
              {profile.socialLinks.instagram && (
                <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--pink-500)]" aria-label="Instagram">📷</a>
              )}
              {profile.socialLinks.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--pink-500)]" aria-label="LinkedIn">in</a>
              )}
              {profile.socialLinks.youtube && (
                <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--pink-500)]" aria-label="YouTube">▶</a>
              )}
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-[var(--pink-200)] pt-8 text-center text-sm text-[var(--foreground)]/60" suppressHydrationWarning>
          {copyrightText}
        </div>
      </div>
    </footer>
  );
}
