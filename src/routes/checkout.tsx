import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { BadgePercent, CheckCircle2, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { resolvePlanKey } from "@/lib/plan-catalog";
import { createPlanCheckoutSession } from "@/lib/stripe.functions";
import { validatePromoCode } from "@/lib/promo.functions";
import { useIsIosNative } from "@/lib/platform";

const search = z.object({ plan: z.string().optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Checkout — PlugU" }] }),
  component: Checkout,
});

function money(cents: number) {
  return `$${(cents / 100).toFixed(2).replace(/\.00$/, "")}`;
}

function Checkout() {
  const { plan } = Route.useSearch();
  const iosNative = useIsIosNative();
  const resolved = plan ? resolvePlanKey(plan) : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);
  const [promo, setPromo] = useState<{ code: string; percent: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState<string | null>(null);

  const isMembership = resolved?.kind === "membership";
  const finalCents = resolved
    ? promo
      ? Math.max(50, Math.round((resolved.unitAmountCents * (100 - promo.percent)) / 100))
      : resolved.unitAmountCents
    : 0;

  async function applyPromo() {
    if (!promoInput.trim() || promoChecking) return;
    setPromoChecking(true);
    setPromoMsg(null);
    try {
      const r = await validatePromoCode({ data: { code: promoInput.trim() } });
      if (r.valid && r.discount_percent) {
        setPromo({ code: r.code ?? promoInput.trim(), percent: r.discount_percent });
      } else {
        setPromo(null);
      }
      setPromoMsg(r.message);
    } catch {
      setPromo(null);
      setPromoMsg("Couldn't check that code right now — try again in a moment.");
    } finally {
      setPromoChecking(false);
    }
  }

  async function pay() {
    if (!resolved || loading) return;
    setLoading(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const { url } = await createPlanCheckoutSession({
        data: {
          planKey: resolved.key,
          successUrl: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${origin}/checkout?plan=${encodeURIComponent(resolved.key)}`,
          ...(promo ? { promoCode: promo.code } : {}),
        },
      });
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
  }

  if (iosNative) {
    return (
      <AppShell title="CHECKOUT">
        <section className="px-5 pt-8">
          <div className="rounded-2xl border border-border bg-card p-5 text-center">
            <Lock className="mx-auto h-6 w-6 text-primary" />
            <h1 className="mt-3 text-lg font-bold">Not available in the app</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Seller memberships and promotion boosts can't be purchased inside the iOS app.
              Everything else in PlugU works exactly the same, and any plan you already have
              stays active here.
            </p>
            <Link to="/" className="mt-5 inline-block rounded-2xl bg-[image:var(--gradient-bronze)] px-6 py-3 text-sm font-medium text-primary-foreground">
              Back to PlugU
            </Link>
          </div>
        </section>
      </AppShell>
    );
  }

  if (!resolved) {
    return (
      <AppShell title="CHECKOUT">
        <section className="px-5 pt-10 text-center">
          <h1 className="text-xl font-bold">No plan selected</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a membership or boost first, then come back to check out.
          </p>
          <Link
            to="/upgrade"
            className="mt-5 inline-block py-3 px-6 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground text-sm font-medium"
          >
            Browse plans
          </Link>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell title="CHECKOUT">
      <section className="px-5 pt-5">
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-xs tracking-wider uppercase text-muted-foreground">Selected Plan</p>
          <div className="mt-2 flex items-baseline justify-between gap-3">
            <h1 className="text-xl font-bold">{resolved.name}</h1>
            <div className="text-right">
              {promo && (
                <p className="text-xs text-muted-foreground line-through">{money(resolved.unitAmountCents)}</p>
              )}
              <p className="text-2xl font-bold text-primary">{money(finalCents)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {resolved.kind === "membership"
              ? "Seller membership — one-time payment for the full period."
              : resolved.kind === "reach"
                ? "Plug Reach™ promotion — one-time payment."
                : "Promotion boost — one-time payment."}
          </p>
        </div>

        {isMembership && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <label
              htmlFor="promo-code"
              className="flex items-center gap-1.5 text-xs tracking-wider uppercase text-muted-foreground"
            >
              <BadgePercent className="h-3.5 w-3.5 text-primary" /> Promo code
            </label>
            {promo ? (
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="min-w-0 flex-1 text-[13px] font-semibold text-emerald-300">
                  {promoMsg ?? `Promo Code Applied — ${promo.percent}% Off`}
                </span>
                <button
                  type="button"
                  onClick={() => { setPromo(null); setPromoInput(""); setPromoMsg(null); }}
                  className="tap shrink-0 text-[11px] text-muted-foreground"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="mt-2 flex gap-2">
                <input
                  id="promo-code"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") applyPromo(); }}
                  placeholder="Enter code"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  maxLength={40}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={promoChecking || !promoInput.trim()}
                  className="tap shrink-0 rounded-xl bg-[image:var(--gradient-bronze)] px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {promoChecking ? "…" : "Apply"}
                </button>
              </div>
            )}
            {!promo && promoMsg && (
              <p role="alert" className="mt-2 text-[12px] text-muted-foreground">
                {promoMsg}
              </p>
            )}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-border bg-secondary/50 p-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> You'll enter your card on Stripe's secure page — PlugU never sees or stores card numbers.
          </div>
        </div>

        <button
          onClick={pay}
          disabled={loading}
          className="tap mt-4 w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium text-sm disabled:opacity-60"
        >
          {loading ? "Opening secure checkout…" : `Pay ${money(finalCents)} with Stripe`}
        </button>
        {error && (
          <p role="alert" className="mt-2 text-center text-[12px] text-destructive">
            {error}
          </p>
        )}

        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
          <ShieldCheck className="h-3 w-3 text-primary" /> Secure checkout · PlugU
        </div>

        <Link to="/upgrade" className="block mt-4 text-center text-xs text-muted-foreground">
          ← Pick a different plan
        </Link>
      </section>
    </AppShell>
  );
}