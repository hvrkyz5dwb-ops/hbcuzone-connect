import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Loader2, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useOrder } from "@/hooks/use-orders";
import { fetchReviewForOrder, submitReview } from "@/lib/reviews-db";

export const Route = createFileRoute("/orders/$id/review")({
  ssr: false,
  head: () => ({ meta: [{ title: "Leave a review — PlugU" }] }),
  beforeLoad: async ({ params }) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth", search: { next: `/orders/${params.id}/review`, mode: "" } });
  },
  component: ReviewPage,
});

function ReviewPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const meId = session?.user?.id ?? null;
  const { data: order, isPending } = useOrder(id);

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!meId) return;
    fetchReviewForOrder(id, meId).then((r) => {
      if (r) {
        setExistingId(r.id);
        setRating(r.rating);
        setBody(r.body ?? "");
      }
    }).catch(() => {});
  }, [id, meId]);

  if (isPending) {
    return <AppShell title="REVIEW"><div className="p-8 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin"/></div></AppShell>;
  }
  if (!order) {
    return <AppShell title="REVIEW"><section className="p-6 text-center text-sm text-muted-foreground">Order not found.</section></AppShell>;
  }

  const role: "buyer" | "seller" = meId === order.seller_user_id ? "seller" : "buyer";
  const isCompleted = order.kind === "service"
    ? order.booking?.status === "completed" || order.status === "completed"
    : order.status === "completed";
  const subjectUserId = role === "buyer" ? order.seller_user_id : order.buyer_user_id;
  const canReview = isCompleted && meId && subjectUserId && meId !== subjectUserId;
  const verificationLabel = order.kind === "service" ? "Verified booking" : "Verified purchase";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canReview) return;
    setBusy(true);
    try {
      await submitReview({ orderId: order!.id, subjectUserId: subjectUserId!, rating, body });
      toast.success(existingId ? "Review updated" : "Thanks for the review");
      navigate({ to: "/orders/$id", params: { id: order!.id } });
    } catch (err) { toast.error("Couldn't submit", { description: (err as Error).message }); }
    finally { setBusy(false); }
  }

  return (
    <AppShell title="REVIEW">
      <section className="px-5 pt-4 pb-8 slide-up">
        <Link to="/orders/$id" params={{ id }} className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to order
        </Link>

        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: "var(--plugu-gold)" }}>{verificationLabel}</p>
          <p className="mt-1 text-sm font-semibold truncate">{order.listing?.title ?? "Listing"}</p>
          <p className="text-[11px] text-muted-foreground">
            Reviewing {role === "buyer" ? "seller" : "buyer"}: {order.counterparty?.display_name ?? order.counterparty?.username ?? "PlugU user"}
          </p>
        </div>

        {!canReview ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-center text-sm text-muted-foreground">
            Reviews unlock once this order is marked <span className="text-foreground font-semibold">completed</span>.
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Star rating</p>
              <div className="mt-2 flex items-center gap-1">
                {[1,2,3,4,5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(n)}
                    className="tap p-1"
                    aria-label={`${n} star${n>1?"s":""}`}
                  >
                    <Star
                      className={`h-8 w-8 ${((hover||rating)>=n) ? "fill-current" : ""}`}
                      style={{ color: (hover||rating) >= n ? "var(--plugu-gold)" : "hsl(var(--muted-foreground))" }}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm font-semibold">{rating}.0</span>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <label className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Your review</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={1000}
                rows={5}
                placeholder="Was it as described? On time? Would you plug this again?"
                className="mt-2 w-full rounded-xl bg-background border border-border p-3 text-sm outline-none focus:border-primary"
              />
              <p className="mt-1 text-[10px] text-muted-foreground text-right">{body.length}/1000</p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="tap w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-semibold disabled:opacity-60"
            >
              {busy ? "Saving…" : existingId ? "Update review" : "Post review"}
            </button>

            <p className="text-[10px] tracking-[0.25em] uppercase text-center text-muted-foreground inline-flex items-center gap-1 w-full justify-center">
              <ShieldCheck className="h-3 w-3" /> Only completed orders can be reviewed
            </p>
          </form>
        )}
      </section>
    </AppShell>
  );
}