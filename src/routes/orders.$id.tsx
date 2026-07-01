import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, MessageSquare, AlertTriangle, CheckCircle2, Star } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import {
  getOrder, markDelivered, canReview, submitReview,
  paymentLabel, type Order,
} from "@/lib/orders-storage";

export const Route = createFileRoute("/orders/$id")({
  head: () => ({ meta: [{ title: "Order — PlugU" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | undefined>(undefined);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState("");

  useEffect(() => { setOrder(getOrder(id)); }, [id]);

  if (!order) {
    return (
      <AppShell title="ORDER">
        <section className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">Order not found.</p>
          <Link to="/orders" className="mt-4 inline-block text-xs text-accent">← All orders</Link>
        </section>
      </AppShell>
    );
  }

  function confirmDelivery() {
    const next = markDelivered(order!.id);
    if (next) { setOrder(next); toast.success("Delivery confirmed", { description: "Funds released to seller." }); }
  }

  function postReview() {
    if (!order) return;
    const r = submitReview(order.id, rating, reviewBody || "Great seller.");
    if (r) {
      setOrder(getOrder(order.id));
      setReviewOpen(false);
      toast.success("Verified review posted");
    } else {
      toast.error("Reviews are only allowed for delivered orders.");
    }
  }

  return (
    <AppShell title="ORDER">
      <section className="px-5 pt-4 pb-8 slide-up">
        <Link to="/orders" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All orders
        </Link>

        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {order.image && <img src={order.image} alt="" className="h-16 w-16 rounded-xl object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{order.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">{order.seller} · {order.campus}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Paid via {paymentLabel(order.method)}</p>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>${order.total.toFixed(2)}</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Order ID · <span className="font-mono">{order.id}</span></p>
          {order.meetup && <p className="mt-1 text-[11px] text-muted-foreground">Meetup · {order.meetup}</p>}
          {order.note && <p className="mt-1 text-[11px] text-muted-foreground">Note · {order.note}</p>}
        </div>

        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
            border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
          }}
        >
          <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: "var(--plugu-gold)" }}>Timeline</p>
          <ol className="mt-2 space-y-2">
            {order.timeline.map((t, i) => (
              <li key={i} className="flex gap-2 text-[11px]">
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--plugu-gold)" }} />
                <div>
                  <p className="text-foreground">{t.label}</p>
                  <p className="text-muted-foreground">{new Date(t.at).toLocaleString()}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => navigate({ to: "/messages" })}
            className="tap py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Message seller
          </button>
          {order.status === "paid" || order.status === "in_progress" ? (
            <button
              onClick={confirmDelivery}
              className="tap py-2.5 rounded-2xl text-xs font-semibold text-primary-foreground inline-flex items-center justify-center gap-2"
              style={{ background: "var(--gradient-bronze)" }}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Confirm delivery
            </button>
          ) : canReview(order) ? (
            <button
              onClick={() => setReviewOpen(true)}
              className="tap py-2.5 rounded-2xl text-xs font-semibold text-primary-foreground inline-flex items-center justify-center gap-2"
              style={{ background: "var(--gradient-bronze)" }}
            >
              <Star className="h-3.5 w-3.5" /> Leave review
            </button>
          ) : (
            <Link
              to="/trust"
              className="tap py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold inline-flex items-center justify-center gap-2"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> Trust center
            </Link>
          )}
        </div>

        {(order.status === "paid" || order.status === "in_progress") && (
          <Link
            to="/orders/$id/dispute"
            params={{ id: order.id }}
            className="mt-2 tap w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold text-accent"
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Open a dispute
          </Link>
        )}

        {reviewOpen && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <p className="text-xs font-semibold">Verified purchase review</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} aria-label={`${n} stars`} className="tap">
                  <Star className={`h-6 w-6 ${n <= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <textarea
              value={reviewBody}
              onChange={(e) => setReviewBody(e.target.value)}
              rows={3}
              placeholder="How was it? Only verified buyers can review."
              className="mt-2 w-full bg-secondary rounded-xl p-3 text-sm outline-none border border-border"
            />
            <button
              onClick={postReview}
              className="mt-3 tap w-full py-2.5 rounded-2xl text-xs font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-bronze)" }}
            >
              Post verified review
            </button>
          </div>
        )}
      </section>
    </AppShell>
  );
}