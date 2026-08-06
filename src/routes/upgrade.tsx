import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Check, Crown, PlugZap, Rocket, Sparkles, Star, TrendingUp, Zap, ShieldCheck, Calculator } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { boostPackages, type BoostPackage } from "@/lib/mock-data";
import { SELLER_TIERS, setSellerPlan, getSellerPlanState, CYCLE_VALIDITY, type SellerTier } from "@/lib/seller-plan";
import { saveSelectedPlan } from "@/lib/plan-storage";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade — PlugU Seller Plans & Boosts" },
      { name: "description", content: "Lower your fee with a seller membership, or boost a listing from your campus to nationwide. See how fast it pays for itself." },
      { property: "og:title", content: "Upgrade — PlugU Seller Plans & Boosts" },
      { property: "og:description", content: "Seller memberships and promotion boosts built for student sellers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Upgrade,
});

const AVG_SALE_KEY = "plugu.avgSalePrice";

const tierAccent: Record<BoostPackage["tier"], string> = {
  bronze: "#c88a4a",
  silver: "#d6d6d6",
  gold: "#f4c96a",
  platinum: "#e6ecf1",
  diamond: "#a8e0ff",
};

const pkgIcon: Record<string, typeof Rocket> = {
  "local-boost": Zap,
  "campus-featured": Star,
  "local-network": TrendingUp,
  statewide: Sparkles,
  ultimate: Crown,
};

function money(n: number) {
  return `$${n.toFixed(2).replace(/\.00$/, "")}`;
}

/** Shared average-sale-price state, persisted so every calculator agrees. */
function useAvgSale() {
  const [avg, setAvg] = useState(35);
  useEffect(() => {
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(AVG_SALE_KEY) : null;
    const n = raw ? Number(raw) : NaN;
    if (Number.isFinite(n) && n > 0) setAvg(n);
  }, []);
  function update(n: number) {
    setAvg(n);
    if (typeof window !== "undefined") window.localStorage.setItem(AVG_SALE_KEY, String(n));
  }
  return { avg, setAvg: update };
}

/** Subtle break-even calculator shown under every paid plan / boost. */
function BreakEven({
  price,
  feePercent,
  avg,
  onAvgChange,
  accent,
}: {
  price: number;
  feePercent: number;
  avg: number;
  onAvgChange: (n: number) => void;
  accent: string;
}) {
  const netPerSale = Math.max(avg * (1 - feePercent / 100), 0.01);
  const sales = Math.max(1, Math.ceil(price / netPerSale));
  return (
    <div className="mt-3 rounded-2xl border border-border/70 bg-background/50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
        <Calculator className="h-3 w-3" style={{ color: accent }} /> Estimated break-even
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-[12px]">
        <span className="text-muted-foreground">If your average sale is</span>
        <span className="inline-flex items-center rounded-lg border border-border bg-card px-1.5">
          <span className="text-muted-foreground text-[12px]">$</span>
          <input
            type="number"
            min={1}
            inputMode="decimal"
            aria-label="Your average sale price in dollars"
            value={avg}
            onChange={(e) => onAvgChange(Math.max(1, Number(e.target.value) || 1))}
            className="w-12 bg-transparent py-0.5 text-[12px] font-semibold outline-none"
          />
        </span>
      </div>
      <p className="mt-1 text-[12px]">
        You only need{" "}
        <span className="font-bold" style={{ color: accent }}>
          {sales} more {sales === 1 ? "sale" : "sales"}
        </span>{" "}
        to cover this.
        <span className="text-muted-foreground"> ({money(netPerSale)} net per sale after the {feePercent}% fee)</span>
      </p>
    </div>
  );
}

function Upgrade() {
  const navigate = useNavigate();
  const [currentTier, setCurrentTier] = useState<SellerTier>("free");
  const [pending, setPending] = useState<SellerTier | null>(null);
  const { avg, setAvg } = useAvgSale();

  useEffect(() => {
    const { plan, expired } = getSellerPlanState();
    setCurrentTier(plan.tier);
    if (expired) {
      toast("Membership expired", { description: "Your paid plan ran out — you're back on Free Seller." });
    }
  }, []);

  function activateMembership(tier: SellerTier) {
    if (pending) return;
    const meta = SELLER_TIERS.find((t) => t.key === tier)!;
    if (tier === "free") {
      setPending(tier);
      try {
        setSellerPlan(tier, meta.cycle);
        setCurrentTier(tier);
        saveSelectedPlan({ key: `seller_${tier}_${meta.cycle}`, name: `${meta.name} · ${meta.cycle}`, price: 0 });
        toast.success("Switched to Free Seller", { description: `${meta.fee}% fee applies` });
      } catch {
        toast.error("Couldn't switch plan", { description: "Please try again in a moment." });
      }
      setPending(null);
      return;
    }
    // Paid memberships activate only after a confirmed Stripe payment —
    // checkout verifies the session before unlocking the tier.
    navigate({ to: "/checkout", search: { plan: `seller_${tier}_${meta.cycle}` } });
  }

  return (
    <AppShell title="UPGRADE">
      <section className="px-5 pt-6 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.24em] uppercase px-3 py-1 rounded-full border border-accent/40 text-accent">
          <Sparkles className="h-3 w-3" /> PlugU Plans
        </span>
        <h1 className="mt-3 text-[26px] leading-tight font-bold tracking-tight">Make your hustle pay for itself.</h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground max-w-xs mx-auto">
          Keep more of every sale with a membership, or pay once to get seen by more students.
        </p>
      </section>

      <nav className="mt-5 mx-5 grid grid-cols-2 gap-2">
        <a href="#memberships" className="tap rounded-xl border border-border bg-card px-3 py-2.5 text-center text-xs font-semibold">
          Seller Plans
        </a>
        <a href="#boosts" className="tap rounded-xl border border-border bg-card px-3 py-2.5 text-center text-xs font-semibold">
          Promotion Boosts
        </a>
      </nav>

      {/* -------- Memberships -------- */}
      <section id="memberships" className="mt-8 px-5 scroll-mt-4">
        <h2 className="text-lg font-bold tracking-tight">Seller Plans</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Lower your PlugU transaction fee and rank higher on your campus.
        </p>

        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Have a promo code? You can apply it at checkout.
        </p>

        <div className="mt-4 grid gap-4">
          {SELLER_TIERS.map((t) => {
            const price = t.price;
            const perLabel = t.cycle === "year" ? "/Year" : t.cycle === "semester" ? "/Semester" : "";
            const popular = t.key === "pro";
            const active = currentTier === t.key;
            return (
              <div
                key={t.key}
                className="relative rounded-3xl p-5 transition-all duration-300 ease-out"
                style={{
                  background: "linear-gradient(160deg, rgba(24,24,24,0.95), rgba(9,9,9,0.96))",
                  border: `1px solid color-mix(in oklab, ${t.accent} ${active || popular ? 55 : 24}%, transparent)`,
                  boxShadow: popular
                    ? `0 0 46px -16px ${t.accent}, 0 0 90px -40px var(--plugu-gold)`
                    : t.key === "kingpin"
                      ? `0 0 40px -18px ${t.accent}`
                      : undefined,
                }}
              >
                {popular && (
                  <span
                    className="absolute -top-2 left-5 text-[9px] font-black tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
                    style={{ background: "var(--gradient-bronze)", color: "#111" }}
                  >
                    ★ Most Popular
                  </span>
                )}
                {t.key === "kingpin" && (
                  <span
                    className="absolute -top-2 left-5 text-[9px] font-black tracking-[0.22em] uppercase px-2.5 py-1 rounded-full"
                    style={{ background: t.accent, color: "#111" }}
                  >
                    ★ Best Value
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
                  <span className="ml-auto text-[11px] font-semibold" style={{ color: t.accent }}>
                    {t.fee}% fee
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-bold tracking-tight">{t.name}</h3>
                <p className="mt-1 text-[11px] text-muted-foreground">{t.tagline}</p>

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[34px] leading-none font-black tracking-tight">
                    {price === 0 ? "Free" : money(price)}
                  </span>
                  {price > 0 && <span className="text-xs text-muted-foreground">{perLabel}</span>}
                </div>
                {price > 0 && t.monthlyEquiv > 0 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    About {money(t.monthlyEquiv)}/month
                  </p>
                )}
                {price > 0 && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Valid for {CYCLE_VALIDITY[t.cycle].label} from activation
                  </p>
                )}

                <ul className="mt-4 space-y-1.5">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-[12.5px]">
                      <Check className="h-3.5 w-3.5 mt-[3px] shrink-0" style={{ color: t.accent }} /> {p}
                    </li>
                  ))}
                </ul>

                {t.roi && (
                  <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-3 py-2.5">
                    <p className="text-[12px] text-emerald-300/90 leading-relaxed">{t.roi}</p>
                  </div>
                )}

                {price > 0 && (
                  <BreakEven price={price} feePercent={t.fee} avg={avg} onAvgChange={setAvg} accent={t.accent} />
                )}

                <button
                  onClick={() => activateMembership(t.key)}
                  disabled={active || pending !== null}
                  className="tap mt-4 w-full py-3 rounded-2xl text-sm font-semibold text-primary-foreground transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
                  style={{ background: active ? "linear-gradient(160deg,#333,#111)" : "var(--gradient-bronze)" }}
                >
                  {active
                    ? "Current plan"
                    : pending === t.key
                      ? "Activating…"
                      : t.key === "free"
                        ? "Switch to Free"
                        : `Get ${t.name}`}
                </button>
              </div>
            );
          })}
        </div>

        {/* Don't Run off on the Plug */}
        <div
          className="relative mt-6 overflow-hidden rounded-3xl p-5"
          style={{
            background: "linear-gradient(160deg, rgba(24,24,24,0.95), rgba(9,9,9,0.96))",
            border: "1px solid color-mix(in oklab, var(--plugu-gold) 38%, transparent)",
            boxShadow: "0 0 46px -18px var(--plugu-gold)",
          }}
        >
          <div
            className="pointer-events-none absolute -top-14 -right-14 h-40 w-40 rounded-full opacity-30 blur-3xl"
            style={{ background: "var(--plugu-gold)" }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.24em] uppercase" style={{ color: "var(--plugu-gold)" }}>
              <PlugZap className="h-3.5 w-3.5" /> Don't Run off on the Plug
            </div>
            <div className="mt-3 space-y-2.5 text-[12.5px] leading-relaxed text-foreground/90">
              <p>PlugU was built to help student entrepreneurs turn their skills into real businesses.</p>
              <p>Our goal isn't just to help you make money—we want to help you learn how to build, manage, and grow a business that lasts.</p>
              <p>When you invest in your business, you're investing in yourself and your future.</p>
              <p className="text-muted-foreground">
                As our community grows, members may become eligible for exclusive opportunities, educational resources, promotional campaigns, and future PlugU initiatives designed to support student entrepreneurs.
              </p>
              <p className="font-semibold" style={{ color: "var(--plugu-gold)" }}>
                Stay consistent. Build your brand. Don't Run off on the Plug.
              </p>
            </div>
            <Link
              to="/hub"
              className="tap mt-4 inline-flex items-center gap-1.5 rounded-2xl bg-[image:var(--gradient-bronze)] px-4 py-2.5 text-xs font-semibold text-primary-foreground"
            >
              Learn More <TrendingUp className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* -------- Boosts -------- */}
      <section id="boosts" className="mt-10 px-5 pb-10 scroll-mt-4">
        <h2 className="text-lg font-bold tracking-tight">Promotion Boosts</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Only pay when you need more exposure. No subscription required.
        </p>

        <div className="mt-4 space-y-4">
          {boostPackages.map((pkg) => (
            <BoostCard key={pkg.key} pkg={pkg} avg={avg} onAvgChange={setAvg} feePercent={SELLER_TIERS.find((t) => t.key === currentTier)?.fee ?? 5} />
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <Link to="/seller/plans" className="text-xs text-muted-foreground">
            Detailed plan comparison →
          </Link>
          <Link to="/manage-plan" className="text-xs text-muted-foreground">
            Manage current plan →
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function BoostCard({
  pkg,
  avg,
  onAvgChange,
  feePercent,
}: {
  pkg: BoostPackage;
  avg: number;
  onAvgChange: (n: number) => void;
  feePercent: number;
}) {
  const navigate = useNavigate();
  const defaultIdx = useMemo(() => {
    const i = pkg.durations.findIndex((d) => d.badge === "Best Value");
    return i >= 0 ? i : 0;
  }, [pkg]);
  const [selected, setSelected] = useState(defaultIdx);
  const Icon = pkgIcon[pkg.key] ?? Rocket;
  const accent = tierAccent[pkg.tier];
  const chosen = pkg.durations[selected];

  return (
    <div
      className="relative rounded-3xl p-5 overflow-hidden transition-all duration-300 ease-out"
      style={{
        background: "linear-gradient(160deg, rgba(24,24,24,0.95), rgba(9,9,9,0.96))",
        border: `1px solid color-mix(in oklab, ${accent} ${pkg.highlight ? 50 : 26}%, transparent)`,
        boxShadow: pkg.highlight ? `0 0 44px -16px ${accent}` : undefined,
      }}
    >
      {pkg.highlight && (
        <span
          className="absolute top-4 right-4 text-[9px] font-black tracking-[0.22em] uppercase px-2 py-0.5 rounded-full"
          style={{ background: "var(--gradient-bronze)", color: "#111" }}
        >
          ★ Popular
        </span>
      )}

      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        <p className="text-[10px] tracking-[0.24em] uppercase" style={{ color: accent }}>
          {pkg.reach}
        </p>
      </div>
      <h3 className="mt-2 text-xl font-bold tracking-tight">{pkg.name}</h3>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{pkg.tagline}</p>

      <ul className="mt-3 space-y-1.5">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-[12.5px] text-foreground/90">
            <Check className="h-3.5 w-3.5 mt-[3px] shrink-0" style={{ color: accent }} /> {f}
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
              aria-pressed={active}
              className="tap relative rounded-2xl px-2 py-2.5 text-left transition-all duration-300 ease-out active:scale-[0.97]"
              style={{
                background: active ? `color-mix(in oklab, ${accent} 14%, #0a0a0a)` : "#111",
                border: `1px solid ${active ? accent : `color-mix(in oklab, ${accent} 20%, transparent)`}`,
                transform: active ? "translateY(-1px)" : undefined,
              }}
            >
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{d.label}</p>
              <p className="mt-0.5 text-sm font-bold">{money(d.price)}</p>
              {d.badge === "Best Value" && (
                <p className="mt-0.5 text-[8.5px] font-black tracking-[0.14em] uppercase text-[color:var(--plugu-gold)]">
                  ★ Best Value
                </p>
              )}
            </button>
          );
        })}
        {pkg.durations.length < 3 &&
          Array.from({ length: 3 - pkg.durations.length }).map((_, i) => <div key={`spacer-${i}`} />)}
      </div>

      <div className="mt-4 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] px-3 py-2.5">
        <p className="text-[12px] text-emerald-300/90 leading-relaxed">{pkg.roi}</p>
      </div>

      {chosen && (
        <BreakEven price={chosen.price} feePercent={feePercent} avg={avg} onAvgChange={onAvgChange} accent={accent} />
      )}

      <button
        onClick={() => {
          if (!chosen || chosen.price < 0) {
            toast.error("Invalid boost — pick a duration");
            return;
          }
          navigate({ to: "/checkout", search: { plan: chosen.key } });
        }}
        className="tap mt-4 w-full py-3 rounded-2xl text-sm font-semibold text-primary-foreground transition-transform duration-200 active:scale-[0.98] disabled:opacity-60"
        style={{ background: "var(--gradient-bronze)" }}
      >
        {chosen ? `Boost for ${money(chosen.price)} · ${chosen.label}` : "Pick a duration"}
      </button>
    </div>
  );
}
