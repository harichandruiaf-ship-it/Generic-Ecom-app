import { getCurrentUser } from "@/lib/customer-auth";
import { PreferencesForm } from "./PreferencesForm";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const prefs = user.preferences as Record<string, unknown> | null;
  const timezone = (prefs?.timezone as string) ?? "";
  const locale = (prefs?.locale as string) ?? "";
  const theme = (prefs?.theme as string) ?? "";
  const notifications = (prefs?.notifications as boolean | undefined) ?? true;

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">Preferences</h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        Location, notifications, and other account settings.
      </p>
      <PreferencesForm
        timezone={timezone}
        locale={locale}
        theme={theme}
        notifications={notifications}
      />
    </div>
  );
}
