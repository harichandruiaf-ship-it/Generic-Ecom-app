import { getSiteProfile } from "@/lib/site-profile";
import { CompanyProfileForm } from "./CompanyProfileForm";

export const dynamic = "force-dynamic";

export default async function AdminCompanyProfilePage() {
  const profile = await getSiteProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Company profile
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Site name, logo, contact details, header navigation, social links, About Us, Contact page, and footer. Changes apply across the storefront.
        </p>
      </div>
      <CompanyProfileForm profile={profile} />
    </div>
  );
}
