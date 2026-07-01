import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Trophy, Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { nationalBoard, metricLabel, yourRank, type MetricKey, type CampusScore } from "@/lib/nationals";

export const Route = createFileRoute("/nationals")({
  head: () => ({ meta: [{ title: "National Campus Competition — PlugU" }] }),
  component: NationalsPage,
});

const METRIC_TABS: MetricKey[] = ["students", "businesses", "sales", "reviews", "referrals", "engagement"];

function NationalsPage() {
  const [metric, setMetric] = useState<MetricKey | "score">("score");
  const [rows, setRows] = useState<CampusScore[]>([]);
  const [me, setMe] = useState<{ rank: number; score: number; campus: string } | null>(null);

  useEffect(() => {
    setRows(nationalBoard());
    setMe(yourRank());
  }, []);

  const sorted = useMemo(() => {
    if (metric === "score") return rows;
    return [...rows].sort((a, b) => (b.metrics[metric] ?? 0) - (a.metrics[metric] ?? 0));
  }, [rows, metric]);

  return (
    <AppShell title="NATIONALS">
      <section className="px-5 pt-5 slide-up">
        <div
          className="rounded-3xl overflow-hidden border border-white/10 p-5"
          style={{ background: "linear-gradient(160deg, rgba(244,201,106,0.35), rgba(15,10,5,0.9))" }}
        >
          <p className="text-[10px] tracking-[0.32em] uppercase text-white/70">National Campus Competition</p>
          <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">The Race for the Grant</h1>
          <p className="mt-1 text-xs text-white/80">
            Every verified student, sale, review and referral counts toward your yard's score.
          </p>
          {me && (
            <div className="mt-4 rounded-2xl bg-black/40 border border-white/10 p-3.5">
              <p className="text-[10px] tracking-[0.24em] uppercase text-white/60">Your campus</p>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <p className="text-sm font-semibold">{me.campus}</p>
                  <p className="text-[11px] text-white/60">Score {me.score.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-white/60">Rank</p>
                  <p className="text-2xl font-black leading-none">#{me.rank}</p>
                </div>
              </div>
              <Link
                to="/awards"
                className="tap mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary"
              >
                <Trophy className="h-3 w-3" /> See year-end awards
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          <Chip active={metric === "score"} onClick={() => setMetric("score")} label="Overall" />
          {METRIC_TABS.map((k) => (
            <Chip key={k} active={metric === k} onClick={() => setMetric(k)} label={metricLabel(k)} />
          ))}
        </div>
      </section>

      <section className="px-5 pt-4 pb-10 space-y-2">
        {sorted.map((row, i) => {
          const value = metric === "score" ? row.score : row.metrics[metric];
          const display = metric === "sales" ? `${value} orders`
            : metric === "engagement" ? `${value}% engaged`
            : value.toLocaleString();
          return (
            <div key={row.slug}
              className="rounded-2xl border border-border bg-card p-3.5 flex items-center gap-3 lift-card"
              style={{ animation: `plugu-fade-up 0.35s ${i * 40}ms both` }}
            >
              <div className="h-9 w-9 grid place-items-center rounded-full font-black text-sm"
                style={{
                  background: i < 3
                    ? "radial-gradient(circle, rgba(244,201,106,0.4), rgba(60,40,10,0.6))"
                    : "var(--secondary)",
                  border: "1px solid color-mix(in oklab, var(--plugu-gold) 30%, transparent)",
                  color: i < 3 ? "#f4c96a" : "var(--foreground)",
                }}
              >
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{row.campus}</p>
                <p className="text-[11px] text-muted-foreground">{metric === "score" ? "Overall Score" : metricLabel(metric as MetricKey)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold">{display}</p>
                <p className="text-[10px] inline-flex items-center gap-1"
                  style={{ color: row.weekly > 0 ? "#22c55e" : row.weekly < 0 ? "#ef4444" : "var(--muted-foreground)" }}
                >
                  {row.weekly > 0 ? <TrendingUp className="h-3 w-3" /> : row.weekly < 0 ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  {Math.abs(row.weekly)}%
                </p>
              </div>
            </div>
          );
        })}

        <div className="pt-3 text-center text-[10px] text-muted-foreground inline-flex items-center gap-1 justify-center w-full">
          <Sparkles className="h-3 w-3" /> Updated live as students verify, sell, and refer.
        </div>
      </section>
    </AppShell>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`tap shrink-0 px-3.5 py-1.5 rounded-full border text-[11px] tracking-wide ${
        active ? "border-primary text-primary bg-secondary" : "border-border text-muted-foreground"
      }`}
    >
      {label}
    </button>
  );
}