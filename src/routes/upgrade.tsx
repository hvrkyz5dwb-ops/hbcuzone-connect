import { createFileRoute, Link } from "@tanstack/react-router";
import { Crown, Check, Sparkles } from "lucide-react";
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
      </section>
    </AppShell>
  );
}