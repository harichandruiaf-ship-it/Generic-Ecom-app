"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { submitReviewAction } from "@/app/(storefront)/products/[slug]/actions";

function Stars({ value, size = "md" }: { value: number; size?: "sm" | "md" }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const cls = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <span className="inline-flex text-amber-500" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: full }, (_, i) => (
        <span key={`f-${i}`} className={cls} aria-hidden>★</span>
      ))}
      {half ? <span className={`${cls} opacity-80`} aria-hidden>★</span> : null}
      {Array.from({ length: empty }, (_, i) => (
        <span key={`e-${i}`} className={`${cls} text-zinc-300`} aria-hidden>★</span>
      ))}
    </span>
  );
}

type Review = {
  id: string;
  authorName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
};

type ProductReviewsProps = {
  productId: string;
  productSlug: string;
  reviews: Review[];
  averageRating: number | null;
  isLoggedIn: boolean;
  userDisplayName?: string | null;
  userEmail?: string | null;
};

export function ProductReviews({
  productId,
  productSlug: _productSlug,
  reviews,
  averageRating,
  isLoggedIn,
}: ProductReviewsProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Scroll to reviews section when URL has #reviews (e.g. "Review again" / "Write a review" links)
  useEffect(() => {
    if (typeof window === "undefined" || !sectionRef.current) return;
    if (window.location.hash === "#reviews") {
      sectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div id="reviews" ref={sectionRef} className="scroll-mt-6 rounded-2xl border-2 border-[var(--pink-200)] bg-white p-6">
      <h2 className="text-lg font-semibold text-[var(--pink-600)]">Reviews</h2>

      {/* Write a review — only for logged-in users; shown first */}
      <div className="mt-4 border-b border-[var(--pink-200)] pb-6">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Write a review</h3>
        {isLoggedIn ? (
          <>
            <form
              className="mt-3 space-y-3"
              action={async (formData) => {
                if (rating < 1) {
                  setError("Please select a rating.");
                  return;
                }
                formData.set("productId", productId);
                formData.set("rating", String(rating));
                formData.set("comment", comment);
                setPending(true);
                setError(null);
                const result = await submitReviewAction(formData);
                setPending(false);
                if (result.error) setError(result.error);
                else {
                  setComment("");
                  setRating(0);
                  router.refresh();
                }
              }}
            >
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="rating" value={rating} />
              <div>
                <label className="block text-xs font-medium text-[var(--foreground)]/70">Rating *</label>
                <div className="mt-1 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className={`text-2xl transition ${rating >= n ? "text-amber-500" : "text-zinc-300 hover:text-amber-400"}`}
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {rating === 0 && (
                  <p className="mt-1 text-xs text-[var(--foreground)]/50">Select a rating</p>
                )}
              </div>
              <div>
                <label htmlFor="review-comment" className="block text-xs font-medium text-[var(--foreground)]/70">
                  Comment (optional)
                </label>
                <textarea
                  id="review-comment"
                  name="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-[var(--pink-200)] px-3 py-2 text-sm"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={pending || rating < 1}
                className="rounded-lg bg-[var(--pink-500)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--pink-600)] disabled:opacity-50"
              >
                {pending ? "Submitting…" : "Submit review"}
              </button>
            </form>
            <p className="mt-2 text-xs text-[var(--foreground)]/50">
              Your review will appear after it’s approved.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-[var(--foreground)]/60">
            Sign in to leave a review.
          </p>
        )}
      </div>

      {/* Existing reviews — below the write section */}
      {reviews.length > 0 ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            {averageRating != null && (
              <div className="flex items-center gap-2">
                <Stars value={averageRating} />
                <span className="text-sm font-medium text-[var(--foreground)]">
                  {averageRating.toFixed(1)}
                </span>
              </div>
            )}
            <span className="text-sm text-[var(--foreground)]/60">
              {reviews.length} review{reviews.length !== 1 ? "s" : ""}
            </span>
          </div>
          <ul className="mt-4 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="border-b border-[var(--pink-100)] pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} size="sm" />
                  <span className="font-medium text-[var(--foreground)]">{r.authorName}</span>
                  <span className="text-xs text-[var(--foreground)]/50" suppressHydrationWarning>
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      timeZone: "UTC",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-1 text-sm text-[var(--foreground)]/80">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--foreground)]/60">No reviews yet.</p>
      )}
    </div>
  );
}
