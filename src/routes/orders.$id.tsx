import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldCheck, MessageSquare, AlertTriangle, Loader2, Calendar, Package, Star } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useOrder, useOrderHistory, useTransitionOrder, useTransitionBooking } from "@/hooks/use-orders";
import {
  allowedOrderTransitions, allowedBookingTransitions,
  STATUS_LABEL, BOOKING_STATUS_LABEL, statusToneClass, centsToDollars,
  type OrderStatus, type BookingStatus,
} from "@/lib/orders-db";
import { getOrCreateConversation } from "@/lib/messages-db";

export const Route = createFileRoute("/orders/$id")({
  ssr: false,
  head: () => ({ meta: [{ title: "Order — PlugU" }] }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const meId = session?.user?.id ?? null;
  const { data: order, isPending } = useOrder(id);
  const { data: history } = useOrderHistory(id);
  const transitionOrder = useTransitionOrder();
  const transitionBooking = useTransitionBooking();
  const [busy, setBusy] = useState<string | null>(null);

  if (isPending) {
    return (
      <AppShell title="ORDER">
        <div className="p-8 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin"/></div>
      </AppShell>
    );
  }
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

  const role: "buyer" | "seller" = meId === order.seller_user_id ? "seller" : "buyer";
  const isService = order.kind === "service";
  const nextOrderStates = isService ? [] : allowedOrderTransitions(order.status, role);
  const nextBookingStates = isService && order.booking ? allowedBookingTransitions(order.booking.status, role) : [];

  async function doOrderTransition(next: OrderStatus) {
    setBusy(next);
    try {
      await transitionOrder.mutateAsync({ id: order!.id, next });
      toast.success(`Order → ${STATUS_LABEL[next]}`);
    } catch (err) { toast.error("Couldn't update order", { description: (err as Error).message }); }
    finally { setBusy(null); }
  }
  async function doBookingTransition(next: BookingStatus) {
    if (!order?.booking) return;
    setBusy(next);
    try {
      await transitionBooking.mutateAsync({ id: order.booking.id, orderId: order.id, next });
      toast.success(`Booking → ${BOOKING_STATUS_LABEL[next]}`);
    } catch (err) { toast.error("Couldn't update booking", { description: (err as Error).message }); }
    finally { setBusy(null); }
  }
  async function openChat() {
    if (!order) return;
    try {
      const other = role === "seller" ? order.buyer_user_id : order.seller_user_id;
      const convId = await getOrCreateConversation(other, order.listing_id ?? undefined);
      navigate({ to: "/messages/$id", params: { id: convId } });
    } catch (err) { toast.error("Couldn't open chat", { description: (err as Error).message }); }
  }

  const currentLabel = isService && order.booking
    ? BOOKING_STATUS_LABEL[order.booking.status]
    : STATUS_LABEL[order.status];
  const currentTone = statusToneClass(isService && order.booking ? order.booking.status : order.status);

  return (
    <AppShell title="ORDER">
      <section className="px-5 pt-4 pb-8 slide-up">
        <Link to="/orders" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> All orders
        </Link>

        {/* Listing header */}
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            {order.listing?.image_url ? (
              <img src={order.listing.image_url} alt="" className="h-16 w-16 rounded-xl object-cover" />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-secondary grid place-items-center">
                {isService ? <Calendar className="h-6 w-6 text-muted-foreground"/> : <Package className="h-6 w-6 text-muted-foreground"/>}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{order.listing?.title ?? "Listing removed"}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {role === "seller" ? "Buyer: " : "Seller: "}
                {order.counterparty?.display_name ?? order.counterparty?.username ?? "PlugU user"}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${currentTone}`}>{currentLabel}</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{role}</span>
              </div>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>{centsToDollars(order.total_cents)}</span>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Order ID · <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span></p>
          {order.booking?.slot_start && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              Scheduled · {new Date(order.booking.slot_start).toLocaleString([], { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </p>
          )}
          {order.fulfillment_method && <p className="mt-1 text-[11px] text-muted-foreground">Fulfillment · {order.fulfillment_method}</p>}
          {order.meetup_location && <p className="mt-1 text-[11px] text-muted-foreground">Meetup · {order.meetup_location}</p>}
          {order.note && <p className="mt-1 text-[11px] text-muted-foreground">Note · {order.note}</p>}
        </div>

        {/* Financials */}
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 text-xs space-y-1.5">
          <Row label="Subtotal" value={centsToDollars(order.subtotal_cents)} />
          <Row label="Platform fee" value={centsToDollars(order.platform_fee_cents)} muted />
          <Row label="Processing" value={centsToDollars(order.processing_fee_cents)} muted />
          <Row label="Total" value={centsToDollars(order.total_cents)} bold />
          <p className="text-[10px] text-muted-foreground pt-1">Locked at checkout · Protected by PlugU</p>
        </div>

        {/* Timeline */}
        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
            border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
          }}
        >
          <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: "var(--plugu-gold)" }}>Timeline</p>
          <ol className="mt-2 space-y-2">
            {(history ?? []).map((t) => (
              <li key={t.id} className="flex gap-2 text-[11px]">
                <span className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: "var(--plugu-gold)" }} />
                <div>
                  <p className="text-foreground">
                    {t.from_status ? `${STATUS_LABEL[t.from_status as OrderStatus] ?? t.from_status} → ` : ""}
                    {STATUS_LABEL[t.to_status as OrderStatus] ?? t.to_status}
                  </p>
                  <p className="text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                  {t.note && <p className="text-muted-foreground italic">"{t.note}"</p>}
                </div>
              </li>
            ))}
            {(history?.length ?? 0) === 0 && (
              <li className="text-[11px] text-muted-foreground">Waiting for the seller to respond.</li>
            )}
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={openChat}
            className="tap py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold inline-flex items-center justify-center gap-2"
          >
            <MessageSquare className="h-3.5 w-3.5" /> {role === "seller" ? "Message buyer" : "Message seller"}
          </button>
          {role === "buyer" && !isService && (order.status === "pending" || order.status === "accepted" || order.status === "preparing") && (
            <Link
              to="/orders/$id/dispute"
              params={{ id: order.id }}
              className="tap py-2.5 rounded-2xl bg-secondary border border-border text-xs font-semibold inline-flex items-center justify-center gap-2 text-accent"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Open dispute
            </Link>
          )}
        </div>

        {(order.status === "completed" || order.booking?.status === "completed") && (
          <Link
            to="/orders/$id/review"
            params={{ id: order.id }}
            className="mt-3 tap w-full py-2.5 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-xs font-semibold inline-flex items-center justify-center gap-2"
          >
            <Star className="h-3.5 w-3.5" /> Leave a review
          </Link>
        )}

        {/* State machine buttons */}
        {(nextOrderStates.length > 0 || nextBookingStates.length > 0) && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] tracking-[0.24em] uppercase text-muted-foreground">Update status</p>
            <div className="flex flex-wrap gap-2">
              {nextOrderStates.map((s) => (
                <button
                  key={s}
                  disabled={busy === s}
                  onClick={() => doOrderTransition(s)}
                  className={`tap px-3.5 py-2 rounded-full text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                    s === "cancelled" || s === "disputed"
                      ? "border-border bg-card text-accent"
                      : "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                  }`}
                >
                  {busy === s ? "…" : STATUS_LABEL[s]}
                </button>
              ))}
              {nextBookingStates.map((s) => (
                <button
                  key={s}
                  disabled={busy === s}
                  onClick={() => doBookingTransition(s)}
                  className={`tap px-3.5 py-2 rounded-full text-[11px] font-semibold border transition-colors disabled:opacity-50 ${
                    s === "cancelled" || s === "declined" || s === "no_show"
                      ? "border-border bg-card text-accent"
                      : "bg-[image:var(--gradient-bronze)] text-primary-foreground border-primary"
                  }`}
                >
                  {busy === s ? "…" : BOOKING_STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className="mt-6 text-[10px] tracking-[0.25em] uppercase text-center text-muted-foreground inline-flex items-center gap-1 w-full justify-center">
          <ShieldCheck className="h-3 w-3" /> Protected by PlugU
        </p>
      </section>
    </AppShell>
  );
}

function Row({ label, value, muted, bold }: { label: string; value: string; muted?: boolean; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${muted ? "text-muted-foreground" : ""} ${bold ? "text-base font-semibold pt-1" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}