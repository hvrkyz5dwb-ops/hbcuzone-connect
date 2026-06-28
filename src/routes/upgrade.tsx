import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Check, Sparkles, Minus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { pricingTiers } from "@/lib/mock-data";

export const Route = createFileRoute("/upgrade")({
  head: () => ({
    meta: [
      { title: "Upgrade — PlugU" },
      { name: "description", content: "Pick a PlugU plan — boost listings, get KingPin verified, or take over your campus." },
    ],
  }),
  component: Upgrade,
});

function Upgrade() {
  return (
    <AppShell title="UPGRADE">
      <section className="px-5 pt-5 text-center">
        <span className="inline-flex items-center gap-1 text-[10px] tracking-[0.2em] uppercase px-3 py-1 rounded-full border border-accent/40 text-accent">
          <Sparkles className="h-3 w-3" /> PlugU Plans
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Get plugged in.</h1>
        <p className="mt-1 text-sm text-muted-foreground">Boost listings, get verified, or run your campus.</p>
      </section>

      <section className="mt-5 px-5 space-y-3 pb-6">
        {pricingTiers.map((t) => (
          <Link
            key={t.key}
            to="/checkout"
            search={{ plan: t.key }}
            className={`block rounded-2xl border p-4 transition-colors ${
              t.highlight
                ? "border-primary bg-[image:var(--gradient-bronze)]/10 shadow-[var(--shadow-glow)]"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs tracking-wider uppercase text-muted-foreground flex items-center gap-1">
                  {t.highlight && <Crown className="h-3 w-3 text-accent" />} {t.name}
                </p>
                <p className="mt-1 text-2xl font-bold">${t.price}</p>
                <p className="text-xs text-muted-foreground mt-1">{t.tagline}</p>
              </div>
              <span className="text-[10px] tracking-wider uppercase text-primary">Choose →</span>
            </div>
            <ul className="mt-3 grid gap-1.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3 w-3 text-primary" /> {f}
                </li>
              ))}
            </ul>
          </Link>
        ))}

        <Link to="/manage-plan" className="block text-center text-xs text-muted-foreground py-3">
          Manage current plan →
        </Link>

        <PlanComparison />
      </section>
    </AppShell>
  );
}

const compareRows: { label: string; tiers: Record<string, boolean | string> }[] = [
  { label: "Boosted listing", tiers: { "local-boost": "24h", "campus-featured": "7d", "kingpin-basic": true, "kingpin-pro": true, "campus-takeover": true, "hbcu-network-boost": true } },
  { label: "Verified KingPin badge", tiers: { "kingpin-basic": true, "kingpin-pro": true, "campus-takeover": true, "hbcu-network-boost": true } },
  { label: "Featured profile", tiers: { "campus-featured": true, "kingpin-pro": true, "campus-takeover": true, "hbcu-network-boost": true } },
  { label: "Vendor analytics", tiers: { "kingpin-pro": true, "campus-takeover": true, "hbcu-network-boost": true } },
  { label: "Priority search", tiers: { "kingpin-pro": true, "campus-takeover": true, "hbcu-network-boost": true } },
  { label: "Multi-campus reach", tiers: { "hbcu-network-boost": true } },
  { label: "Full campus takeover", tiers: { "campus-takeover": true, "hbcu-network-boost": true } },
];

function PlanComparison() {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground">Compare Plans</p>
        <p className="text-sm font-semibold mt-0.5">What's included in each tier</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-muted-foreground border-b border-border">
              <th className="py-2 pl-4 pr-2 font-normal">Feature</th>
              {pricingTiers.map((t) => (
                <th key={t.key} className="px-2 py-2 font-normal whitespace-nowrap">
                  <div className="text-foreground font-semibold">${t.price}</div>
                  <div className="text-[10px] text-muted-foreground">{t.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row) => (
              <tr key={row.label} className="border-b border-border/50 last:border-0">
                <td className="py-2.5 pl-4 pr-2 text-muted-foreground">{row.label}</td>
                {pricingTiers.map((t) => {
                  const v = row.tiers[t.key];
                  return (
                    <td key={t.key} className="px-2 py-2.5 text-center">
                      {v === true ? (
                        <Check className="inline h-3.5 w-3.5 text-primary" />
                      ) : typeof v === "string" ? (
                        <span className="text-[10px] text-foreground">{v}</span>
                      ) : (
                        <Minus className="inline h-3 w-3 text-muted-foreground/40" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}