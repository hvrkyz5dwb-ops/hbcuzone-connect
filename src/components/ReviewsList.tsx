import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Star, ShieldCheck, Trash2, Loader2 } from "lucide-react";
import { ContentMenu } from "@/components/ContentMenu";
import { toast } from "sonner";
import { fetchReviewsForUser, adminDeleteReview, type VerifiedReview } from "@/lib/reviews-db";
import { ErrorState } from "@/components/QueryStates";

export function ReviewsList({ userId, isAdmin = false }: { userId: string; isAdmin?: boolean }) {
  const q = useQuery({
    queryKey: ["reviews", userId],
    queryFn: () => fetchReviewsForUser(userId),
    enabled: !!userId,
  });

  if (q.isPending) {
    return <div className="py-6 grid place-items-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/></div>;
  }
  if (q.isError) {
    return (
      <ErrorState
        title="Reviews didn't load"
        description="Check your connection and try again."
        onRetry={() => void q.refetch()}
      />
    );
  }
  const reviews = q.data ?? [];
  if (reviews.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-5 text-center text-xs text-muted-foreground">
        No reviews yet. Verified reviews appear here after a completed transaction.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {reviews.map((r) => (
        <ReviewCard key={r.id} review={r} isAdmin={isAdmin} onChanged={q.refetch} />
      ))}
    </div>
  );
}

function ReviewCard({ review, isAdmin, onChanged }: { review: VerifiedReview; isAdmin: boolean; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const label = review.verification_kind === "verified_booking" ? "Verified booking" : "Verified purchase";

  async function onDelete() {
    if (!window.confirm("Remove this review?")) return;
    setBusy(true);
    try { await adminDeleteReview(review.id); toast.success("Review removed"); onChanged(); }
    catch (err) { toast.error("Couldn't remove", { description: (err as Error).message }); }
    finally { setBusy(false); }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {[1,2,3,4,5].map((n) => (
            <Star key={n} className="h-4 w-4" style={{ color: n <= review.rating ? "var(--plugu-gold)" : "hsl(var(--muted-foreground))", fill: n <= review.rating ? "currentColor" : "transparent" }} />
          ))}
          <span className="ml-1 text-xs font-semibold">{review.rating}.0</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-muted-foreground">
          <ShieldCheck className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} /> {label}
        </span>
      </div>
      {review.body && <p className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">{review.body}</p>}
      <div className="mt-2 flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
        <div className="flex items-center gap-3">
          <ContentMenu
            targetType="review"
            targetId={review.id}
            targetLabel={review.body ?? `${review.rating}-star review`}
            authorUserId={review.reviewer_user_id}
          />
          {isAdmin && (
            <button onClick={onDelete} disabled={busy} className="tap inline-flex items-center gap-1 text-[10px] text-accent">
              <Trash2 className="h-3 w-3"/> Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}