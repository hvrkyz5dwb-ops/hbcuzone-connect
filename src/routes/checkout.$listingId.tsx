import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft, ShieldCheck, Lock, CreditCard, Smartphone, DollarSign, Loader2,
  BadgeCheck, RefreshCw, MessageSquare, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { fetchListing } from "@/lib/listings-db";
import { getOrCreateConversation } from "@/lib/messages-db";
import { formatPrice, type PriceType } from "@/lib/categories";
import { createOrder, paymentLabel, type PaymentMethod } from "@/lib/orders-storage";
import { currentFeePercent, currentSellerTierMeta } from "@/lib/seller-plan";

export const Route = createFileRoute("/checkout/$listingId")({
  head: () => ({ meta: [{ title: "Protected Checkout — PlugU" }] }),
  component: ProtectedCheckout,
});

const METHODS: { key: PaymentMethod; label: string; sub: string; Icon: typeof CreditCard }[] = [
  { key: "apple_pay", label: "Apple Pay", sub: "Face ID · Instant", Icon: Smartphone },
  { key: "cash_app", label: "Cash App Pay", sub: "Pay with $cashtag", Icon: DollarSign },
  { key: "card", label: "Debit / Credit Card", sub: "Visa · Mastercard · Amex", Icon: CreditCard },
];

function ProtectedCheckout() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const { data: listing, isPending } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => fetchListing(listingId),
  });
  const price = useMemo(() => (listing ? listing.price_cents / 100 : 0), [listing]);
  const feePercent = currentFeePercent();
  const fee = +(price * (feePercent / 100)).toFixed(2);
  const total = +(price + fee).toFixed(2);
  const [method, setMethod] = useState<PaymentMethod>("apple_pay");
  const [meetup, setMeetup] = useState("Student Center · Today 5pm");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);
  const tier = currentSellerTierMeta();

  if (isPending) {
    return (
      <AppShell title="CHECKOUT">
        <div className="p-8 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      </AppShell>
    );
  }

  if (!listing) {
    return (
      <AppShell title="CHECKOUT">
        <section className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">This listing is no longer available.</p>
          <Link to="/market" className="mt-4 inline-block text-xs text-accent">← Back to market</Link>
        </section>
      </AppShell>
    );
  }

  const cover = listing.images[0]?.url ?? "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600";
  const sellerName = listing.campus_name ?? "PlugU seller";
  const campusName = listing.campus_name ?? "";

  function placeOrder() {
    if (!listing) return;
    setLoading(true);
    setTimeout(() => {
      const order = createOrder({
        listingId: listing.id,
        title: listing.title,
        image: cover,
        price,
        seller: sellerName,
        campus: campusName,
        method,
        note: note || undefined,
        meetup: meetup || undefined,
        feePercent,
      });
      setPlaced(order.id);
      toast.success("Payment held in escrow", { description: `Order ${order.id} · ${paymentLabel(method)}` });
      setLoading(false);
    }, 700);
  }

  if (placed) {
    return (
      <AppShell title="ORDER CONFIRMED">
        <section className="px-5 pt-8 text-center slide-up">
          <div
            className="mx-auto h-16 w-16 grid place-items-center rounded-full"
            style={{
              background: "radial-gradient(circle at 30% 25%, #1c1c1c 0%, #0a0a0a 60%, #000 100%)",
              border: "1px solid color-mix(in oklab, var(--plugu-gold) 55%, transparent)",
              boxShadow: "0 0 40px -10px rgba(244,201,106,0.55)",
            }}
          >
            <ShieldCheck className="h-7 w-7" style={{ color: "var(--plugu-gold)" }} />
          </div>
          <p className="mt-4 text-[10px] tracking-[0.32em] uppercase text-muted-foreground">Protected by PlugU</p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">Order confirmed</h1>
          <p className="mt-2 text-xs text-muted-foreground">Funds held safely until you confirm delivery.</p>

          <div className="mt-6 mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-3">
              <img src={cover} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{listing.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{sellerName} · {campusName}</p>
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>${total.toFixed(2)}</span>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">Order ID · <span className="font-mono">{placed}</span></p>
          </div>

          <div className="mt-6 flex flex-col gap-2 mx-auto max-w-sm px-5">
            <button
              onClick={async () => {
                try {
                  const convId = await getOrCreateConversation(listing.seller_user_id, listing.id);
                  navigate({ to: "/messages/$id", params: { id: convId } });
                } catch (err) {
                  toast.error("Couldn't open chat", { description: (err as Error).message });
                }
              }}
              className="tap w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium text-sm inline-flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" /> Message {sellerName}
            </button>
            <Link
              to="/orders/$id"
              params={{ id: placed }}
              className="tap w-full py-3 rounded-2xl bg-secondary border border-border text-xs font-semibold text-center"
            >
              View order & timeline
            </Link>
            <Link to="/orders" className="mt-1 text-[11px] text-muted-foreground text-center">All orders →</Link>
          </div>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="CHECKOUT">
      <section className="px-5 pt-4 pb-6 slide-up">
        <Link to="/market" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to market
        </Link>

        {/* Order summary */}
        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <img src={cover} alt={listing.title} className="h-16 w-16 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{listing.title}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {sellerName} · {campusName}
              </p>
              <p className="text-[11px] text-primary mt-0.5">{formatPrice(listing.price_cents, listing.price_type as PriceType)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 text-xs space-y-1.5">
            <Row label="Item" value={`$${price.toFixed(2)}`} />
            <Row label={`PlugU fee (${feePercent}% · ${tier.name})`} value={`$${fee.toFixed(2)}`} muted />
            <Row label="Total" value={`$${total.toFixed(2)}`} bold />
          </div>
        </div>

        {/* Protected by PlugU */}
        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
            border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
          }}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
            <p className="text-xs font-semibold tracking-wide" style={{ color: "var(--plugu-gold)" }}>
              Protected by PlugU
            </p>
          </div>
          <ul className="mt-2.5 space-y-1.5 text-[11px] text-muted-foreground">
            <li className="flex items-center gap-2"><BadgeCheck className="h-3.5 w-3.5 text-accent" /> Verified student seller</li>
            <li className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 text-accent" /> Funds held in escrow until you confirm</li>
            <li className="flex items-center gap-2"><RefreshCw className="h-3.5 w-3.5 text-accent" /> 48-hour refund window after delivery</li>
          </ul>
        </div>

        {/* Payment methods */}
        <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground px-1">Payment</p>
        <div className="mt-2 space-y-2">
          {METHODS.map((m) => {
            const Icon = m.Icon;
            const active = method === m.key;
            return (
              <button
                key={m.key}
                onClick={() => setMethod(m.key)}
                className={`tap w-full flex items-center gap-3 p-3.5 rounded-2xl border transition-colors ${
                  active ? "border-accent bg-secondary" : "border-border bg-card"
                }`}
              >
                <div
                  className="h-10 w-10 grid place-items-center rounded-xl"
                  style={{
                    background: "linear-gradient(160deg, #1c1c1c, #0f0f0f)",
                    border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
                  }}
                >
                  <Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-semibold">{m.label}</p>
                  <p className="text-[11px] text-muted-foreground">{m.sub}</p>
                </div>
                <span
                  aria-hidden
                  className={`h-4 w-4 rounded-full border ${active ? "border-accent" : "border-border"}`}
                  style={active ? { background: "var(--plugu-gold)" } : {}}
                />
              </button>
            );
          })}
        </div>

        {/* Meetup */}
        <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground px-1">Meetup & notes</p>
        <div className="mt-2 rounded-2xl border border-border bg-card p-3 space-y-2">
          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" /> Meetup spot / drop-off
          </label>
          <input
            value={meetup}
            onChange={(e) => setMeetup(e.target.value)}
            className="w-full bg-transparent text-sm outline-none border-b border-border/60 pb-2"
          />
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything the seller should know?"
            rows={2}
            className="w-full bg-transparent text-sm outline-none pt-2 resize-none"
          />
        </div>

        <button
          disabled={loading}
          onClick={placeOrder}
          className="mt-5 w-full py-3.5 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-bronze)" }}
        >
          {loading ? "Securing payment…" : `Pay $${total.toFixed(2)} with ${paymentLabel(method)}`}
        </button>
        <p className="mt-2 text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Secure checkout · Protected by PlugU
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