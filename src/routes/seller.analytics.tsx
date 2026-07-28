import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingBag, DollarSign, CalendarDays, LineChart, Loader2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { useProfile } from "@/hooks/use-profile";
import { currentSellerTierMeta } from "@/lib/seller-plan";

export const Route = createFileRoute("/seller/analytics")({
  head: () => ({ meta: [{ title: "Seller Analytics — PlugU" }] }),
  component: SellerAnalytics,
});

function SellerAnalytics() {
  const { user } = useSession();
  const { profile } = useProfile();
  const tier = currentSellerTierMeta();

  const q = useQuery({
    queryKey: ["seller-analytics", user?.id ?? null],
    enabled: !!user?.id,
    staleTime: 30_000,
    queryFn: async () => {
      const uid = user!.id;
      const [ordersRes, listingsRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id,status,payment_status,total_cents,platform_fee_cents,processing_fee_cents,created_at,buyer_user_id")
          .eq("seller_user_id", uid)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("listings")
          .select("id,status", { count: "exact", head: true })
          .eq("seller_user_id", uid),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (listingsRes.error) throw listingsRes.error;
      return {
        orders: ordersRes.data ?? [],
        listingCount: listingsRes.count ?? 0,
      };
    },
  });

  const orders = q.data?.orders ?? [];
  const listingCount = q.data?.listingCount ?? 0;

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === "captured" || o.status === "completed");
    const centsToUsd = (c: number) => c / 100;
    const now = new Date();
    let monthly = 0, yearly = 0, allTime = 0;
    for (const o of paid) {
      const net = (o.total_cents ?? 0) - (o.platform_fee_cents ?? 0) - (o.processing_fee_cents ?? 0);
      allTime += net;
      const d = new Date(o.created_at);
      if (d.getFullYear() === now.getFullYear()) {
        yearly += net;
        if (d.getMonth() === now.getMonth()) monthly += net;
      }
    }
    const buyers = new Set(paid.map((o) => o.buyer_user_id));
    const repeatBuyers = paid.length - buyers.size;
    const repeatPct = buyers.size ? Math.round((repeatBuyers / buyers.size) * 100) : 0;

    // Sparkline: paid orders per day, last 8 days.
    const buckets = new Array(8).fill(0);
    const nowMs = Date.now();
    for (const o of paid) {
      const days = Math.floor((nowMs - new Date(o.created_at).getTime()) / 86_400_000);
      if (days >= 0 && days < 8) buckets[7 - days] += 1;
    }
    return {
      monthly: centsToUsd(monthly), yearly: centsToUsd(yearly), allTime: centsToUsd(allTime),
      paidCount: paid.length, totalCount: orders.length, repeatPct, spark: buckets,
    };
  }, [orders]);

  const max = Math.max(1, ...stats.spark);

  const kpis = [
    { label: "Monthly earnings", value: `$${stats.monthly.toFixed(2)}`, Icon: DollarSign },
    { label: "Year to date", value: `$${stats.yearly.toFixed(2)}`, Icon: CalendarDays },
    { label: "Paid orders", value: String(stats.paidCount), Icon: ShoppingBag },
    { label: "Repeat buyers", value: `${stats.repeatPct}%`, Icon: Star },
  ];

  return (
    <AppShell title="ANALYTICS">
      <section className="px-5 pt-5 slide-up">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] tracking-[0.32em] uppercase text-muted-foreground">Seller Analytics</p>
            <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">Your numbers</h1>
          </div>
          <Link
            to="/seller/plans"
            className="tap text-[10px] tracking-[0.24em] uppercase px-3 py-1.5 rounded-full border border-border bg-card"
            style={{ color: tier.accent }}
          >
            {tier.badge}
          </Link>
        </div>

        {q.isPending ? (
          <div className="mt-8 grid place-items-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : stats.totalCount === 0 ? (
          <div className="mt-6 rounded-2xl border border-border bg-card p-6 text-center">
            <ShoppingBag className="h-6 w-6 text-primary mx-auto" />
            <p className="mt-2 text-sm font-semibold">No sales yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Your earnings and stats will show here as soon as your first paid order comes through.
              {listingCount === 0 && " Create your first listing to get started."}
            </p>
            <Link
              to={listingCount === 0 ? "/seller/listings" : "/promote"}
              className="mt-4 inline-flex items-center gap-1 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              {listingCount === 0 ? "Create a listing" : "Promote your listings"}
            </Link>
          </div>
        ) : (
        <>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          {kpis.map((k) => {
            const Icon = k.Icon;
            return (
              <div key={k.label} className="rounded-2xl border border-border bg-card p-3.5 lift-card">
                <Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
                <p className="mt-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{k.label}</p>
                <p className="mt-0.5 text-xl font-bold">{k.value}</p>
              </div>
            );
          })}
        </div>

        <div
          className="mt-4 rounded-2xl p-4"
          style={{
            background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
            border: "1px solid color-mix(in oklab, var(--plugu-gold) 40%, transparent)",
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <LineChart className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--plugu-gold)" }}>Paid orders — last 8 days</p>
            </div>
            <span className="text-xs font-semibold text-accent">${stats.allTime.toFixed(0)} all-time</span>
          </div>
          <svg viewBox="0 0 200 64" className="mt-3 w-full h-16">
            <polyline
              fill="none"
              stroke="var(--plugu-gold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="graph-draw"
              points={stats.spark
                .map((v, i) => `${(i / 7) * 200},${64 - (v / max) * 56 - 4}`)
                .join(" ")}
            />
            {stats.spark.map((v, i) => (
              <circle
                key={i}
                cx={(i / 7) * 200}
                cy={64 - (v / max) * 56 - 4}
                r="2"
                fill="var(--plugu-gold)"
              />
            ))}
          </svg>
          <p className="mt-1 text-[10px] text-muted-foreground">Counts only paid orders. Earnings are net of platform & processing fees.</p>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
            <p className="text-xs font-semibold">Verified rating</p>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black">
              {profile && profile.rating_count > 0 ? profile.rating_avg.toFixed(1) : "—"}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {profile?.rating_count ?? 0} verified review{(profile?.rating_count ?? 0) === 1 ? "" : "s"}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Ratings are pulled from buyers who completed a paid order or booking with you.
          </p>
        </div>
        </>
        )}
      </section>
    </AppShell>
  );
}