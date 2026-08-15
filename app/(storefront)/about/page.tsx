import { getSiteProfile } from "@/lib/site-profile";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const profile = await getSiteProfile();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-[var(--pink-600)]">
        About {profile.siteName}
      </h1>
      <div className="mt-8">
        {profile.aboutUsContent ? (
          <div
            className="prose prose-pink max-w-none text-[var(--foreground)]/90 prose-headings:text-[var(--pink-600)] prose-a:text-[var(--pink-500)]"
            dangerouslySetInnerHTML={{ __html: profile.aboutUsContent }}
          />
        ) : (
          <p className="text-[var(--foreground)]/70">
            Content for this page can be set in Admin → Company profile → About Us page.
          </p>
        )}
      </div>
    </div>
  );
}
