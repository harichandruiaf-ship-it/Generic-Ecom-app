"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/customer-auth";

function get(formData: FormData, key: string): string {
  return (formData.get(key) as string) ?? "";
}

export async function addAddressAction(formData: FormData): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userAddress === "undefined") return { error: "Not available." };

  const label = get(formData, "label").trim();
  const line1 = get(formData, "line1").trim();
  const city = get(formData, "city").trim();
  const country = get(formData, "country").trim();
  if (!label) return { error: "Label is required (e.g. Home, Office)." };
  if (!line1) return { error: "Address line 1 is required." };
  if (!city) return { error: "City is required." };
  if (!country) return { error: "Country is required." };

  const isDefault = formData.get("isDefault") === "on";
  const count = await prisma.userAddress.count({ where: { userId: user.id } });

  if (isDefault && count > 0) {
    await prisma.userAddress.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  await prisma.userAddress.create({
    data: {
      userId: user.id,
      label,
      line1,
      line2: get(formData, "line2").trim() || null,
      city,
      state: get(formData, "state").trim() || null,
      postalCode: get(formData, "postalCode").trim() || null,
      country,
      isDefault: isDefault || count === 0,
    },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return {};
}

export async function updateAddressAction(
  addressId: string,
  formData: FormData
): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userAddress === "undefined") return { error: "Not available." };

  const existing = await prisma.userAddress.findFirst({
    where: { id: addressId, userId: user.id },
  });
  if (!existing) return { error: "Address not found." };

  const label = get(formData, "label").trim();
  const line1 = get(formData, "line1").trim();
  const city = get(formData, "city").trim();
  const country = get(formData, "country").trim();
  if (!label) return { error: "Label is required." };
  if (!line1) return { error: "Address line 1 is required." };
  if (!city) return { error: "City is required." };
  if (!country) return { error: "Country is required." };

  const isDefault = formData.get("isDefault") === "on";

  await prisma.userAddress.update({
    where: { id: addressId },
    data: {
      label,
      line1,
      line2: get(formData, "line2").trim() || null,
      city,
      state: get(formData, "state").trim() || null,
      postalCode: get(formData, "postalCode").trim() || null,
      country,
      isDefault,
    },
  });

  if (isDefault) {
    await prisma.userAddress.updateMany({
      where: { userId: user.id, id: { not: addressId } },
      data: { isDefault: false },
    });
  }

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return {};
}

export async function deleteAddressAction(addressId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userAddress === "undefined") return { error: "Not available." };

  await prisma.userAddress.deleteMany({
    where: { id: addressId, userId: user.id },
  });

  revalidatePath("/account/addresses");
  revalidatePath("/account");
  return {};
}

export async function setDefaultAddressAction(addressId: string): Promise<{ error?: string }> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const prisma = getPrisma();
  if (!prisma || typeof prisma.userAddress === "undefined") return { error: "Not available." };

  await prisma.userAddress.updateMany({
    where: { userId: user.id },
    data: { isDefault: false },
  });
  await prisma.userAddress.updateMany({
    where: { id: addressId, userId: user.id },
    data: { isDefault: true },
  });

  revalidatePath("/account/addresses");
  return {};
}
