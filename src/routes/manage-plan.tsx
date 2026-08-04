import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, RefreshCw, Trash2, Receipt, ShieldCheck, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { clearSelectedPlan, getSelectedPlan } from "@/lib/plan-storage";
import {
  getSellerPlanState,
  setSellerPlan,
  planDaysRemaining,
  CYCLE_VALIDITY,
  SELLER_TIERS,
  type SellerPlan,
} from "@/lib/seller-plan";

export const Route = createFileRoute("/manage-plan")({
  head: () => ({ meta: [{ title: "Manage Plan — PlugU" }] }),
  component: Manage,
});

function Manage() {
  const [plan, setPlan] = useState(getSelectedPlan());
  const [seller, setSeller] = useState<SellerPlan | null>(null);
  useEffect(() => {
    const { plan, expired } = getSellerPlanState();
    setSeller(plan);
    if (expired) {
      toast("Membership expired", { description: "Your paid plan ran out — you're back on Free Seller (5% fee)." });
    }
  }, []);
  const sellerMeta = seller ? SELLER_TIERS.find((t) => t.key === seller.tier) : null;
  const daysLeft = seller ? planDaysRemaining(seller) : null;
  const totalDays = seller?.cycle ? CYCLE_VALIDITY[seller.cycle].days : 0;

  return (
    <AppShell title="MANAGE PLAN">
      <section className="px-5 pt-5">
        {sellerMeta && (
          <div className="rounded-2xl border p-5 mb-4"
            style={{ borderColor: `color-mix(in oklab, ${sellerMeta.accent} 45%, transparent)`, background: "color-mix(in oklab, #0a0a0a 92%, transparent)" }}>
            <div className="flex items-center gap-2 text-[10px] tracking-[0.2em] uppercase" style={{ color: sellerMeta.accent }}>
              <ShieldCheck className="h-3.5 w-3.5" /> Seller Membership
            </div>
            <h2 className="mt-1 text-xl font-bold">{sellerMeta.name}</h2>
            <p className="text-[11px] text-muted-foreground mt-1">
              {sellerMeta.fee}% transaction fee · billed {seller?.cycle ?? "monthly"}
            </p>
            {seller?.validUntil && daysLeft !== null && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" style={{ color: sellerMeta.accent }} />
                    Valid until {new Date(seller.validUntil).toLocaleDateString()}
                  </span>
                  <span className="font-semibold" style={{ color: sellerMeta.accent }}>
                    {daysLeft} {daysLeft === 1 ? "day" : "days"} left
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-border/60 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${totalDays > 0 ? Math.min(100, Math.round((daysLeft / totalDays) * 100)) : 0}%`,
                      background: sellerMeta.accent,
                    }}
                  />
                </div>
              </div>
            )}
            {seller?.tier !== "free" && !seller?.validUntil && (
              <p className="mt-2 text-[11px] text-muted-foreground">Legacy plan — no expiry on record.</p>
            )}
          </div>
        )}

        {plan ? (
          <div className="rounded-2xl border border-primary/40 bg-[image:var(--gradient-bronze)]/10 p-5">
            <div className="flex items-center gap-2 text-accent text-[10px] tracking-[0.2em] uppercase">
              <Crown className="h-3.5 w-3.5" /> Latest Purchase
            </div>
            <h1 className="mt-2 text-2xl font-bold">{plan.name}</h1>
            <p className="text-primary font-bold mt-1">${plan.price}</p>
            <p className="text-[11px] text-muted-foreground mt-2">
              Selected {new Date(plan.selectedAt).toLocaleDateString()} · Awaiting Stripe activation
            </p>
          </div>
        ) : (
          !sellerMeta && <div className="rounded-2xl bg-card border border-border p-5 text-center">
            <p className="text-sm text-muted-foreground">No active plan yet.</p>
            <Link to="/upgrade" className="mt-3 inline-block text-primary text-sm">Choose a plan →</Link>
          </div>
        )}

        <ul className="mt-5 rounded-2xl bg-card border border-border divide-y divide-border">
          <li>
            <Link to="/upgrade" className="w-full flex items-center gap-3 px-4 py-4 text-sm">
              <RefreshCw className="h-4 w-4 text-primary" />
              <span className="flex-1">Change plan</span>
              <span className="text-muted-foreground">→</span>
            </Link>
          </li>
          <li>
            <Link to="/payment-history" className="w-full flex items-center gap-3 px-4 py-4 text-sm">
              <Receipt className="h-4 w-4 text-primary" />
              <span className="flex-1">Payment history</span>
              <span className="text-muted-foreground">→</span>
            </Link>
          </li>
          {(plan || (seller && seller.tier !== "free")) && (
            <li>
              <button
                onClick={() => {
                  clearSelectedPlan();
                  setPlan(null);
                  const reset = setSellerPlan("free");
                  setSeller(reset);
                  toast("Downgraded to Free Seller");
                }}
                className="w-full flex items-center gap-3 px-4 py-4 text-sm text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="flex-1 text-left">Cancel plan</span>
              </button>
            </li>
          )}
        </ul>

        <p className="mt-4 text-[11px] text-center text-muted-foreground">
          Payments coming soon. Your plan selection has been saved.
        </p>
      </section>
    </AppShell>
  );
}