import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  dailyItems, dailyTabs, dailyGreetingTime,
  type DailyCategory, type DailyItem,
} from "@/lib/daily-data";
import { AiNewsFeed } from "@/components/AiNewsFeed";

function todayLabel() {
  try {
    return new Date().toLocaleDateString(undefined, {
      weekday: "long", month: "short", day: "numeric",
    });
  } catch { return ""; }
}

function accentStyles(accent: DailyItem["accent"]) {
  if (accent === "gold") return { color: "var(--plugu-gold)" };
  if (accent === "purple") return { color: "var(--plugu-purple)" };
  return undefined;
}

export function PluguDaily() {
  const [tab, setTab] = useState<DailyCategory>("For You");
  const [mountedLabel, setMountedLabel] = useState("");
  const [greet, setGreet] = useState("Welcome");

  useEffect(() => {
    setMountedLabel(todayLabel());
    setGreet(dailyGreetingTime());
  }, []);

  const fallbackItems = useMemo(() => {
    if (tab === "For You") return dailyItems.slice(0, 6);
    return dailyItems.filter((d) => d.category === tab);
  }, [tab]);

  const aiCategory =
    tab === "For You"
      ? "PlugU Daily — top stories Black college students should know today"
      : `PlugU Daily — ${tab} news for Black college students`;

  return (
    <section className="mt-7 px-5">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-4">
        <div
          className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-40"
          style={{ background: "var(--plugu-purple)" }}
        />
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              {mountedLabel}
            </p>
            <h2 className="mt-0.5 text-lg font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
              PlugU Daily
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {greet} — your campus briefing.
            </p>
          </div>
          <Link to="/news" className="text-[11px] text-primary shrink-0">See all</Link>
        </div>

        {/* Tabs */}
        <div className="mt-4 -mx-4 px-4 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dailyTabs.map((t) => {
            const active = t === tab;
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-medium tracking-wide transition-colors border ${
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* AI-generated daily feed */}
      <div className="mt-3">
        <AiNewsFeed
          category={aiCategory}
          count={6}
          fallback={fallbackItems.map((it) => ({
            id: it.id, headline: it.title, summary: it.summary,
            source: it.meta?.split("·").pop()?.trim() ?? "PlugU",
            time: it.meta?.split("·")[0]?.trim() ?? "now",
            tag: it.kind, emoji: "✨",
          }))}
        />
      </div>
    </section>
  );
}