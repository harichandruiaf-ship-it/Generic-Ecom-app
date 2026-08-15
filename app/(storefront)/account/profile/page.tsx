import { getCurrentUser } from "@/lib/customer-auth";
import { ProfileForm } from "./ProfileForm";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">
        Profile & preferences
      </h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        Update your name and store preferences. Preferences are stored as JSON (e.g. for future features like recently viewed).
      </p>
      <ProfileForm
        email={user.email}
        name={user.name ?? ""}
        phone={user.phone ?? ""}
        preferencesJson={
          user.preferences != null
            ? JSON.stringify(user.preferences, null, 2)
            : "{}"
        }
      />
    </div>
  );
}
