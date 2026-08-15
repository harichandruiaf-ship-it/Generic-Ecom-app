import Link from "next/link";
import { getCurrentUser } from "@/lib/customer-auth";
import { getPrisma } from "@/lib/prisma";
import { AddAddressForm } from "./AddAddressForm";
import { AddressCard } from "./AddressCard";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userAddress === "undefined") {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">Addresses</h1>
        <p className="mt-2 text-[var(--foreground)]/70">Addresses are not available.</p>
      </div>
    );
  }

  const addresses = await prisma.userAddress.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-[var(--pink-600)]">Addresses</h1>
      <p className="mt-2 text-sm text-[var(--foreground)]/70">
        Manage your saved addresses for checkout and delivery.
      </p>

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">Add new address</h2>
          <AddAddressForm />
        </section>

        {addresses.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-[var(--pink-200)] bg-[var(--pink-50)]/30 p-8 text-center text-sm text-[var(--foreground)]/70">
            No addresses yet. Add one above.
          </p>
        ) : (
          <ul className="space-y-4">
            {addresses.map((addr) => (
              <li key={addr.id}>
                <AddressCard address={addr} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
