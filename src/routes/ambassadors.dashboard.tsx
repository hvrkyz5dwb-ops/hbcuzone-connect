import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Users, Building2, TrendingUp, Trophy, Calendar } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { getAmbassador, MONTHLY_LEADERBOARD, ambassadorStats, type LeaderRow } from "@/lib/ambassadors";
import { getReferralState } from "@/lib/referrals";

export const Route = createFileRoute("/ambassadors/dashboard")({
  head: () => ({ meta: [{ title: "Ambassador Dashboard — PlugU" }] }),
  component: AmbassadorDashboard,
});

function AmbassadorDashboard() {
  const [state, setState] = useState(() => ({ app: getAmbassador(), ref: getReferralState() }));
  useEffect(() => {
    setState({ app: getAmbassador(), ref: getReferralState() });
  }, []);

  const { app, ref } = state;
  const stats = ambassadorStats(ref);

  return (
    <AppShell title="AMBASSADOR HUB">
      <section className="px-5 pt-5 slide-up">
        {app.status !== "approved" ? (
          <div className="rounded-2xl border border-dashed border-border p-5 text-center">
            <p className="text-sm font-semibold">You're not an official ambassador yet</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Apply to unlock exclusive perks. Preview mode below.
            </p>
            <Link
              to="/ambassadors"
              className="mt-3 inline-block tap px-4 py-2 rounded-full text-[11px] font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-bronze)" }}
            >
              Apply now
            </Link>
          </div>
        ) : (
          <div
            className="rounded-3xl p-5"
            style={{
              background: "linear-gradient(160deg, rgba(28,28,28,0.9), rgba(10,10,10,0.9))",
              border: "1px solid color-mix(in oklab, var(--plugu-gold) 45%, transparent)",
              boxShadow: "0 0 40px -14px rgba(244,201,106,0.55)",
            }}
          >
            <p className="text-[10px] tracking-[0.32em] uppercase" style={{ color: "var(--plugu-gold)" }}>
              Ambassador
            </p>
            <p className="mt-1 text-lg font-bold">{app.name}</p>
            <p className="text-[11px] text-muted-foreground">{app.campus}</p>
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Kpi Icon={Users} label="Students recruited" value={stats.recruits} />
          <Kpi Icon={Building2} label="Businesses" value={stats.businesses} />
          <Kpi Icon={TrendingUp} label="Campus growth" value={`+${stats.growth}%`} />
          <Kpi Icon={Trophy} label="Campus rank" value={`#${stats.campusRank}`} />
        </div>

        <div className="mt-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] tracking-wide uppercase text-muted-foreground">National rank</p>
            <span className="text-lg font-bold">#{stats.nationalRank.toLocaleString()}</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.min(100, Math.max(4, 100 - stats.nationalRank / 20))}%`,
                background: "var(--gradient-bronze)",
              }}
            />
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
            <p className="text-xs font-semibold">Monthly leaderboard</p>
          </div>
          <ul className="mt-2 divide-y divide-border/60">
            {MONTHLY_LEADERBOARD.map((r: LeaderRow, i: number) => (
              <li key={r.name} className="py-2 flex items-center gap-3">
                <span className="w-5 text-[11px] font-bold text-muted-foreground">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{r.name}</p>
                  <p className="text-[10px] text-muted-foreground">{r.campus}</p>
                </div>
                <span className="text-xs font-bold" style={{ color: "var(--plugu-gold)" }}>{r.points} pts</span>
              </li>
            ))}
          </ul>
        </div>

        <Link
          to="/referrals"
          className="mt-4 tap block text-center py-3 rounded-2xl bg-secondary border border-border text-xs font-semibold"
        >
          Manage referrals →
        </Link>
      </section>
    </AppShell>
  );
}

function Kpi({ Icon, label, value }: { Icon: typeof Users; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3.5 lift-card">
      <Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
      <p className="mt-2 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xl font-bold">{value}</p>
    </div>
  );
}