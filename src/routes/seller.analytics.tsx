import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, ShoppingBag, DollarSign, CalendarDays, LineChart, Zap, Radio, Heart, Clock } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ErrorState, PageLoader } from "@/components/QueryStates";
import { PlugScoreBadge } from "@/components/PlugScoreBadge";
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
      const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
      const [ordersRes, listingsRes, myListingsRes, dropsRes, availRes] = await Promise.all([
        supabase
          .from("orders")
          .select("id,listing_id,status,payment_status,total_cents,platform_fee_cents,processing_fee_cents,created_at,buyer_user_id")
          .eq("seller_user_id", uid)
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("listings")
          .select("id,status", { count: "exact", head: true })
          .eq("seller_user_id", uid),
        supabase
          .from("listings")
          .select("id,title,price_cents,favorite_count,status")
          .eq("seller_user_id", uid)
          .limit(100),
        supabase
          .from("drops")
          .select("id,body,is_flash,quantity_limit,quantity_claimed,expires_at,created_at")
          .eq("seller_user_id", uid)
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("seller_availability")
          .select("id,service_label,zone_name,is_active,available_until,updated_at")
          .eq("seller_user_id", uid)
          .order("updated_at", { ascending: false })
          .limit(20),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (listingsRes.error) throw listingsRes.error;
      return {
        orders: ordersRes.data ?? [],
        listingCount: listingsRes.count ?? 0,
        listings: myListingsRes.data ?? [],
        drops: dropsRes.data ?? [],
        availability: availRes.data ?? [],
      };
    },
  });

  const orders = q.data?.orders ?? [];
  const listingCount = q.data?.listingCount ?? 0;
  const myListings = q.data?.listings ?? [];
  const drops = q.data?.drops ?? [];
  const availability = q.data?.availability ?? [];

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

  // Live-layer performance — drops, flash claims, availability, top listings.
  const live = useMemo(() => {
    const nowMs = Date.now();
    const claimed = drops.reduce((n, d) => n + (d.quantity_claimed ?? 0), 0);
    const offered = drops.reduce((n, d) => n + (d.quantity_limit ?? 0), 0);
    const flashCount = drops.filter((d) => d.is_flash).length;
    const sellThrough = offered > 0 ? Math.round((claimed / offered) * 100) : null;
    const liveNow = availability.filter(
      (a) => a.is_active && (!a.available_until || new Date(a.available_until).getTime() > nowMs),
    );

    const ordersByListing = new Map<string, number>();
    for (const o of orders) {
      const paid = o.payment_status === "captured" || o.status === "completed";
      if (!paid) continue;
      const key = (o as { listing_id?: string | null }).listing_id;
      if (key) ordersByListing.set(key, (ordersByListing.get(key) ?? 0) + 1);
    }
    const top = myListings
      .map((l) => ({
        id: l.id,
        title: l.title,
        saves: l.favorite_count ?? 0,
        sales: ordersByListing.get(l.id) ?? 0,
        price: (l.price_cents ?? 0) / 100,
      }))
      .sort((a, b) => b.sales - a.sales || b.saves - a.saves)
      .slice(0, 5)
      .filter((l) => l.sales > 0 || l.saves > 0);

    // Best hour of day for paid orders (real timestamps only).
    const hours = new Array(24).fill(0);
    for (const o of orders) {
      if (o.payment_status === "captured" || o.status === "completed") {
        hours[new Date(o.created_at).getHours()] += 1;
      }
    }
    const peak = hours.some((h) => h > 0) ? hours.indexOf(Math.max(...hours)) : null;
    const fmtHour = (h: number) => `${((h + 11) % 12) + 1}${h < 12 ? "am" : "pm"}`;

    return {
      dropCount: drops.length, flashCount, claimed, offered, sellThrough,
      liveNowCount: liveNow.length, liveNow, top,
      peakLabel: peak === null ? null : `${fmtHour(peak)}–${fmtHour((peak + 1) % 24)}`,
    };
  }, [drops, availability, myListings, orders]);

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
          <PageLoader message="Crunching your numbers…" />
        ) : q.isError ? (
          <ErrorState
            title="Analytics didn't load"
            description="We couldn't reach your sales stats. Check your connection and try again."
            onRetry={() => void q.refetch()}
          />
        ) : stats.totalCount === 0 && drops.length === 0 && availability.length === 0 ? (
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
          {profile && <div className="mt-2"><PlugScoreBadge profile={profile} /></div>}
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

        {/* Live layer — Available Now + Drops performance */}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Radio className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
            <p className="text-xs font-semibold">Live layer — last 30 days</p>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-border/60 p-2.5">
              <p className="text-lg font-bold">{live.dropCount}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Drops posted</p>
            </div>
            <div className="rounded-xl border border-border/60 p-2.5">
              <p className="text-lg font-bold">{live.claimed}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Claims</p>
            </div>
            <div className="rounded-xl border border-border/60 p-2.5">
              <p className="text-lg font-bold">{live.sellThrough === null ? "—" : `${live.sellThrough}%`}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Sell-through</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
              <Zap className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} /> {live.flashCount} flash drop{live.flashCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
              <Radio className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} />
              {live.liveNowCount > 0 ? `${live.liveNowCount} live now` : "Not live right now"}
            </span>
            {live.peakLabel && (
              <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
                <Clock className="h-3 w-3" style={{ color: "var(--plugu-gold)" }} /> Peak {live.peakLabel}
              </span>
            )}
          </div>
          {live.dropCount === 0 && (
            <Link to="/seller" className="mt-3 inline-flex text-[11px] font-semibold text-primary">
              Go live or post a drop →
            </Link>
          )}
        </div>

        {/* Top performing listings */}
        {live.top.length > 0 && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
              <p className="text-xs font-semibold">Top listings</p>
            </div>
            <ul className="mt-3 space-y-2">
              {live.top.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3">
                  <Link to="/checkout/$listingId" params={{ listingId: l.id }} className="min-w-0 flex-1 truncate text-sm">
                    {l.title}
                  </Link>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {l.sales} sold · {l.saves} saved
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        </>
        )}
      </section>
    </AppShell>
  );
}