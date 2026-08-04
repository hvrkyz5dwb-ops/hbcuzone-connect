import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Zap, Sparkles, Check, Flame, Gem } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { reachPackages, savePct, type ReachPackage, type ReachDuration } from "@/lib/plug-reach-data";
import { saveSelectedPlan } from "@/lib/plan-storage";

export const Route = createFileRoute("/plug-reach")({
  head: () => ({
    meta: [
      { title: "Plug Reach™ — Launch Pricing — PlugU" },
      { name: "description", content: "Boost your listings from campus to nationwide. Locked-in launch pricing for early adopters." },
    ],
  }),
  component: PlugReach,
});

const tierRing: Record<ReachPackage["tier"], string> = {
  bronze:  "from-[#7a4a1c] via-[#c98a3c] to-[#f4c187]",
  silver:  "from-[#7d8892] via-[#c8cfd7] to-[#ffffff]",
  gold:    "from-[#b48a3c] via-[#f6d27a] to-[#fff2c2]",
  diamond: "from-[#67e8f9] via-[#bfeaff] to-[#ffffff]",
};

const tierText: Record<ReachPackage["tier"], string> = {
  bronze: "tier-bronze",
  silver: "tier-silver",
  gold: "tier-gold",
  diamond: "tier-diamond",
};

function fmt(n: number) {
  return `$${n.toFixed(2)}`;
}

function DurationRow({ pkg, d, onSelect }: { pkg: ReachPackage; d: ReachDuration; onSelect: () => void }) {
  const hasDiscount = d.original && d.original > d.price;
  return (
    <button
      onClick={onSelect}
      className="tap w-full group flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/60 hover:border-primary/60 hover:bg-background/80 px-4 py-3 transition-all"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold">{d.label}</span>
        {d.bestValue && (
          <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded-full border border-primary/50 text-primary">
            Best Value
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-2 shrink-0">
        {hasDiscount && (
          <span className="text-[11px] text-muted-foreground line-through">{fmt(d.original!)}</span>
        )}
        <span className={`text-lg font-black ${tierText[pkg.tier]}`}>{fmt(d.price)}</span>
        {hasDiscount && (
          <span className="text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">
            Save {savePct(d.original!, d.price)}%
          </span>
        )}
      </div>
    </button>
  );
}

function PackageCard({ pkg }: { pkg: ReachPackage }) {
  const navigate = useNavigate();
  function select(d: ReachDuration) {
    const key = `reach-${pkg.key}-${d.label.toLowerCase().replace(/\s+/g, "-")}`;
    const name = `Plug Reach™ — ${pkg.name} · ${d.label}`;
    saveSelectedPlan({ key, name, price: d.price });
    navigate({ to: "/checkout", search: { plan: key } });
  }
  const Icon = pkg.tier === "diamond" ? Gem : Zap;
  return (
    <div className="relative">
      {/* metallic ring */}
      <div
        className={`absolute -inset-[1.5px] rounded-[28px] bg-gradient-to-br ${tierRing[pkg.tier]} opacity-70 blur-[1px] group-hover:opacity-100 transition-opacity`}
        aria-hidden
      />
      <div className="group relative overflow-hidden rounded-[26px] border border-border/60 bg-card/95 backdrop-blur-xl p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_30px_80px_-30px_rgba(0,0,0,1)]">
        <div
          className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full blur-3xl opacity-40"
          style={{ background: "var(--plugu-gold)" }}
          aria-hidden
        />

        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className={`h-9 w-9 grid place-items-center rounded-2xl bg-gradient-to-br ${tierRing[pkg.tier]}`}>
                <Icon className="h-4 w-4 text-black/80" />
              </div>
              <h3 className={`text-xl font-black tracking-tight ${tierText[pkg.tier]}`}>{pkg.name}</h3>
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {pkg.tagline}
            </p>
          </div>
          {pkg.badge && (
            <span className="shrink-0 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-primary/60 text-primary flex items-center gap-1">
              <Flame className="h-3 w-3" /> {pkg.badge}
            </span>
          )}
        </div>

        <p className="relative mt-3 text-sm text-muted-foreground">{pkg.description}</p>

        <div className="relative mt-4 space-y-2">
          {pkg.durations.map((d) => (
            <DurationRow key={d.label} pkg={pkg} d={d} onSelect={() => select(d)} />
          ))}
        </div>

        <div className="relative mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Check className="h-3 w-3 text-primary" /> One-time payment · Secure Stripe checkout
        </div>
      </div>
    </div>
  );
}

function PlugReach() {
  const [tab, setTab] = useState<ReachPackage["key"] | "all">("all");
  const filtered = tab === "all" ? reachPackages : reachPackages.filter((p) => p.key === tab);

  return (
    <AppShell title="PLUG REACH™">
      <section className="px-5 pt-6 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.24em] uppercase px-3 py-1 rounded-full border border-primary/40 text-primary">
          <Sparkles className="h-3 w-3" /> Launch Pricing
        </span>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          <span className="plugu-wordmark">Plug Reach™</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
          Promote your business, brand, or drop — from your dorm floor to every campus in the country.
        </p>
      </section>

      <section className="mt-5 px-5">
        <div className="grid grid-cols-5 gap-1 rounded-2xl border border-border bg-card/70 p-1 text-[11px]">
          {[
            { k: "all", l: "All" },
            { k: "campus", l: "Campus" },
            { k: "local", l: "Local" },
            { k: "statewide", l: "State" },
            { k: "ultimate", l: "USA" },
          ].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as typeof tab)}
              className={`tap py-2 rounded-xl font-semibold tracking-wide transition-colors ${
                tab === t.k ? "bg-background text-foreground" : "text-muted-foreground"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5 grid gap-5 pb-4">
        {filtered.map((p) => (
          <PackageCard key={p.key} pkg={p} />
        ))}
      </section>

      <section className="px-5 pb-8">
        <div className="rounded-2xl border border-primary/40 bg-[image:var(--gradient-surface)] p-4 text-center">
          <p className="text-sm">
            🔥 <span className="font-bold">Launch Special:</span>{" "}
            <span className="text-muted-foreground">
              Early adopters lock in these discounted prices. Future users may pay higher rates as PlugU grows.
            </span>
          </p>
        </div>
      </section>
    </AppShell>
  );
}