import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Search, Bookmark, Share2, ArrowRight, Filter, X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { AiNewsFeed } from "@/components/AiNewsFeed";
import {
  articles, newsTabs, newsFilters,
  type NewsTab, type NewsFilter,
} from "@/lib/news-data";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News Center — PlugU" },
      { name: "description", content: "Campus, HBCU, money, careers, scholarships, grants, culture and sports news — built for students." },
    ],
  }),
  component: NewsCenter,
});

const STORAGE_KEY = "plugu.saved-articles";

function NewsCenter() {
  const [tab, setTab] = useState<NewsTab>("Campus");
  const [filters, setFilters] = useState<Set<NewsFilter>>(new Set());
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch { return new Set(); }
  });

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return articles.filter((a) => {
      if (a.tab !== tab) return false;
      if (filters.size > 0 && !a.filters.some((f) => filters.has(f))) return false;
      if (query && !`${a.headline} ${a.summary} ${a.source}`.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [tab, filters, q]);

  function toggleFilter(f: NewsFilter) {
    setFilters((prev) => {
      const next = new Set(prev);
      next.has(f) ? next.delete(f) : next.add(f);
      return next;
    });
  }

  function toggleSave(id: string, headline: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from saved"); }
      else { next.add(id); toast(`Saved · ${headline}`); }
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  async function share(a: { headline: string; summary: string }) {
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: a.headline, text: a.summary });
      } else if (navigator?.clipboard) {
        await navigator.clipboard.writeText(`${a.headline} — ${a.summary}`);
        toast("Link copied to clipboard");
      }
    } catch {}
  }

  return (
    <AppShell title="NEWS">
      <section className="px-5 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Today</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight">News Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Short, useful briefings — across campus, money, careers & culture.
            </p>
          </div>
          <Link to="/saved" className="text-[11px] text-primary">Saved</Link>
        </div>

        {/* Search */}
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search news, scholarships, vendors…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="mt-5 -mx-0 px-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {newsTabs.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wide transition-colors border ${
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

      {/* Filters */}
      <div className="mt-3 px-5 flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        {newsFilters.map((f) => {
          const active = filters.has(f);
          return (
            <button
              key={f}
              onClick={() => toggleFilter(f)}
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] tracking-wide border transition-colors ${
                active
                  ? "border-primary/60 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              style={active ? { background: "color-mix(in oklab, var(--plugu-gold) 12%, transparent)" } : undefined}
            >
              {f}
            </button>
          );
        })}
        {filters.size > 0 && (
          <button onClick={() => setFilters(new Set())} className="shrink-0 text-[10px] text-muted-foreground underline">
            Clear
          </button>
        )}
      </div>

      {/* Articles */}
      <section className="mt-4 mb-4">
        {/* Live AI news for the active tab */}
        <div className="px-5 mb-4">
          <AiNewsFeed
            category={`${tab} news for Black college students${
              filters.size ? ` (focus: ${[...filters].join(", ")})` : ""
            }`}
            count={8}
            fallback={articles
              .filter((a) => a.tab === tab)
              .slice(0, 6)
              .map((a) => ({
                id: a.id, headline: a.headline, summary: a.summary,
                source: a.source, time: a.time, tag: a.tab, emoji: a.thumb,
              }))}
          />
        </div>

        {list.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No stories match"
            description="Try a different tab, fewer filters, or clear your search."
          />
        ) : (
          <ul className="px-5 space-y-3">
            {list.map((a) => {
              const isSaved = saved.has(a.id);
              return (
                <li key={a.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="flex gap-3 p-3">
                    <div
                      className="h-16 w-16 shrink-0 rounded-xl grid place-items-center text-2xl border border-border"
                      style={{ background: "color-mix(in oklab, var(--plugu-purple) 12%, transparent)" }}
                      aria-hidden
                    >
                      {a.thumb}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] tracking-widest uppercase"
                          style={{ color: a.accent === "purple" ? "var(--plugu-purple)" : "var(--plugu-gold)" }}
                        >
                          {a.tab}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">· {a.source} · {a.time}</span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold leading-snug">{a.headline}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{a.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSave(a.id, a.headline)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border transition-colors ${
                          isSaved ? "border-primary/60 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                        aria-pressed={isSaved}
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      <button
                        onClick={() => share(a)}
                        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border border-border text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    </div>
                    <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                      Read more <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}