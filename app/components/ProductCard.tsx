import Link from "next/link";
import { ProductImage } from "./ProductImage";

type ProductCardProps = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  priceCents: number;
  currency: string;
  /** Store currency from Admin settings – when set, prices display in this currency (e.g. INR). */
  displayCurrency?: string;
  images: unknown;
};

export function ProductCard({
  title,
  slug,
  description,
  priceCents,
  currency,
  displayCurrency,
  images,
}: ProductCardProps) {
  const imagesArr = Array.isArray(images) ? (images as string[]) : [];
  const first = imagesArr[0] ?? null;
  const currencyForDisplay = displayCurrency ?? currency;
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyForDisplay,
  }).format(priceCents / 100);

  return (
    <Link
      href={`/products/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border-2 border-[var(--pink-200)] bg-white transition duration-300 hover:-translate-y-1 hover:border-[var(--pink-400)] hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--pink-50)]">
        {first ? (
          <ProductImage
            src={first}
            alt={title}
            fill
            className="object-cover transition duration-500 ease-out group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-[var(--pink-400)]">
            No image
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h2 className="font-semibold tracking-tight text-[var(--foreground)] line-clamp-2 group-hover:text-[var(--pink-500)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-[var(--foreground)]/70">
            {description}
          </p>
        ) : null}
        <p className="mt-auto pt-3 text-base font-bold text-[var(--pink-500)]">
          {price}
        </p>
      </div>
    </Link>
  );
}
