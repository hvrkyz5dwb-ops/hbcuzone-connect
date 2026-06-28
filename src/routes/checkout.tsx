import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { CreditCard, Lock, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { pricingTiers } from "@/lib/mock-data";
import { saveSelectedPlan } from "@/lib/plan-storage";

const search = z.object({ plan: z.string().optional() });

export const Route = createFileRoute("/checkout")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Checkout — PlugU" }] }),
  component: Checkout,
});

function Checkout() {
  const { plan } = Route.useSearch();
  const navigate = useNavigate();
  const tier = pricingTiers.find((t) => t.key === plan) ?? pricingTiers[0];
  const [loading, setLoading] = useState(false);

  function placeholderCheckout() {
    setLoading(true);
    saveSelectedPlan({ key: tier.key, name: tier.name, price: tier.price });
    setTimeout(() => navigate({ to: "/payment-success" }), 600);
  }

  return (
    <AppShell title="CHECKOUT">
      <section className="px-5 pt-5">
        <div className="rounded-2xl bg-card border border-border p-4">
          <p className="text-xs tracking-wider uppercase text-muted-foreground">Selected Plan</p>
          <div className="mt-2 flex items-baseline justify-between">
            <h1 className="text-xl font-bold">{tier.name}</h1>
            <p className="text-2xl font-bold text-primary">${tier.price}</p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">{tier.tagline}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-dashed border-border bg-secondary/50 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Payments coming soon. Stripe not connected yet.
          </div>
          <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-card border border-border opacity-60">
            <CreditCard className="h-4 w-4" />
            <span className="text-xs">Card ending •••• 4242 (demo)</span>
          </div>
        </div>

        <button
          onClick={placeholderCheckout}
          disabled={loading}
          className="mt-4 w-full py-3 rounded-2xl bg-[image:var(--gradient-bronze)] text-primary-foreground font-medium text-sm disabled:opacity-60"
        >
          {loading ? "Saving..." : `Confirm $${tier.price} — Placeholder`}
        </button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Payments coming soon. Your plan selection has been saved.
        </p>

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