import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import {
  dailyItems, dailyTabs, dailyGreetingTime,
  type DailyCategory, type DailyItem,
} from "@/lib/daily-data";

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

  const items = useMemo(() => {
    if (tab === "For You") return dailyItems.slice(0, 6);
    return dailyItems.filter((d) => d.category === tab);
  }, [tab]);

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
          <button className="text-[11px] text-primary shrink-0">See all</button>
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

      {/* Items */}
      <ul className="mt-3 space-y-2">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <li
              key={it.id}
              className="group flex items-start gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors"
            >
              <div
                className="h-10 w-10 shrink-0 rounded-xl grid place-items-center border border-border"
                style={{
                  background:
                    "color-mix(in oklab, var(--plugu-purple) 12%, transparent)",
                }}
              >
                <Icon className="h-4 w-4" style={{ color: "var(--plugu-gold)" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] tracking-widest uppercase"
                    style={accentStyles(it.accent)}
                  >
                    {it.kind}
                  </span>
                  {it.meta && (
                    <span className="text-[10px] text-muted-foreground">· {it.meta}</span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-snug truncate">{it.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                  {it.summary}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground self-center shrink-0 transition-transform group-hover:translate-x-0.5" />
            </li>
          );
        })}
      </ul>
    </section>
  );
}