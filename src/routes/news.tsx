import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  Search, Bookmark, Share2, X, ExternalLink, RefreshCw, WifiOff, Newspaper,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { getLiveNews, type LiveNewsItem } from "@/lib/live-feeds.functions";
import { useProfile } from "@/hooks/use-profile";
import { useCampusScope } from "@/hooks/use-campus-scope";

/**
 * News Center — every story here is a real, linked article pulled live from
 * Google News RSS. Nothing is written, summarised or invented by PlugU, and
 * every card carries its publisher name, publish time and outbound link so a
 * student can always tell where a story came from.
 */

const TABS = [
  "All HBCUs", "Campus", "Sports", "Culture", "Money", "Policy", "Business", "Careers", "Greek",
] as const;
type Tab = (typeof TABS)[number];

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "News Center — PlugU" },
      {
        name: "description",
        content:
          "Live HBCU, campus, money, careers and culture headlines from real publishers, with source attribution and links.",
      },
      { property: "og:title", content: "News Center — PlugU" },
      { property: "og:description", content: "Real, linked headlines for HBCU students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NewsCenter,
});

const STORAGE_KEY = "plugu.saved-articles";

function localTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      timeZoneName: "short",
    });
  } catch {
    return "";
  }
}

function NewsCenter() {
  const [tab, setTab] = useState<Tab>("All HBCUs");
  const [schoolOnly, setSchoolOnly] = useState(false);
  const [q, setQ] = useState("");
  const { profile } = useProfile();
  const { campusName, homeCampusName } = useCampusScope();
  const school = homeCampusName ?? (campusName !== "Your campus" ? campusName : null) ?? profile?.school_name ?? null;

  const fn = useServerFn(getLiveNews);
  const scoped = schoolOnly && school ? school : undefined;

  const { data, isLoading, isFetching, refetch, error } = useQuery({
    queryKey: ["news-rss", tab, scoped ?? ""],
    queryFn: () => fn({ data: { topic: tab, school: scoped, count: 20 } }),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const [saved, setSaved] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch { return new Set(); }
  });

  const list = useMemo(() => {
    const items = data?.items ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((a) =>
      `${a.headline} ${a.summary} ${a.source}`.toLowerCase().includes(query),
    );
  }, [data, q]);

  function toggleSave(id: string, headline: string) {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from saved"); }
      else { next.add(id); toast(`Saved · ${headline}`); }
      try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next])); } catch {}
      return next;
    });
  }

  async function share(a: LiveNewsItem) {
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: a.headline, text: a.source, url: a.url });
      } else if (navigator?.clipboard) {
        await navigator.clipboard.writeText(a.url);
        toast("Link copied to clipboard");
      }
    } catch {}
  }

  const offline = !!data?.error || !!error;

  return (
    <AppShell title="NEWS">
      <section className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">Live headlines</p>
            <h1 className="mt-0.5 text-2xl font-bold tracking-tight">News Center</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real articles from outside publishers. Tap any story to read it at the source.
            </p>
          </div>
          <Link
            to="/saved"
            className="tap inline-flex shrink-0 items-center justify-center rounded-full px-3 text-[11px] text-primary"
          >
            Saved
          </Link>
        </div>

        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-2xl bg-secondary border border-border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search these headlines…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
          {q && (
            <button onClick={() => setQ("")} aria-label="Clear search" className="hit">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </section>

      <div
        tabIndex={0}
        className="mt-5 px-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-[11px] font-medium tracking-wide transition-colors border ${
              t === tab
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-3 px-5 flex items-center justify-between gap-3">
        {school ? (
          <button
            onClick={() => setSchoolOnly((v) => !v)}
            aria-pressed={schoolOnly}
            className={`shrink-0 rounded-full px-3 py-1 text-[10px] tracking-wide border transition-colors ${
              schoolOnly ? "border-primary/60 text-primary" : "border-border text-muted-foreground"
            }`}
          >
            Mentions {school}
          </button>
        ) : (
          <span className="text-[10px] text-muted-foreground">
            Pick a school to filter headlines to your campus.
          </span>
        )}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="hit inline-flex items-center gap-1 text-[11px] text-accent disabled:opacity-50"
        >
          <RefreshCw className={`h-3 w-3 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing" : "Refresh"}
        </button>
      </div>

      <section className="mt-4 mb-4">
        {isLoading ? (
          <ul className="px-5 space-y-3" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="h-24 rounded-2xl border border-border bg-card/60 animate-pulse" />
            ))}
          </ul>
        ) : offline ? (
          <EmptyState
            icon={WifiOff}
            title="Headlines didn't load"
            description="We couldn't reach the news source. Check your connection and try again."
            action={
              <button
                onClick={() => void refetch()}
                className="hit rounded-full bg-[image:var(--gradient-bronze)] px-5 py-2 text-xs font-semibold text-primary-foreground"
              >
                Try again
              </button>
            }
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title="No stories match"
            description="Try another topic or clear your search."
          />
        ) : (
          <ul className="px-5 space-y-3">
            {list.map((a) => {
              const isSaved = saved.has(a.id);
              return (
                <li key={a.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 p-3 active:bg-secondary/60"
                  >
                    <div
                      className="h-16 w-16 shrink-0 rounded-xl grid place-items-center text-2xl border border-border"
                      style={{ background: "color-mix(in oklab, var(--plugu-gold) 10%, transparent)" }}
                      aria-hidden
                    >
                      {a.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] tracking-widest uppercase"
                          style={{ color: "var(--plugu-gold)" }}
                        >
                          {a.tag}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          · {a.source}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-semibold leading-snug">{a.headline}</p>
                      {a.summary && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.summary}</p>
                      )}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Published {localTime(a.publishedAt)}
                      </p>
                    </div>
                  </a>
                  <div className="flex items-center justify-between border-t border-border/60 px-3 py-2">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSave(a.id, a.headline)}
                        className={`hit inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border transition-colors ${
                          isSaved ? "border-primary/60 text-primary" : "border-border text-muted-foreground"
                        }`}
                        aria-pressed={isSaved}
                      >
                        <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                        {isSaved ? "Saved" : "Save"}
                      </button>
                      <button
                        onClick={() => void share(a)}
                        className="hit inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] border border-border text-muted-foreground"
                      >
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                    </div>
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hit inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                    >
                      Read at {a.source.slice(0, 18)} <ExternalLink className="h-3 w-3" />
                    </a>
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
