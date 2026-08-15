import { requirePrisma } from "@/lib/prisma";
import { StoreSettingsForm } from "./StoreSettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const prisma = requirePrisma();
  if (typeof prisma.storeSettings === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Store settings</h1>
        <p className="mt-2 text-zinc-500">Run migrations to enable store settings.</p>
      </div>
    );
  }

  const settings = await prisma.storeSettings.findUnique({
    where: { id: "default" },
  });

  const themePalette = settings?.themePalette ?? "pink";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Store settings
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Control theme, cart, checkout, tax, and messaging. Changes apply immediately on the storefront.
        </p>
      </div>
      <StoreSettingsForm settings={settings} themePalette={themePalette} />
    </div>
  );
}
