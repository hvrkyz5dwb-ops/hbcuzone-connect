import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { resolvePlanKey } from "@/lib/plan-catalog";
import { createPlanCheckoutSession } from "@/lib/stripe.functions";

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
  const resolved = plan ? resolvePlanKey(plan) : null;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        },
      });
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setLoading(false);
    }
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
            <p className="text-2xl font-bold text-primary">{money(resolved.unitAmountCents)}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {resolved.kind === "membership"
              ? "Seller membership — one-time payment for the full period."
              : resolved.kind === "reach"
                ? "Plug Reach™ promotion — one-time payment."
                : "Promotion boost — one-time payment."}
          </p>
        </div>

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
          {loading ? "Opening secure checkout…" : `Pay ${money(resolved.unitAmountCents)} with Stripe`}
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