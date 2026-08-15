import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, ProductStatus } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function slugify(input: string) {
  return String(input)
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  await prisma.storeSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      cartEnabled: true,
      checkoutEnabled: true,
      taxRatePercent: 0,
      currency: "USD",
      shippingEnabled: true,
      thankYouMessage: "Thank you for your order! We'll send you an email confirmation shortly.",
      termsText: "By placing an order you agree to our terms and conditions.",
      minimumOrderCents: 0,
    },
  });

  const existingShipping = await prisma.shippingMethod.findFirst();
  if (!existingShipping) {
    await prisma.shippingMethod.create({
      data: {
        name: "Standard Shipping",
        description: "Delivery in 5-7 business days",
        priceCents: 599,
        isDefault: true,
        sortOrder: 0,
      },
    });
  }

  const demoCategory = await prisma.category.upsert({
    where: { slug: "demo" },
    update: { name: "Demo" },
    create: { name: "Demo", slug: "demo" },
  });

  const newArrivalTag = await prisma.tag.upsert({
    where: { slug: "new-arrival" },
    update: { name: "New arrival" },
    create: { name: "New arrival", slug: "new-arrival" },
  });

  const products = [
    {
      title: "Everyday Backpack",
      description:
        "A clean, minimal backpack that works for office, travel, or daily carry.",
      priceCents: 3999,
      currency: "USD",
      images: [
        "https://images.unsplash.com/photo-1526481280695-3c687fd5432c?auto=format&fit=crop&w=1200&q=80",
      ],
      attributes: { material: "nylon", capacityLiters: 20 },
    },
    {
      title: "Ceramic Coffee Mug",
      description:
        "A sturdy mug with a comfortable handle. Dishwasher safe and office-friendly.",
      priceCents: 1499,
      currency: "USD",
      images: [
        "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=1200&q=80",
      ],
      attributes: { volumeMl: 350, color: "white" },
    },
    {
      title: "Wireless Headphones",
      description:
        "Lightweight over-ear headphones with a balanced sound profile for everyday listening.",
      priceCents: 8999,
      currency: "USD",
      images: [
        "https://images.unsplash.com/photo-1518441902117-f0a3a5b5f2e8?auto=format&fit=crop&w=1200&q=80",
      ],
      attributes: { batteryHours: 30, noiseCancelling: false },
    },
  ];

  for (const p of products) {
    const slug = slugify(p.title);

    const product = await prisma.product.upsert({
      where: { slug },
      update: {
        title: p.title,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        status: ProductStatus.ACTIVE,
        images: p.images,
        attributes: p.attributes,
      },
      create: {
        title: p.title,
        slug,
        description: p.description,
        priceCents: p.priceCents,
        currency: p.currency,
        status: ProductStatus.ACTIVE,
        images: p.images,
        attributes: p.attributes,
        categories: {
          create: [{ category: { connect: { id: demoCategory.id } } }],
        },
        tags: {
          create: [{ tag: { connect: { id: newArrivalTag.id } } }],
        },
      },
    });

    await prisma.productCategory.upsert({
      where: {
        productId_categoryId: {
          productId: product.id,
          categoryId: demoCategory.id,
        },
      },
      update: {},
      create: { productId: product.id, categoryId: demoCategory.id },
    });

    await prisma.productTag.upsert({
      where: {
        productId_tagId: { productId: product.id, tagId: newArrivalTag.id },
      },
      update: {},
      create: { productId: product.id, tagId: newArrivalTag.id },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
