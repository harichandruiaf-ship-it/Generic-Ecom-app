"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateCompanyProfileAction } from "./actions";
import type { SiteProfile } from "@/lib/site-profile";

const SOCIAL_KEYS = [
  { key: "facebook", label: "Facebook URL" },
  { key: "twitter", label: "Twitter / X URL" },
  { key: "instagram", label: "Instagram URL" },
  { key: "linkedin", label: "LinkedIn URL" },
  { key: "youtube", label: "YouTube URL" },
] as const;

export function CompanyProfileForm({ profile }: { profile: SiteProfile }) {
  const router = useRouter();
  const [navItems, setNavItems] = useState(profile.headerNavItems);
  const [logoUrl, setLogoUrl] = useState<string>(profile.logoUrl ?? "");
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const logoFileRef = useRef<HTMLInputElement>(null);

  const addNavItem = () => setNavItems((prev) => [...prev, { label: "", href: "" }]);
  const removeNavItem = (i: number) => setNavItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateNavItem = (i: number, field: "label" | "href", value: string) => {
    setNavItems((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  return (
    <form
      action={async (formData) => {
        formData.set("logoUrl", logoUrl);
        await updateCompanyProfileAction(formData);
        router.refresh();
      }}
      className="space-y-8"
    >
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Branding</h2>
        <p className="mt-1 text-sm text-zinc-500">Site name and logo shown in the header.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="siteName" className="block text-sm font-medium text-zinc-700">Site name</label>
            <input
              id="siteName"
              name="siteName"
              type="text"
              defaultValue={profile.siteName}
              placeholder="Ecom Store"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700">Logo image</label>
            <p className="mt-0.5 text-xs text-zinc-500">
              Upload an image (JPEG, PNG, WebP, GIF, max 5MB). Leave empty to use the default icon.
            </p>
            <input type="hidden" name="logoUrl" value={logoUrl} />
            <div className="mt-2 flex items-center gap-3">
              <input
                ref={logoFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setLogoUploadError(null);
                  setLogoUploading(true);
                  try {
                    const form = new FormData();
                    form.append("files", file);
                    form.append("folder", "logo");
                    const res = await fetch("/api/upload", { method: "POST", body: form });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Upload failed");
                    const url = data.urls?.[0];
                    if (url) setLogoUrl(url);
                  } catch (err) {
                    setLogoUploadError(err instanceof Error ? err.message : "Upload failed");
                  } finally {
                    setLogoUploading(false);
                    e.target.value = "";
                  }
                }}
              />
              <button
                type="button"
                onClick={() => logoFileRef.current?.click()}
                disabled={logoUploading}
                className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
              >
                {logoUploading ? "Uploading…" : "Upload logo"}
              </button>
            </div>
            {logoUploadError && (
              <p className="mt-2 text-sm text-red-600">{logoUploadError}</p>
            )}
            {logoUrl && (
              <div className="mt-3 flex items-center gap-2">
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-12 w-12 rounded border border-zinc-200 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="rounded p-1 text-sm text-zinc-500 hover:bg-zinc-100"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Contact (top bar &amp; contact page)</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contactEmail" className="block text-sm font-medium text-zinc-700">Email</label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              defaultValue={profile.contactEmail ?? ""}
              placeholder="hello@example.com"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="contactPhone" className="block text-sm font-medium text-zinc-700">Phone</label>
            <input
              id="contactPhone"
              name="contactPhone"
              type="text"
              defaultValue={profile.contactPhone ?? ""}
              placeholder="+1 234 567 890"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2">
          <input
            type="checkbox"
            name="showTopBar"
            defaultChecked={profile.showTopBar}
            className="rounded border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700">Show top bar (contact + social links)</span>
        </label>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Header navigation</h2>
        <p className="mt-1 text-sm text-zinc-500">Links shown in the main header. Add, remove, or reorder.</p>
        <div className="mt-4 space-y-3">
          {navItems.map((item, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                name={`navLabel_${i}`}
                value={item.label}
                onChange={(e) => updateNavItem(i, "label", e.target.value)}
                placeholder="Label"
                className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                name={`navHref_${i}`}
                value={item.href}
                onChange={(e) => updateNavItem(i, "href", e.target.value)}
                placeholder="/path or https://..."
                className="min-w-[180px] flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeNavItem(i)}
                className="rounded-lg border border-zinc-300 px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addNavItem}
            className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
          >
            + Add link
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Social media</h2>
        <p className="mt-1 text-sm text-zinc-500">Full URLs. Icons appear in the top bar and footer when set.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SOCIAL_KEYS.map(({ key, label }) => (
            <div key={key}>
              <label htmlFor={`social_${key}`} className="block text-sm font-medium text-zinc-700">{label}</label>
              <input
                id={`social_${key}`}
                name={`social_${key}`}
                type="url"
                defaultValue={profile.socialLinks[key as keyof typeof profile.socialLinks] ?? ""}
                placeholder="https://..."
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">About Us page</h2>
        <p className="mt-1 text-sm text-zinc-500">Content for the storefront About Us page. Plain text or HTML.</p>
        <textarea
          id="aboutUsContent"
          name="aboutUsContent"
          rows={8}
          defaultValue={profile.aboutUsContent ?? ""}
          placeholder="Tell your story, mission, team..."
          className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-sm"
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Contact page</h2>
        <p className="mt-1 text-sm text-zinc-500">Extra content below email/phone on the Contact page. Optional.</p>
        <textarea
          id="contactPageContent"
          name="contactPageContent"
          rows={4}
          defaultValue={profile.contactPageContent ?? ""}
          placeholder="Opening hours, address, or a short message..."
          className="mt-3 w-full rounded-lg border border-zinc-300 px-3 py-2"
        />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-800">Footer</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="footerTagline" className="block text-sm font-medium text-zinc-700">Tagline</label>
            <input
              id="footerTagline"
              name="footerTagline"
              type="text"
              defaultValue={profile.footerTagline ?? ""}
              placeholder="Curated products, simple shopping."
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
          <div>
            <label htmlFor="footerCopyright" className="block text-sm font-medium text-zinc-700">Copyright text</label>
            <input
              id="footerCopyright"
              name="footerCopyright"
              type="text"
              defaultValue={profile.footerCopyright ?? ""}
              placeholder="© 2025 Your Company. All rights reserved. (leave empty for default)"
              className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800"
        >
          Save company profile
        </button>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
        >
          View storefront →
        </a>
      </div>
    </form>
  );
}
