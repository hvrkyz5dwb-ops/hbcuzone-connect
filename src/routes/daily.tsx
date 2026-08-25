import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Flame, Sparkles, ArrowRight, RefreshCw } from "lucide-react";
import { AppShell, SectionHeader } from "@/components/AppShell";
import {
  DAILY_SECTIONS, dailyItems, recordDailyOpen, streakLabel,
  type DailySectionKey,
} from "@/lib/daily-feed";
import { currentSeason } from "@/lib/seasons";

export const Route = createFileRoute("/daily")({
  head: () => ({ meta: [{ title: "PlugU Daily — News, wins & culture" }] }),
  component: DailyPage,
});

function DailyPage() {
  const [tab, setTab] = useState<DailySectionKey>("trending");
  const [streak, setStreak] = useState<{ count: number; longest: number } | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const s = recordDailyOpen();
    setStreak({ count: s.count, longest: s.longest });
  }, []);

  const season = useMemo(() => currentSeason(), []);
  const items = useMemo(() => dailyItems(tab, 4), [tab, tick]);
  const active = DAILY_SECTIONS.find((s) => s.key === tab)!;

  return (
    <AppShell title="PLUGU DAILY">
      <section className="px-5 pt-5 slide-up">
        <div className="rounded-3xl overflow-hidden border border-white/10 relative"
          style={{
            background: season?.gradient ?? "linear-gradient(160deg, rgba(244,201,106,0.28), rgba(15,10,5,0.9))",
          }}
        >
          <div className="p-5">
            <p className="text-[10px] tracking-[0.32em] uppercase text-white/70">
              {season ? `${season.emoji} ${season.label}` : "Today on The Yard"}
            </p>
            <h1 className="mt-1 text-2xl font-bold plugu-antique-wordmark">
              PlugU Daily
            </h1>
            <p className="mt-1 text-xs text-white/80">
              {season?.tagline ?? "News, wins, culture — refreshed every day."}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5 bg-black/40 border border-white/10">
                <Flame className="h-3.5 w-3.5 text-amber-300" />
                <span className="text-[11px] font-semibold">
                  {streak ? `${streak.count}-day streak · ${streakLabel(streak.count)}` : "Building streak…"}
                </span>
              </div>
              {season && (
                <Link to="/season/$slug" params={{ slug: season.key }} className="tap text-[11px] font-semibold text-white/90 inline-flex items-center gap-1">
                  Open campaign <ArrowRight className="h-3 w-3" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-5">
        <div tabIndex={0} className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {DAILY_SECTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setTab(s.key)}
              className={`tap shrink-0 px-3.5 py-1.5 rounded-full border text-[11px] tracking-wide ${
                tab === s.key
                  ? "border-primary text-primary bg-secondary"
                  : "border-border text-muted-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-5 pt-4 pb-8">
        <SectionHeader
          title={active.label}
          action="Refresh"
          onAction={() => setTick((t) => t + 1)}
        />
        <p className="text-[11px] text-muted-foreground mt-1">{active.hint}</p>

        <div className="mt-3 space-y-2.5">
          {items.map((it, i) => (
            <article
              key={it.id}
              className="rounded-2xl border border-border bg-card p-4 lift-card"
              style={{ animation: `plugu-fade-up 0.4s ${i * 60}ms both` }}
            >
              <div className="flex items-center gap-2">
                {it.tag && (
                  <span className="text-[10px] tracking-[0.2em] uppercase text-primary">{it.tag}</span>
                )}
                <Sparkles className="h-3 w-3 text-primary/70" />
              </div>
              <h3 className="mt-1 text-sm font-semibold leading-snug">{it.headline}</h3>
              <p className="mt-1 text-[12px] text-muted-foreground leading-relaxed">{it.body}</p>
            </article>
          ))}

          {items.length === 0 && (
            <div className="text-center py-10 border border-dashed border-border rounded-2xl">
              <RefreshCw className="mx-auto h-5 w-5 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">Nothing yet. Check back later.</p>
            </div>
          )}
        </div>
      </section>
    </AppShell>
  );
}