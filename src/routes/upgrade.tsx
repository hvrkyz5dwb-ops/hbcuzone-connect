import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Crown, Rocket, Sparkles, Star, TrendingUp, Zap, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { boostPackages, type BoostPackage } from "@/lib/mock-data";
import { SELLER_TIERS, setSellerPlan, getSellerPlan, type BillingCycle, type SellerTier } from "@/lib/seller-plan";
import { saveSelectedPlan } from "@/lib/plan-storage";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade — PlugU" },
      { name: "description", content: "Boost your listings across campus, your state, or the nation — plus premium seller memberships." },
    ],
  }),
  component: Upgrade,
});

const tierAccent: Record<BoostPackage["tier"], string> = {
  bronze: "#c88a4a",
  silver: "#d6d6d6",
  gold: "#f4c96a",
  platinum: "#e6ecf1",
  diamond: "#a8e0ff",
};

const pkgIcon: Record<BoostPackage["key"], typeof Rocket> = {
  "local-boost": Zap,
  "campus-featured": Star,
  "local-network": TrendingUp,
  "statewide": Sparkles,
  "ultimate": Crown,
};

function Upgrade() {
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<SellerTier>("free");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [pending, setPending] = useState<SellerTier | null>(null);
  useEffect(() => {
    const p = getSellerPlan();
    setCurrentTier(p.tier);
    if (p.cycle) setCycle(p.cycle);
  }, []);

  function activateMembership(tier: SellerTier) {
    if (pending) return;
    const meta = SELLER_TIERS.find((t) => t.key === tier)!;
    const price = cycle === "year" ? meta.pricing.year : cycle === "semester" ? meta.pricing.semester : meta.pricing.monthly;
    setPending(tier);
    try {
      setSellerPlan(tier, cycle);
      setCurrentTier(tier);
      saveSelectedPlan({ key: `seller_${tier}_${cycle}`, name: `${meta.name} · ${cycle}`, price: price ?? 0 });
      toast.success(`${meta.name} activated`, { description: `${meta.fee}% fee · billed ${cycle}` });
      navigate({ to: "/payment-success" });
    } catch (e) {
      toast.error("Couldn't activate plan", { description: "Please try again in a moment." });
      setPending(null);
    }
  }

  return (
    <AppShell title="UPGRADE">
      <section className="px-5 pt-5 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.24em] uppercase px-3 py-1 rounded-full border border-accent/40 text-accent">
          <Sparkles className="h-3 w-3" /> PlugU Plans
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Get plugged in.</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One-time boosts to promote a listing, or a membership to keep more of every sale.
        </p>
      </section>

      <nav className="mt-5 mx-5 grid grid-cols-2 gap-2">
        <a href="#boosts" className="rounded-xl border border-border bg-card px-3 py-2 text-center text-xs font-semibold">
          Promotion Boosts
        </a>
        <a href="#memberships" className="rounded-xl border border-border bg-card px-3 py-2 text-center text-xs font-semibold">
          Seller Memberships
        </a>
      </nav>

      {/* -------- Boosts -------- */}
      <section id="boosts" className="mt-6 px-5">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Promotion Boosts</h2>
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">One-time</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Pick your reach, pick your run-time. No subscription.
        </p>

        <div className="mt-4 space-y-4 pb-2">
          {boostPackages.map((pkg) => (
            <BoostCard key={pkg.key} pkg={pkg} />
          ))}
        </div>
      </section>

      {/* -------- Memberships -------- */}
      <section id="memberships" className="mt-8 px-5 pb-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-bold">Seller Memberships</h2>
          <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Recurring</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Lower your PlugU transaction fee and unlock long-term perks.
        </p>

        <div className="mt-4 mx-auto grid grid-cols-3 rounded-full border border-border p-1 bg-card text-[11px] font-semibold">
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

        <div className="mt-4 grid gap-3">
          {SELLER_TIERS.map((t) => (
            <div
              key={t.key}
              className="rounded-2xl p-4 border border-border bg-card"
              style={{ boxShadow: t.key === "kingpin" ? `0 0 32px -14px ${t.accent}` : undefined }}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: t.accent }}>
                    {t.badge}
                  </p>
                  <p className="mt-1 text-base font-bold">{t.name}</p>
                </div>
                <span className="text-[11px] font-semibold" style={{ color: t.accent }}>
                  {t.fee}% fee
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">{t.tagline}</p>

              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-md bg-secondary px-2 py-0.5">
                  {t.pricing.monthly === 0 ? "Free" : `$${t.pricing.monthly}/mo`}
                </span>
                {t.pricing.semester != null && (
                  <span className="rounded-md bg-secondary px-2 py-0.5">${t.pricing.semester}/sem</span>
                )}
                {t.pricing.year != null && (
                  <span className="rounded-md bg-secondary px-2 py-0.5">${t.pricing.year}/yr</span>
                )}
              </div>

              <button
                onClick={() => activateMembership(t.key)}
                disabled={currentTier === t.key || pending !== null}
                className="tap mt-3 w-full py-2.5 rounded-xl text-xs font-semibold text-primary-foreground disabled:opacity-60"
                style={{ background: currentTier === t.key ? "linear-gradient(160deg,#333,#111)" : "var(--gradient-bronze)" }}
              >
                {currentTier === t.key ? "Current plan" : pending === t.key ? "Activating…" : t.key === "free" ? "Switch to Free" : `Activate ${t.name} — ${cycle}`}
              </button>
            </div>
          ))}
        </div>

        <Link to="/seller/plans" className="mt-4 block text-center text-xs text-muted-foreground">
          Detailed plan comparison →
        </Link>
        <Link to="/manage-plan" className="mt-2 block text-center text-xs text-muted-foreground">
          Manage current plan →
        </Link>
      </section>
    </AppShell>
  );
}

function BoostCard({ pkg }: { pkg: BoostPackage }) {
  const navigate = useNavigate();
  const defaultIdx = pkg.durations.findIndex((d) => d.badge === "Best Value");
  const [selected, setSelected] = useState(defaultIdx >= 0 ? defaultIdx : 0);
  const [busy, setBusy] = useState(false);
  const Icon = pkgIcon[pkg.key as keyof typeof pkgIcon] ?? Rocket;
  const accent = tierAccent[pkg.tier];
  const chosen = pkg.durations[selected];

  return (
    <div
      className="relative rounded-3xl p-5 overflow-hidden"
      style={{
        background: "linear-gradient(160deg, rgba(26,26,26,0.95), rgba(10,10,10,0.95))",
        border: `1px solid color-mix(in oklab, ${accent} 30%, transparent)`,
        boxShadow: pkg.highlight ? `0 0 40px -14px ${accent}` : undefined,
      }}
    >
      {pkg.highlight && (
        <span
          className="absolute top-3 right-3 text-[9px] font-black tracking-[0.22em] uppercase px-2 py-0.5 rounded-full"
          style={{ background: accent, color: "#111" }}
        >
          Popular
        </span>
      )}

      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: accent }}>
          {pkg.reach}
        </p>
      </div>
      <h3 className="mt-2 text-xl font-bold">{pkg.name}</h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{pkg.tagline}</p>

      <ul className="mt-3 space-y-1">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-[12px] text-muted-foreground">
            <Check className="h-3 w-3 shrink-0" style={{ color: accent }} /> {f}
          </li>
        ))}
      </ul>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {pkg.durations.map((d, i) => {
          const active = i === selected;
          return (
            <button
              key={d.key}
              onClick={() => setSelected(i)}
              className="tap rounded-xl px-2 py-2 text-left transition-all"
              style={{
                background: active ? "color-mix(in oklab, " + accent + " 12%, #0a0a0a)" : "#111",
                border: `1px solid ${active ? accent : "color-mix(in oklab, " + accent + " 20%, transparent)"}`,
              }}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.label}</p>
              <p className="mt-0.5 text-sm font-bold">${d.price}</p>
              {d.badge && (
                <p className="mt-0.5 text-[9px] font-semibold" style={{ color: accent }}>
                  {d.badge}
                </p>
              )}
            </button>
          );
        })}
        {/* Fill grid if fewer than 3 */}
        {pkg.durations.length < 3 &&
          Array.from({ length: 3 - pkg.durations.length }).map((_, i) => <div key={`spacer-${i}`} />)}
      </div>

      <button
        onClick={() => {
          if (busy) return;
          if (!chosen || chosen.price < 0) { toast.error("Invalid boost — pick a duration"); return; }
          setBusy(true);
          try {
            saveSelectedPlan({ key: `boost_${pkg.key}_${chosen.key}`, name: `${pkg.name} · ${chosen.label}`, price: chosen.price });
            toast.success(`${pkg.name} boost saved`);
            navigate({ to: "/payment-success" });
          } catch {
            toast.error("Couldn't save boost — please retry");
            setBusy(false);
          }
        }}
        disabled={busy}
        className="tap mt-4 w-full py-3 rounded-2xl text-sm font-semibold text-primary-foreground disabled:opacity-60"
        style={{ background: "var(--gradient-bronze)" }}
      >
        {busy ? "Saving…" : `Boost for $${chosen.price} · ${chosen.label}`}
      </button>
    </div>
  );
}