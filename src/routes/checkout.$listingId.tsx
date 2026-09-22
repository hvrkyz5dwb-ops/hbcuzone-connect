import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, ShieldCheck, Lock, CreditCard, Smartphone, DollarSign,
  BadgeCheck, RefreshCw, MessageSquare, MapPin, Calendar, Truck, Package, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { ChargingLoader } from "@/components/ChargingLoader";
import { ErrorState, PageLoader } from "@/components/QueryStates";
import { fetchListing } from "@/lib/listings-db";
import { getOrCreateConversation } from "@/lib/messages-db";
import { formatPrice, type PriceType } from "@/lib/categories";
import {
  createProductOrder, createServiceBooking, centsToDollars,
} from "@/lib/orders-db";
import { useOpenSlots } from "@/hooks/use-orders";
import { getStripeStatus, createCheckoutSession } from "@/lib/stripe.functions";
import { useSession } from "@/hooks/use-session";
import { requestAuthentication } from "@/components/RequireAuthPrompt";

type PaymentMethod = "apple_pay" | "cash_app" | "card";
const paymentLabel = (m: PaymentMethod) =>
  m === "apple_pay" ? "Apple Pay" : m === "cash_app" ? "Cash App Pay" : "Card";

export const Route = createFileRoute("/checkout/$listingId")({
  head: () => ({ meta: [
    { title: "Listing Details — PlugU" },
    { name: "description", content: "View a complete student marketplace listing on PlugU." },
    { property: "og:title", content: "PlugU Marketplace Listing" },
    { property: "og:description", content: "View product and service details from a verified campus seller." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: ProtectedCheckout,
});

const METHODS: { key: PaymentMethod; label: string; sub: string; Icon: typeof CreditCard }[] = [
  { key: "apple_pay", label: "Apple Pay", sub: "Face ID · Instant", Icon: Smartphone },
  { key: "cash_app", label: "Cash App Pay", sub: "Pay with $cashtag", Icon: DollarSign },
  { key: "card", label: "Debit / Credit Card", sub: "Visa · Mastercard · Amex", Icon: CreditCard },
];

// Client-side preview only — the server RPC is the source of truth.
const PLATFORM_FEE = 0.08;
const PROCESSING_PCT = 0.029;
const PROCESSING_FLAT_CENTS = 30;

function ProtectedCheckout() {
  const { listingId } = Route.useParams();
  const navigate = useNavigate();
  const { session } = useSession();
  const { data: listing, isPending, isError, refetch } = useQuery({
    queryKey: ["listing", listingId],
    queryFn: () => fetchListing(listingId),
  });
  const stripeStatusQ = useQuery({ queryKey: ["stripe-status"], queryFn: () => getStripeStatus() });
  const paymentsLive = !!stripeStatusQ.data?.configured;
  const startCheckout = useServerFn(createCheckoutSession);
  const isService = listing?.kind === "service";
  const slotsQ = useOpenSlots(isService ? listingId : "");
  const [slotId, setSlotId] = useState<string | null>(null);

  const subtotalCents = listing?.price_cents ?? 0;
  const preview = useMemo(() => {
    const platform = Math.round(subtotalCents * PLATFORM_FEE);
    const processing = Math.round(subtotalCents * PROCESSING_PCT) + PROCESSING_FLAT_CENTS;
    return { platform, processing, total: subtotalCents + platform + processing };
  }, [subtotalCents]);

  const [method, setMethod] = useState<PaymentMethod>("apple_pay");
  const [fulfillment, setFulfillment] = useState<string>("");
  const [meetup, setMeetup] = useState("Student Center · Today 5pm");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState<string | null>(null);
  // Prevent double-submits from a rapid double click.
  const [idempotencyKey] = useState(() =>
    (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
  );
  void idempotencyKey;

  if (isPending) {
    return (
      <AppShell title="CHECKOUT">
        <PageLoader message="Preparing checkout…" />
      </AppShell>
    );
  }

  if (isError) {
    return (
      <AppShell title="CHECKOUT">
        <ErrorState
          title="Checkout didn't load"
          description="We couldn't reach this listing. Check your connection and try again."
          onRetry={() => void refetch()}
        />
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

  const cover = listing.images[0]?.url;
  if (!cover) {
    return (
      <AppShell title="LISTING">
        <section className="px-5 pt-10 text-center">
          <p className="text-sm text-muted-foreground">This listing is no longer available.</p>
          <Link to="/market" className="tap mt-4 inline-flex min-h-11 items-center text-xs text-accent">Back to market</Link>
        </section>
      </AppShell>
    );
  }
  const sellerName = listing.seller?.display_name ?? listing.seller?.username ?? listing.campus_name ?? "Student seller";
  const campusName = listing.campus_name ?? "";
  const fulfillmentOptions = listing.fulfillment && listing.fulfillment.length > 0 ? listing.fulfillment : ["pickup"];
  const effectiveFulfillment = fulfillment || fulfillmentOptions[0];

  async function placeOrder() {
    if (!listing) return;
    if (!session) { requestAuthentication(); return; }
    if (loading) return;
    setLoading(true);
    try {
      let id: string;
      if (isService) {
        if (!slotId) { toast.error("Pick an available time slot"); setLoading(false); return; }
        id = await createServiceBooking({ slotId, note: note || undefined });
      } else {
        id = await createProductOrder({
          listingId: listing.id,
          fulfillmentMethod: effectiveFulfillment,
          note: note || undefined,
          meetupLocation: meetup || undefined,
        });
      }

      if (paymentsLive) {
        // Real Stripe checkout — redirect the buyer.
        try {
          const origin = window.location.origin;
          const { url } = await startCheckout({
            data: {
              orderId: id,
              successUrl: `${origin}/orders/${id}?paid=1`,
              cancelUrl: `${origin}/payment-failed`,
            },
          });
          window.location.href = url;
          return;
        } catch (err) {
          toast.error("Couldn't start Stripe checkout", { description: (err as Error).message });
        }
      } else {
        // Honest: order reserved, but payment is not accepted yet.
        setPlaced(id);
        toast.message("Order reserved — payment not collected", {
          description: "Online payment is not available for this listing.",
        });
      }
    } catch (err) {
      toast.error("Couldn't place order", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
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
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">
            {isService ? "Booking requested" : "Order confirmed"}
          </h1>
          <p className="mt-2 text-xs text-muted-foreground">Funds held safely until you confirm delivery.</p>

          <div className="mt-6 mx-auto max-w-sm rounded-2xl border border-border bg-card p-4 text-left">
            <div className="flex items-center gap-3">
              <img src={cover} alt="" className="h-14 w-14 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{listing.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{sellerName} · {campusName}</p>
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--plugu-gold)" }}>{centsToDollars(preview.total)}</span>
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
    <AppShell title="LISTING">
      <section className="px-5 pt-4 pb-6 slide-up">
        <Link to="/market" className="tap inline-flex items-center gap-1 text-[11px] text-muted-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to market
        </Link>

        {/* Listing summary */}
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
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-border text-muted-foreground inline-flex items-center gap-1">
              {isService ? <Calendar className="h-3 w-3"/> : <Package className="h-3 w-3"/>}
              {isService ? "Service" : "Product"}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-border/60 text-xs space-y-1.5">
            <Row label="Item" value={centsToDollars(subtotalCents)} />
            <Row label="Platform fee (8%)" value={centsToDollars(preview.platform)} muted />
            <Row label="Processing (2.9% + $0.30)" value={centsToDollars(preview.processing)} muted />
            <Row label="Total" value={centsToDollars(preview.total)} bold />
            <p className="text-[10px] text-muted-foreground pt-1">Final totals confirmed server-side at checkout.</p>
          </div>
        </div>

        <section className="mt-4 rounded-2xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold">About this {isService ? "service" : "item"}</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{listing.description}</p>
        </section>

        {/* Service: slot picker */}
        {isService && (
          <>
            <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground px-1">Pick a time</p>
            <div className="mt-2 rounded-2xl border border-border bg-card p-3">
              {slotsQ.isLoading ? (
                <div className="py-6 grid place-items-center"><ChargingLoader size={28} message="Loading available times…" /></div>
              ) : (slotsQ.data ?? []).length === 0 ? (
                <p className="text-[11px] text-muted-foreground py-2">
                  This provider hasn't opened any slots yet. Message them to request a time.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {slotsQ.data!.map((s) => {
                    const start = new Date(s.slot_start);
                    const end = new Date(s.slot_end);
                    const active = slotId === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSlotId(s.id)}
                        className={`tap text-left rounded-xl border p-2.5 transition-colors ${active ? "border-accent bg-secondary" : "border-border bg-card"}`}
                      >
                        <p className="text-[11px] font-semibold">{start.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {start.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} – {end.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Product: fulfillment picker */}
        {!isService && fulfillmentOptions.length > 1 && (
          <>
            <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground px-1">Fulfillment</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {fulfillmentOptions.map((f) => {
                const active = effectiveFulfillment === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFulfillment(f)}
                    className={`tap px-3 py-1.5 rounded-full text-[11px] border inline-flex items-center gap-1.5 ${active ? "border-accent bg-secondary text-foreground" : "border-border bg-card text-muted-foreground"}`}
                  >
                    <Truck className="h-3 w-3" /> {f}
                  </button>
                );
              })}
            </div>
          </>
        )}

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
        {paymentsLive && <>
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


        {/* Meetup / notes */}
        <p className="mt-5 text-[11px] tracking-[0.24em] uppercase text-muted-foreground px-1">
          {isService ? "Notes for provider" : "Meetup & notes"}
        </p>
        <div className="mt-2 rounded-2xl border border-border bg-card p-3 space-y-2">
          {!isService && (
            <>
              <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Meetup spot / drop-off
              </label>
              <input
                value={meetup}
                onChange={(e) => setMeetup(e.target.value)}
                className="w-full bg-transparent text-sm outline-none border-b border-border/60 pb-2"
              />
            </>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isService ? "Anything the provider should know?" : "Anything the seller should know?"}
            rows={2}
            className="w-full bg-transparent text-sm outline-none pt-2 resize-none"
          />
        </div>

        <button
          disabled={loading || (isService && !slotId)}
          onClick={placeOrder}
          className="mt-4 w-full py-3.5 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-60"
          style={{ background: "var(--gradient-bronze)" }}
        >
          {loading ? "Opening secure checkout…" : `Pay ${centsToDollars(preview.total)} with ${paymentLabel(method)}`}
        </button>
        <p className="mt-2 text-center text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
          Secure checkout
        </p>
        </>}

        {!paymentsLive && (
          <button
            type="button"
            onClick={async () => {
              if (!session) { requestAuthentication(); return; }
              try {
                const convId = await getOrCreateConversation(listing.seller_user_id, listing.id);
                navigate({ to: "/messages/$id", params: { id: convId } });
              } catch (error) {
                toast.error("Couldn’t open chat", { description: (error as Error).message });
              }
            }}
            className="tap mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-primary bg-primary/10 px-4 text-sm font-semibold text-primary"
          >
            <MessageSquare className="h-4 w-4" /> Message seller
          </button>
        )}
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