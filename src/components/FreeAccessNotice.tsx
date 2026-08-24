// Paid digital memberships, plan upgrades and paid post boosts are not sold
// in this release. Every account and every in-app feature is free. Marketplace
// payments for physical goods and real-world services are unaffected.
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export function FreeAccessNotice({ title = "EVERYTHING'S FREE" }: { title?: string }) {
  return (
    <AppShell title={title}>
      <section className="px-5 pt-10 max-w-sm mx-auto text-center">
        <div className="mx-auto h-16 w-16 rounded-full border border-primary/40 grid place-items-center bg-card">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
        <h1 className="mt-4 text-xl font-bold">Every PlugU feature is free</h1>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          There are no memberships, subscriptions or paid promotions in PlugU. Listings,
          services, bookings, messaging, the campus map and analytics are included with
          every verified student account at no cost.
        </p>
        <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
          You only ever pay another student for the real-world goods and services you buy
          from them.
        </p>
        <div className="mt-6 grid gap-2">
          <Link to="/seller" className="tap rounded-2xl bg-[image:var(--gradient-bronze)] py-3 text-sm font-semibold text-primary-foreground">
            Open seller dashboard
          </Link>
          <Link to="/" className="tap inline-flex items-center justify-center gap-1 rounded-2xl border border-border bg-secondary py-3 text-sm">
            <ArrowLeft className="h-3.5 w-3.5" /> Back home
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
