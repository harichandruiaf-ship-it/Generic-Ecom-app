import Link from "next/link";
import Image from "next/image";
import { HeaderSearchBar } from "./HeaderSearchBar";
import { UserMenu } from "./UserMenu";
import type { SiteProfile } from "@/lib/site-profile";

export function Header({
  profile,
  cartCount = 0,
  cartEnabled = true,
  user = null,
  wishlistCount = 0,
}: {
  profile: SiteProfile;
  cartCount?: number;
  cartEnabled?: boolean;
  user?: { email: string; name: string | null } | null;
  wishlistCount?: number;
}) {
  const hasContact = profile.contactEmail || profile.contactPhone;
  const hasSocial = Object.values(profile.socialLinks).some(Boolean);

  return (
    <>
      {/* Top info bar */}
      {profile.showTopBar && (hasContact || hasSocial) && (
        <div className="border-b border-[var(--pink-400)]/30 bg-[var(--pink-500)]">
          <div className="flex w-full items-center justify-between pl-2 pr-4 py-2 text-sm text-white/95 sm:pl-4 sm:pr-6 lg:pl-6 lg:pr-8">
            <div className="flex items-center gap-6">
              {profile.contactEmail && (
                <a
                  href={`mailto:${profile.contactEmail}`}
                  className="flex items-center gap-1.5 transition hover:text-white"
                >
                  <span className="text-[var(--accent)]" aria-hidden>✉</span>
                  {profile.contactEmail}
                </a>
              )}
              {profile.contactPhone && (
                <a
                  href={`tel:${profile.contactPhone.replace(/\s/g, "")}`}
                  className="hidden items-center gap-1.5 sm:flex transition hover:text-white"
                >
                  <span className="text-[var(--accent)]" aria-hidden>📞</span>
                  {profile.contactPhone}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              {profile.socialLinks.facebook && (
                <a href={profile.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-white/80 transition hover:text-white" aria-label="Facebook">f</a>
              )}
              {profile.socialLinks.twitter && (
                <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-white/80 transition hover:text-white" aria-label="Twitter">𝕏</a>
              )}
              {profile.socialLinks.instagram && (
                <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-white/80 transition hover:text-white" aria-label="Instagram">📷</a>
              )}
              {profile.socialLinks.linkedin && (
                <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/80 transition hover:text-white" aria-label="LinkedIn">in</a>
              )}
              {profile.socialLinks.youtube && (
                <a href={profile.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-white/80 transition hover:text-white" aria-label="YouTube">▶</a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main header / nav */}
      <header className="sticky top-0 z-50 border-b border-[var(--pink-400)]/40 bg-[var(--pink-500)]/98 backdrop-blur transition-shadow duration-300 supports-[backdrop-filter]:bg-[var(--pink-500)]/95">
        <div className="flex h-16 w-full items-center justify-between pl-2 pr-4 sm:pl-4 sm:pr-6 lg:pl-6 lg:pr-8">
          {/* Left: logo + company name only */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 text-xl font-bold uppercase tracking-wider text-white transition duration-200 hover:opacity-90"
          >
            {profile.logoUrl ? (
              <span className="relative flex h-9 w-9 overflow-hidden rounded-lg bg-[var(--accent)]">
                <Image src={profile.logoUrl} alt="" fill className="object-cover" sizes="36px" unoptimized />
              </span>
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--pink-600)]" aria-hidden>
                🛍
              </span>
            )}
            <span className="hidden sm:inline">{profile.siteName}</span>
          </Link>

          {/* Right: search, nav, user, cart */}
          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6 min-w-0">
            <HeaderSearchBar />
            <nav className="flex shrink-0 items-center gap-4 sm:gap-6" aria-label="Main">
              {profile.headerNavItems.map((item) => (
                <Link
                  key={`${item.label}-${item.href}`}
                  href={item.href}
                  className="text-sm font-medium uppercase tracking-wide text-white/95 transition duration-200 hover:scale-105 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <UserMenu user={user} wishlistCount={wishlistCount} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium uppercase tracking-wide text-white/95 transition duration-200 hover:scale-105 hover:text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium uppercase tracking-wide text-white/95 transition duration-200 hover:scale-105 hover:text-white"
                  >
                    Sign up
                  </Link>
                </>
              )}
              {cartEnabled && (
                <Link
                  href="/cart"
                  className="flex items-center gap-1 text-white/90 transition duration-200 hover:scale-105 hover:text-white"
                  aria-label={`Cart (${cartCount} products)`}
                >
                  <span className="text-lg">🛒</span>
                  <span className="text-xs font-medium">{cartCount}</span>
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
