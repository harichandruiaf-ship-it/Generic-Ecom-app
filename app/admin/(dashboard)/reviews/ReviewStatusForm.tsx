"use client";

import { useRouter } from "next/navigation";
import { updateReviewStatusAction } from "./actions";

type Props = { reviewId: string; currentStatus: string; revalidateUserId?: string };

export function ReviewStatusForm({ reviewId, currentStatus, revalidateUserId }: Props) {
  const router = useRouter();

  return (
    <div className="flex justify-end gap-1">
      {currentStatus !== "APPROVED" && (
        <form
          action={async (fd) => {
            fd.set("reviewId", reviewId);
            fd.set("status", "APPROVED");
            if (revalidateUserId) fd.set("revalidateUserId", revalidateUserId);
            await updateReviewStatusAction(fd);
            router.refresh();
          }}
        >
          <button
            type="submit"
            className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-700"
          >
            Approve
          </button>
        </form>
      )}
      {currentStatus !== "REJECTED" && (
        <form
          action={async (fd) => {
            fd.set("reviewId", reviewId);
            fd.set("status", "REJECTED");
            if (revalidateUserId) fd.set("revalidateUserId", revalidateUserId);
            await updateReviewStatusAction(fd);
            router.refresh();
          }}
        >
          <button
            type="submit"
            className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white hover:bg-red-700"
          >
            Reject
          </button>
        </form>
      )}
    </div>
  );
}
