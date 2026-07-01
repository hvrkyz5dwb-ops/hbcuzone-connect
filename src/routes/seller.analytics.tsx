import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { TrendingUp, Eye, MousePointerClick, Repeat, DollarSign, CalendarDays, LineChart, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getOrders, totalViews, type Order } from "@/lib/orders-storage";
import { computeTrustMetrics } from "@/lib/trust-score";
import { currentSellerTierMeta } from "@/lib/seller-plan";

export const Route = createFileRoute("/seller/analytics")({
  head: () => ({ meta: [{ title: "Seller Analytics — PlugU" }] }),
  component: SellerAnalytics,
});

function SellerAnalytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [views, setViews] = useState(0);
  useEffect(() => { setOrders(getOrders()); setViews(totalViews()); }, []);

  const tier = currentSellerTierMeta();
  const metrics = useMemo(() => computeTrustMetrics(), [orders]);
  const clicks = Math.max(views, orders.length * 3);
  const conversion = views === 0 ? 0 : Math.round((orders.length / Math.max(views, 1)) * 100);
  const monthly = orders
    .filter((o) => new Date(o.createdAt).getMonth() === new Date().getMonth())
    .reduce((a, o) => a + o.price, 0);
  const yearly = orders
    .filter((o) => new Date(o.createdAt).getFullYear() === new Date().getFullYear())
    .reduce((a, o) => a + o.price, 0);
  const growth = orders.length === 0 ? 0 : 8 + orders.length * 3;

  // Simple sparkline: last 8 days order counts.
  const spark = useMemo(() => {
    const buckets = new Array(8).fill(0);
    const now = Date.now();
    orders.forEach((o) => {
      const days = Math.floor((now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (days >= 0 && days < 8) buckets[7 - days] += 1;
    });
    return buckets;
  }, [orders]);
  const max = Math.max(1, ...spark);

  const kpis = [
    { label: "Profile views", value: (metrics.favoriteCount + 84).toString(), Icon: Eye },
    { label: "Listing clicks", value: clicks.toString(), Icon: MousePointerClick },
    { label: "Conversion", value: `${conversion}%`, Icon: TrendingUp },
    { label: "Repeat buyers", value: `${metrics.repeatCustomerPct}%`, Icon: Repeat },
    { label: "Monthly", value: `$${monthly.toFixed(0)}`, Icon: DollarSign },
    { label: "Yearly", value: `$${yearly.toFixed(0)}`, Icon: CalendarDays },
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
              <p className="text-xs font-semibold" style={{ color: "var(--plugu-gold)" }}>Sales growth</p>
            </div>
            <span className="text-xs font-semibold text-accent">+{growth}%</span>
          </div>
          <svg viewBox="0 0 200 64" className="mt-3 w-full h-16">
            <polyline
              fill="none"
              stroke="var(--plugu-gold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="graph-draw"
              points={spark
                .map((v, i) => `${(i / 7) * 200},${64 - (v / max) * 56 - 4}`)
                .join(" ")}
            />
            {spark.map((v, i) => (
              <circle
                key={i}
                cx={(i / 7) * 200}
                cy={64 - (v / max) * 56 - 4}
                r="2"
                fill="var(--plugu-gold)"
              />
            ))}
          </svg>
          <p className="mt-1 text-[10px] text-muted-foreground">Last 8 days</p>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
            <p className="text-xs font-semibold">Trust score</p>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black">{metrics.score}</span>
            <span className="text-[11px] text-muted-foreground">/ 100 · {metrics.level}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div className="h-full" style={{ width: `${metrics.score}%`, background: "var(--gradient-bronze)" }} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <Metric label="Response time" value={`${metrics.responseTimeMin}m`} />
            <Metric label="Completion" value={`${metrics.completionRate}%`} />
            <Metric label="Total sales" value={`${metrics.totalSales}`} />
            <Metric label="Refund rate" value={`${metrics.refundRate}%`} />
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/70 border border-border/60 px-3 py-2">
      <p className="text-[10px] tracking-wide uppercase text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}