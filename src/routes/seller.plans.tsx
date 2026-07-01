import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Crown, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SELLER_TIERS, getSellerPlan, setSellerPlan, type BillingCycle, type SellerTier } from "@/lib/seller-plan";

export const Route = createFileRoute("/seller/plans")({
  head: () => ({ meta: [{ title: "Seller Plans — PlugU" }] }),
  component: SellerPlansPage,
});

function SellerPlansPage() {
  const [tier, setTier] = useState<SellerTier>("free");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  useEffect(() => {
    const p = getSellerPlan();
    setTier(p.tier);
    if (p.cycle) setCycle(p.cycle);
  }, []);

  function choose(next: SellerTier) {
    setSellerPlan(next, cycle);
    setTier(next);
    toast.success(`Now on ${SELLER_TIERS.find((t) => t.key === next)?.name}`, {
      description: next === "free" ? "5% fee applies to sales." : next === "pro" ? "2% fee. Verified Pro badge active." : "0% fee. Gold KingPin unlocked.",
    });
  }

  return (
    <AppShell title="SELLER PLANS">
      <section className="px-5 pt-5 slide-up">
        <div className="text-center">
          <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">Sell smarter</p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">Pick your seller tier</h1>
          <p className="mt-2 text-xs text-muted-foreground">
            Lower your fee, unlock analytics, or become a Gold KingPin.
          </p>
        </div>

        <div className="mt-5 mx-auto max-w-xs grid grid-cols-3 rounded-full border border-border p-1 bg-card text-[11px] font-semibold">
          {(["monthly", "semester", "year"] as BillingCycle[]).map((c) => (
            <button
              key={c}
              onClick={() => setCycle(c)}
              className={`tap rounded-full py-1.5 uppercase tracking-wider transition-colors ${
                cycle === c ? "bg-[image:var(--gradient-bronze)] text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {c === "monthly" ? "Monthly" : c === "semester" ? "Semester" : "Yearly"}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          {SELLER_TIERS.map((t) => {
            const active = tier === t.key;
            const cyclePrice =
              cycle === "year" ? t.pricing.year : cycle === "semester" ? t.pricing.semester : t.pricing.monthly;
            const cycleLabel = cycle === "year" ? "/yr" : cycle === "semester" ? "/sem" : "/mo";
            const price = cyclePrice ?? t.pricing.monthly;
            return (
              <div
                key={t.key}
                className="relative rounded-3xl p-5 overflow-hidden lift-card"
                style={{
                  background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
                  border: active
                    ? `1px solid ${t.accent}`
                    : "1px solid color-mix(in oklab, var(--plugu-gold) 30%, transparent)",
                  boxShadow: active ? `0 0 40px -12px ${t.accent}` : "none",
                }}
              >
                {t.key === "kingpin" && (
                  <span
                    className="absolute top-3 right-3 text-[10px] font-black tracking-[0.22em] uppercase px-2 py-0.5 rounded-full"
                    style={{ background: t.accent, color: "#111" }}
                  >
                    Popular
                  </span>
                )}
                <div className="flex items-center gap-2">
                  {t.key === "kingpin" ? (
                    <Crown className="h-4 w-4" style={{ color: t.accent }} />
                  ) : t.key === "pro" ? (
                    <ShieldCheck className="h-4 w-4" style={{ color: t.accent }} />
                  ) : (
                    <Sparkles className="h-4 w-4" style={{ color: t.accent }} />
                  )}
                  <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: t.accent }}>
                    {t.badge}
                  </p>
                </div>
                <h3 className="mt-2 text-xl font-bold">{t.name}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">{t.tagline}</p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black tracking-tight">
                    {price === 0 ? "Free" : `$${price}`}
                  </span>
                  {price > 0 && <span className="text-xs text-muted-foreground">{cycleLabel}</span>}
                  <span className="ml-auto text-[11px] font-semibold" style={{ color: t.accent }}>
                    {t.fee}% fee
                  </span>
                </div>

                <ul className="mt-4 space-y-1.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-[12px]">
                      <Check className="h-3.5 w-3.5 shrink-0" style={{ color: t.accent }} /> {p}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => choose(t.key)}
                  disabled={active}
                  className="mt-5 tap w-full py-3 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-70"
                  style={{
                    background: active
                      ? "linear-gradient(160deg, #333, #111)"
                      : "var(--gradient-bronze)",
                  }}
                >
                  {active ? "Current plan" : t.key === "free" ? "Switch to Free" : `Upgrade to ${t.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-2xl border border-dashed border-border p-4">
          <p className="text-[11px] text-muted-foreground">
            Track how your tier is paying off inside{" "}
            <Link to="/seller/analytics" className="text-accent">Seller Analytics</Link>.
          </p>
        </div>
      </section>
    </AppShell>
  );
}