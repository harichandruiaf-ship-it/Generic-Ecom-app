import Image from "next/image";

/**
 * Use plain <img> for same-origin paths (e.g. /uploads/...) so they always load.
 * Use next/image for remote URLs (optimization + allowed hosts).
 */
export function ProductImage({
  src,
  alt,
  fill,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const isLocal = src.startsWith("/");

  if (isLocal) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        style={
          fill
            ? {
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }
            : undefined
        }
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
    />
  );
}
